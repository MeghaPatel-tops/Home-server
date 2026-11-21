const mongoose = require('mongoose');
const { DISPUTE_STATUS } = require('../core/constants');

const disputeTicketSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true,
    },
    raisedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
      enum: Object.values(DISPUTE_STATUS),
      default: DISPUTE_STATUS.OPEN,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    resolutionNotes: {
      type: String,
      default: null,
    },
    refundAmountPaise: {
      type: Number,
      default: 0,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'disputes',
  }
);

const DisputeTicket = mongoose.model('DisputeTicket', disputeTicketSchema);
module.exports = DisputeTicket;
