const paymentService = require('../services/payment.service');
const { Invoice } = require('../models');
const { NotFoundError } = require('../core/errors');

const createOrder = async (req, res, next) => {
  try {
    const { booking_id, amount_paise } = req.body;
    const result = await paymentService.createRazorpayOrder(
      req.user._id,
      booking_id,
      amount_paise
    );
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const result = await paymentService.verifyPaymentSignature(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const handleWebhook = async (req, res, next) => {
  try {
    // Process webhook event idempotently
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ bookingId: req.params.id })
      .populate('customerId', 'name email phone')
      .populate('providerId', 'businessName gstNumber');

    if (!invoice) throw new NotFoundError('Invoice not yet generated for this booking');
    res.status(200).json({ status: 'success', data: invoice });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  getInvoice,
};
