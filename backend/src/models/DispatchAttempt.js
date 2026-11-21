const mongoose = require('mongoose');
const { DISPATCH_STATUS } = require('../core/constants');

const dispatchAttemptSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(DISPATCH_STATUS),
      default: DISPATCH_STATUS.OFFERED,
      index: true,
    },
    offeredAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'dispatch_attempts',
  }
);

dispatchAttemptSchema.index({ providerId: 1, status: 1 });

const DispatchAttempt = mongoose.model('DispatchAttempt', dispatchAttemptSchema);
module.exports = DispatchAttempt;
