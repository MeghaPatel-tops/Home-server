const {
  Booking,
  Service,
  Category,
  Zone,
  ProviderZone,
  Provider,
  Technician,
  DispatchAttempt,
  BookingMedia,
  ChangeOrder,
  Payment,
  Invoice,
} = require('../models');
const { BOOKING_STATUS, PAYMENT_STATUS, DISPATCH_STATUS, CHANGE_ORDER_STATUS } = require('../core/constants');
const { generateOtp, hashOtp, verifyOtpHash } = require('../core/security/otp');
const { BadRequestError, NotFoundError, ForbiddenError, ConflictError } = require('../core/errors');
const config = require('../config/env');

class BookingService {
  /**
   * Create Booking (Customer)
   */
  async createBooking(customerId, bookingData) {
    const service = await Service.findById(bookingData.service_id).populate('categoryId');
    if (!service || !service.isActive) {
      throw new NotFoundError('Service not found or unavailable');
    }

    const basePricePaise = service.basePricePaise;
    const travelFeePaise = 5000; // Flat travel fee ₹50.00
    const taxableAmount = basePricePaise + travelFeePaise;
    const gstAmountPaise = Math.round(taxableAmount * (config.GST_PERCENT / 100));
    const totalAmountPaise = taxableAmount + gstAmountPaise;

    // Generate Booking Number BK-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `BK-${dateStr}-${rand}`;

    // Generate 6-digit start and end OTPs
    const plaintextStartOtp = generateOtp(6);
    const plaintextEndOtp = generateOtp(6);

    const booking = await Booking.create({
      bookingNumber,
      customerId,
      serviceId: service._id,
      categoryId: service.categoryId._id,
      address: {
        houseDetails: bookingData.address.house_details,
        streetLocality: bookingData.address.street_locality,
        landmark: bookingData.address.landmark,
        city: bookingData.address.city,
        state: bookingData.address.state,
        pincode: bookingData.address.pincode,
      },
      scheduledAt: new Date(bookingData.scheduled_at),
      bookingStatus: BOOKING_STATUS.PENDING_ASSIGNMENT,
      paymentStatus: bookingData.payment_preference === 'CASH' ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.PENDING,
      paymentPreference: bookingData.payment_preference,
      basePricePaise,
      travelFeePaise,
      gstAmountPaise,
      totalAmountPaise,
      specialInstructions: bookingData.special_instructions,
      startOtpHmac: hashOtp(`start:${bookingNumber}:${customerId}:${plaintextStartOtp}`),
      endOtpHmac: hashOtp(`end:${bookingNumber}:${customerId}:${plaintextEndOtp}`),
      plaintextStartOtp,
      plaintextEndOtp,
      otpGeneratedAt: new Date(),
    });

    // Auto-dispatch: find active providers in pincode zone
    this.triggerDispatch(booking).catch((err) => console.error('Dispatch error:', err));

    return this.formatCustomerBooking(booking);
  }

  async triggerDispatch(booking) {
    const zone = await Zone.findOne({ pincode: booking.address.pincode, isActive: true });
    if (!zone) return;

    const providerZones = await ProviderZone.find({ zoneId: zone._id, isActive: true });
    const providerIds = providerZones.map((pz) => pz.providerId);

    const activeProviders = await Provider.find({
      _id: { $in: providerIds },
      kycStatus: 'APPROVED',
      categories: booking.categoryId,
    });

    const expiresAt = new Date(Date.now() + config.PROVIDER_ACCEPTANCE_SLA_MINUTES * 60 * 1000);
    for (const provider of activeProviders) {
      await DispatchAttempt.create({
        bookingId: booking._id,
        providerId: provider._id,
        status: DISPATCH_STATUS.OFFERED,
        expiresAt,
      });
    }
  }

  async getCustomerBookings(customerId, status = null) {
    const query = { customerId };
    if (status) query.bookingStatus = status;

    const bookings = await Booking.find(query)
      .populate('serviceId', 'name slug basePricePaise')
      .populate('categoryId', 'name slug')
      .populate('providerId', 'businessName')
      .populate({
        path: 'technicianId',
        populate: { path: 'userId', select: 'name phone' },
      })
      .sort({ createdAt: -1 });

    return bookings.map((b) => this.formatCustomerBooking(b));
  }

  async getBookingById(bookingId, user) {
    const booking = await Booking.findById(bookingId)
      .populate('serviceId', 'name slug basePricePaise')
      .populate('categoryId', 'name slug')
      .populate('providerId', 'businessName bankDetails')
      .populate({
        path: 'technicianId',
        populate: { path: 'userId', select: 'name phone' },
      });

    if (!booking) throw new NotFoundError('Booking not found');

    // Access control
    if (user.role === 'CUSTOMER' && booking.customerId.toString() !== user._id.toString()) {
      throw new ForbiddenError('Unauthorized to view this booking');
    }

    const media = await BookingMedia.find({ bookingId: booking._id });
    const changeOrders = await ChangeOrder.find({ bookingId: booking._id });

    if (user.role === 'CUSTOMER') {
      return this.formatCustomerBooking(booking, media, changeOrders);
    }

    return this.formatWorkerBooking(booking, media, changeOrders);
  }

