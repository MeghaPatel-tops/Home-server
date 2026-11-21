const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[1-9][0-9]{5}$/, 'Invalid 6-digit Indian PIN code'],
      index: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'service_zones',
  }
);

const Zone = mongoose.model('Zone', zoneSchema);
module.exports = Zone;
