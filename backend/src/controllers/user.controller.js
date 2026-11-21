const userService = require('../services/user.service');

const getMe = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user._id);
    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const profile = await userService.updateProfile(req.user._id, req.body);
    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    next(err);
  }
};

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await userService.getAddresses(req.user._id);
    res.status(200).json({ status: 'success', data: addresses });
  } catch (err) {
    next(err);
  }
};

const createAddress = async (req, res, next) => {
  try {
    const address = await userService.createAddress(req.user._id, req.body);
    res.status(201).json({ status: 'success', data: address });
  } catch (err) {
    next(err);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const address = await userService.updateAddress(req.user._id, req.params.id, req.body);
    res.status(200).json({ status: 'success', data: address });
  } catch (err) {
    next(err);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const result = await userService.deleteAddress(req.user._id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMe,
  updateMe,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
