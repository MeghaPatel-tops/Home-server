const { User, UserAddress } = require('../models');
const { NotFoundError, ForbiddenError } = require('../core/errors');

class UserService {
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user.toJSON();
  }

  async updateProfile(userId, updates) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (updates.name) user.name = updates.name;
    if (updates.phone) user.phone = updates.phone;

    await user.save();
    return user.toJSON();
  }

  async getAddresses(userId) {
    return UserAddress.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  async createAddress(userId, addressData) {
    if (addressData.isDefault) {
      await UserAddress.updateMany({ userId }, { isDefault: false });
    }

    const count = await UserAddress.countDocuments({ userId });
    const isFirst = count === 0;

    const address = await UserAddress.create({
      userId,
      ...addressData,
      isDefault: isFirst || !!addressData.isDefault,
    });

    return address;
  }

  async updateAddress(userId, addressId, addressData) {
    const address = await UserAddress.findOne({ _id: addressId, userId });
    if (!address) throw new NotFoundError('Address not found');

    if (addressData.isDefault) {
      await UserAddress.updateMany({ userId }, { isDefault: false });
    }

    Object.assign(address, addressData);
    await address.save();
    return address;
  }

  async deleteAddress(userId, addressId) {
    const result = await UserAddress.findOneAndDelete({ _id: addressId, userId });
    if (!result) throw new NotFoundError('Address not found');
    return { success: true, message: 'Address deleted successfully' };
  }
}

module.exports = new UserService();
