const mongoose = require('mongoose');

const providerZoneSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
      index: true,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'provider_zones',
  }
);

providerZoneSchema.index({ providerId: 1, zoneId: 1 }, { unique: true });

const ProviderZone = mongoose.model('ProviderZone', providerZoneSchema);
module.exports = ProviderZone;