  async cancelBooking(bookingId, customerId, reason) {
    const booking = await Booking.findOne({ _id: bookingId, customerId });
    if (!booking) throw new NotFoundError('Booking not found');

    if (
      [
        BOOKING_STATUS.IN_PROGRESS,
        BOOKING_STATUS.AWAITING_CONFIRMATION,
        BOOKING_STATUS.COMPLETED,
      ].includes(booking.bookingStatus)
    ) {
      throw new BadRequestError('Cannot cancel booking in current status');
    }

    booking.bookingStatus = BOOKING_STATUS.CANCELLED_BY_CUSTOMER;
    booking.cancellationReason = reason;
    await booking.save();

    await DispatchAttempt.updateMany({ bookingId }, { status: DISPATCH_STATUS.EXPIRED });
    return { success: true, message: 'Booking cancelled successfully' };
  }

  async resendOtp(bookingId, customerId) {
    const booking = await Booking.findOne({ _id: bookingId, customerId });
    if (!booking) throw new NotFoundError('Booking not found');

    // Cooldown check
    if (booking.otpGeneratedAt) {
      const diffSecs = (Date.now() - new Date(booking.otpGeneratedAt).getTime()) / 1000;
      if (diffSecs < config.OTP_RESEND_COOLDOWN_SECONDS) {
        throw new BadRequestError(`Please wait ${Math.ceil(config.OTP_RESEND_COOLDOWN_SECONDS - diffSecs)}s before requesting a new OTP`);
      }
    }

    const newStart = generateOtp(6);
    const newEnd = generateOtp(6);
    booking.plaintextStartOtp = newStart;
    booking.plaintextEndOtp = newEnd;
    booking.startOtpHmac = hashOtp(`start:${booking.bookingNumber}:${customerId}:${newStart}`);
    booking.endOtpHmac = hashOtp(`end:${booking.bookingNumber}:${customerId}:${newEnd}`);
    booking.otpGeneratedAt = new Date();
    booking.otpAttempts = 0;
    booking.otpLockoutUntil = null;
    await booking.save();

    return { success: true, message: 'New OTPs generated successfully.' };
  }

  // --- Provider Workflows ---
  async getProviderQueue(providerId) {
    const attempts = await DispatchAttempt.find({
      providerId,
      status: DISPATCH_STATUS.OFFERED,
      expiresAt: { $gt: new Date() },
    }).populate({
      path: 'bookingId',
      populate: [{ path: 'serviceId' }, { path: 'categoryId' }],
    });

    return attempts.map((a) => a.bookingId).filter(Boolean);
  }

