const mongoose = require('mongoose');
const { PAYMENT_STATUS, PAYMENT_PREFERENCE } = require('../core/constants');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      default: null,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
      index: true,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_PREFERENCE),
      default: PAYMENT_PREFERENCE.ONLINE,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    gatewayFeePaise: {
      type: Number,
      default: 0,
    },
    taxPaise: {
      type: Number,
      default: 0,
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'payments',
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
