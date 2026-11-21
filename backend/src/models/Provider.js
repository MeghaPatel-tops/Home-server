const mongoose = require('mongoose');
const { KYC_STATUS } = require('../core/constants');

const providerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    businessAddress: {
      type: String,
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    panNumber: {
      type: String,
      trim: true,
    },
    kycStatus: {
      type: String,
      enum: Object.values(KYC_STATUS),
      default: KYC_STATUS.PENDING,
      index: true,
    },
    kycDocumentKey: {
      type: String,
      default: null,
    },
    kycDocumentType: {
      type: String,
      default: null,
    },
    kycRejectionReason: {
      type: String,
      default: null,
    },
    bankDetails: {
      accountNumberMasked: { type: String, default: null },
      ifscCode: { type: String, default: null },
      bankName: { type: String, default: null },
    },
    walletBalancePaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
  },
  {
    timestamps: true,
    collection: 'providers',
  }
);

const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;
