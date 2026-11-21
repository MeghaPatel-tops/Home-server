const mongoose = require('mongoose');
const { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_PREFERENCE } = require('../core/constants');

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      default: null,
      index: true,
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technician',
      default: null,
      index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    address: {
      houseDetails: { type: String, required: true },
      streetLocality: { type: String, required: true },
      landmark: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true, index: true },
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    bookingStatus: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING_ASSIGNMENT,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    paymentPreference: {
      type: String,
      enum: Object.values(PAYMENT_PREFERENCE),
      default: PAYMENT_PREFERENCE.ONLINE,
    },
    basePricePaise: {
      type: Number,
      required: true,
      min: 0,
    },
    travelFeePaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    gstAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    specialInstructions: {
      type: String,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    // OTP verification fields (HMAC digests stored, not plaintext)
    startOtpHmac: {
      type: String,
      default: null,
    },
    endOtpHmac: {
      type: String,
      default: null,
    },
    otpGeneratedAt: {
      type: Date,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    otpLockoutUntil: {
      type: Date,
      default: null,
    },
    // Plaintext OTP returned ONLY to customer when requesting booking details
    plaintextStartOtp: {
      type: String,
      default: null,
    },
    plaintextEndOtp: {
      type: String,
      default: null,
    },
    hasReview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'bookings',
  }
);

bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ providerId: 1, bookingStatus: 1 });
bookingSchema.index({ technicianId: 1, bookingStatus: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