  async acceptDispatch(providerId, bookingId) {
    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, bookingStatus: BOOKING_STATUS.PENDING_ASSIGNMENT },
      {
        providerId,
        bookingStatus: BOOKING_STATUS.PROVIDER_ACCEPTED,
      },
      { new: true }
    );

    if (!booking) {
      throw new ConflictError('Booking offer is no longer available or was accepted by another provider');
    }

    await DispatchAttempt.updateOne(
      { bookingId, providerId },
      { status: DISPATCH_STATUS.ACCEPTED, respondedAt: new Date() }
    );
    await DispatchAttempt.updateMany(
      { bookingId, providerId: { $ne: providerId } },
      { status: DISPATCH_STATUS.EXPIRED }
    );

    return booking;
  }

  async rejectDispatch(providerId, bookingId) {
    await DispatchAttempt.updateOne(
      { bookingId, providerId },
      { status: DISPATCH_STATUS.REJECTED, respondedAt: new Date() }
    );
    return { success: true, message: 'Offer rejected' };
  }

  async assignTechnician(providerId, bookingId, technicianId) {
    const booking = await Booking.findOne({ _id: bookingId, providerId });
    if (!booking) throw new NotFoundError('Booking not found');

    const tech = await Technician.findOne({ _id: technicianId, providerId, isActive: true });
    if (!tech) throw new NotFoundError('Active technician not found');

    booking.technicianId = tech._id;
    booking.bookingStatus = BOOKING_STATUS.ASSIGNED;
    await booking.save();

    return booking;
  }

  // --- Technician Workflows ---
  async getTechnicianJobs(technicianId) {
    const jobs = await Booking.find({ technicianId })
      .populate('serviceId', 'name basePricePaise')
      .populate('categoryId', 'name')
      .populate('customerId', 'name phone')
      .sort({ scheduledAt: 1 });

    return jobs.map((j) => this.formatWorkerBooking(j));
  }

  async updateTechnicianJobStatus(technicianId, bookingId, newStatus) {
    const allowed = [BOOKING_STATUS.EN_ROUTE, BOOKING_STATUS.ARRIVED];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestError('Invalid status transition for this endpoint');
    }

    const booking = await Booking.findOne({ _id: bookingId, technicianId });
    if (!booking) throw new NotFoundError('Booking not found');

    booking.bookingStatus = newStatus;
    await booking.save();
    return booking;
  }

  async verifyStartOtp(technicianId, bookingId, enteredOtp) {
    const booking = await Booking.findOne({ _id: bookingId, technicianId });
    if (!booking) throw new NotFoundError('Booking not found');

    if (booking.otpLockoutUntil && booking.otpLockoutUntil > new Date()) {
      throw new ForbiddenError('Too many failed OTP attempts. Locked out for 15 minutes.');
    }

    const isValid = verifyOtpHash(
      `start:${booking.bookingNumber}:${booking.customerId}:${enteredOtp}`,
      booking.startOtpHmac
    );

    if (!isValid) {
      booking.otpAttempts += 1;
      if (booking.otpAttempts >= config.OTP_MAX_ATTEMPTS) {
        booking.otpLockoutUntil = new Date(Date.now() + config.OTP_LOCKOUT_MINUTES * 60 * 1000);
      }
      await booking.save();
      throw new BadRequestError('Invalid Start OTP entered');
    }

    booking.bookingStatus = BOOKING_STATUS.IN_PROGRESS;
    booking.otpAttempts = 0;
    await booking.save();

    return { success: true, message: 'Start OTP verified! Work is now IN_PROGRESS.' };
  }

  async submitChangeOrder(technicianId, bookingId, { description, additional_amount_paise }) {
    const booking = await Booking.findOne({ _id: bookingId, technicianId });
    if (!booking) throw new NotFoundError('Booking not found');

    const gstAmountPaise = Math.round(additional_amount_paise * (config.GST_PERCENT / 100));
    const totalAmountPaise = additional_amount_paise + gstAmountPaise;

    const changeOrder = await ChangeOrder.create({
      bookingId: booking._id,
      technicianId,
      description,
      additionalAmountPaise: additional_amount_paise,
      gstAmountPaise,
      totalAmountPaise,
      approvalStatus: CHANGE_ORDER_STATUS.PENDING,
    });

    return changeOrder;
  }

  async verifyCompletionOtp(technicianId, bookingId, enteredOtp) {
    const booking = await Booking.findOne({ _id: bookingId, technicianId });
    if (!booking) throw new NotFoundError('Booking not found');

    const isValid = verifyOtpHash(
      `end:${booking.bookingNumber}:${booking.customerId}:${enteredOtp}`,
      booking.endOtpHmac
    );

    if (!isValid) {
      throw new BadRequestError('Invalid Completion OTP entered');
    }

    booking.bookingStatus = BOOKING_STATUS.COMPLETED;
    await booking.save();

    // Trigger Ledger and GST Invoice settlement
    const PaymentService = require('./payment.service');
    PaymentService.settleBookingPaymentAndLedger(booking).catch((err) =>
      console.error('Settlement error:', err)
    );

    return { success: true, message: 'Completion OTP verified! Booking marked as COMPLETED.' };
  }

  // --- Formatting Helpers (Enforces OTP Protection) ---
  formatCustomerBooking(b, media = [], changeOrders = []) {
    return {
      id: b._id,
      booking_number: b.bookingNumber,
      service_id: b.serviceId?._id || b.serviceId,
      service_name: b.serviceId?.name,
      category_name: b.categoryId?.name,
      address: b.address,
      scheduled_at: b.scheduledAt,
      booking_status: b.bookingStatus,
      payment_status: b.paymentStatus,
      payment_preference: b.paymentPreference,
      base_price_paise: b.basePricePaise,
      travel_fee_paise: b.travelFeePaise,
      gst_amount_paise: b.gstAmountPaise,
      total_amount_paise: b.totalAmountPaise,
      special_instructions: b.specialInstructions,
      // Customer sees plaintext OTPs
      start_otp: b.plaintextStartOtp,
      end_otp: b.plaintextEndOtp,
      provider: b.providerId ? { id: b.providerId._id, business_name: b.providerId.businessName } : null,
      technician: b.technicianId ? { id: b.technicianId._id, name: b.technicianId.userId?.name, phone: b.technicianId.userId?.phone } : null,
      media,
      change_orders: changeOrders,
      has_review: b.hasReview,
      created_at: b.createdAt,
    };
  }

  formatWorkerBooking(b, media = [], changeOrders = []) {
    return {
      id: b._id,
      booking_number: b.bookingNumber,
      customer_name: b.customerId?.name,
      customer_phone: b.customerId?.phone,
      service_name: b.serviceId?.name,
      category_name: b.categoryId?.name,
      address: b.address,
      scheduled_at: b.scheduledAt,
      booking_status: b.bookingStatus,
      payment_status: b.paymentStatus,
      total_amount_paise: b.totalAmountPaise,
      special_instructions: b.specialInstructions,
      // OTPs are STRICTLY OMITTED for workers
      media,
      change_orders: changeOrders,
      created_at: b.createdAt,
    };
  }
}

module.exports = new BookingService();
