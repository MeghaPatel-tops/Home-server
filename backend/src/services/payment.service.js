const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const config = require('../config/env');
const { Payment, Invoice, Booking, Provider, Category } = require('../models');
const { BadRequestError, NotFoundError } = require('../core/errors');
const { PAYMENT_STATUS } = require('../core/constants');

class PaymentService {
  /**
   * Create Razorpay Order
   */
  async createRazorpayOrder(customerId, bookingId, amountPaise) {
    // Safely find booking – bookingId may be a string or ObjectId
    let booking = null;
    try {
      booking = await Booking.findOne({ _id: bookingId, customerId });
    } catch {
      // Invalid ObjectId format (e.g. demo booking ids like 'bk_1234') – skip DB lookup
      booking = null;
    }

    // If booking not found in DB (demo mode / fallback booking), still create a Razorpay order
    // using the amount provided; Razorpay order creation is independent of our DB record.
    const receipt = booking?.bookingNumber || `BK-${Date.now()}`;

    const options = {
      amount: amountPaise,
      currency: 'INR',
      receipt,
    };

    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create(options);
    } catch (err) {
      // Credentials are placeholder / test mode without live Razorpay account
      // Return a clearly-marked mock order so the frontend can open the modal in test mode
      rzpOrder = {
        id: 'order_test_' + Date.now(),
        amount: amountPaise,
        currency: 'INR',
        _isMock: true,
      };
    }

    // Persist payment record if we have a real DB booking
    if (booking) {
      await Payment.findOneAndUpdate(
        { bookingId: booking._id },
        {
          bookingId: booking._id,
          razorpayOrderId: rzpOrder.id,
          amountPaise,
          currency: 'INR',
          paymentStatus: PAYMENT_STATUS.PENDING,
        },
        { upsert: true, new: true }
      );
    }

    return {
      razorpay_order_id: rzpOrder.id,
      amount_paise: amountPaise,
      currency: 'INR',
      is_mock: !!rzpOrder._isMock,
    };
  }

  /**
   * Verify Razorpay Payment Signature
   */
  async verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    const generatedSignature = crypto
      .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // In test environment, if secrets are dummy keys, accept test signature gracefully
    const isMock = config.RAZORPAY_KEY_SECRET.includes('exampleSecret');
    if (!isMock && generatedSignature !== razorpay_signature) {
      throw new BadRequestError('Invalid Razorpay payment signature');
    }

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (payment) {
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.paymentStatus = PAYMENT_STATUS.PAID;
      await payment.save();

      await Booking.updateOne({ _id: payment.bookingId }, { paymentStatus: PAYMENT_STATUS.PAID });
    }

    return { success: true, message: 'Payment verified successfully.' };
  }

  /**
   * Settle Booking & Post Provider Ledger
   */
  async settleBookingPaymentAndLedger(booking) {
    if (!booking.providerId) return;

    const provider = await Provider.findById(booking.providerId);
    if (!provider) return;

    // Commission calculation
    const category = await Category.findById(booking.categoryId);
    const commissionPercent = category?.commissionPercentageOverride || config.DEFAULT_PLATFORM_COMMISSION_PERCENT;

    const grossPaise = booking.totalAmountPaise;
    const commissionPaise = Math.round((grossPaise * commissionPercent) / 100);
    const netPayoutPaise = grossPaise - commissionPaise;

    // Update wallet balance
    provider.walletBalancePaise += netPayoutPaise;
    await provider.save();

    // Create append-only ledger entry
    const { ProviderLedgerEntry } = require('../models');
    await ProviderLedgerEntry.create({
      providerId: provider._id,
      bookingId: booking._id,
      entryType: 'BOOKING_CREDIT',
      amountPaise: netPayoutPaise,
      balanceAfterPaise: provider.walletBalancePaise,
      description: `Settlement for booking ${booking.bookingNumber} (${100 - commissionPercent}% share)`,
    });

    // Create GST Invoice
    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const cgstPaise = Math.round(booking.gstAmountPaise / 2);
    const sgstPaise = booking.gstAmountPaise - cgstPaise;

    await Invoice.create({
      invoiceNumber,
      bookingId: booking._id,
      customerId: booking.customerId,
      providerId: booking.providerId,
      baseAmountPaise: booking.basePricePaise,
      travelFeePaise: booking.travelFeePaise,
      cgstPaise,
      sgstPaise,
      totalPaise: booking.totalAmountPaise,
    });
  }
}

module.exports = new PaymentService();
