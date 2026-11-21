const mongoose = require('mongoose');
const { LEDGER_ENTRY_TYPE } = require('../core/constants');

const providerLedgerEntrySchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
      index: true,
    },
    entryType: {
      type: String,
      enum: Object.values(LEDGER_ENTRY_TYPE),
      required: true,
      index: true,
    },
    amountPaise: {
      type: Number,
      required: true,
    },
    balanceAfterPaise: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Append-only
    collection: 'provider_ledger',
  }
);

providerLedgerEntrySchema.index({ providerId: 1, createdAt: -1 });

const ProviderLedgerEntry = mongoose.model('ProviderLedgerEntry', providerLedgerEntrySchema);
module.exports = ProviderLedgerEntry;
