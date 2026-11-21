const mongoose = require('mongoose');
const { PAYOUT_STATUS } = require('../core/constants');

const payoutRequestSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
      index: true,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 50000, // min 500 INR
    },
    payoutStatus: {
      type: String,
      enum: Object.values(PAYOUT_STATUS),
      default: PAYOUT_STATUS.PENDING,
      index: true,
    },
    accountNumberMasked: {
      type: String,
      required: true,
    },
    ifscCode: {
      type: String,
      required: true,
    },
    bankReferenceUtr: {
      type: String,
      default: null,
    },
    adminNotes: {
      type: String,
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'provider_payouts',
  }
);

const PayoutRequest = mongoose.model('PayoutRequest', payoutRequestSchema);
module.exports = PayoutRequest;
