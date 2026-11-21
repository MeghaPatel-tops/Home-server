const mongoose = require('mongoose');

const userAddressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    label: {
      type: String,
      default: 'Home',
      trim: true,
    },
    houseDetails: {
      type: String,
      required: true,
      trim: true,
    },
    streetLocality: {
      type: String,
      required: true,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      match: [/^[1-9][0-9]{5}$/, 'Invalid 6-digit Indian PIN code'],
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'user_addresses',
  }
);

userAddressSchema.index({ userId: 1, isDefault: 1 });

const UserAddress = mongoose.model('UserAddress', userAddressSchema);
module.exports = UserAddress;
