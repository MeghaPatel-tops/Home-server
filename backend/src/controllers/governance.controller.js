const governanceService = require('../services/governance.service');
const { User } = require('../models');

const submitReview = async (req, res, next) => {
  try {
    const review = await governanceService.submitReview(req.user._id, req.body);
    res.status(201).json({ status: 'success', data: review });
  } catch (err) {
    next(err);
  }
};

const getServiceReviews = async (req, res, next) => {
  try {
    const reviews = await governanceService.getServiceReviews(req.params.id);
    res.status(200).json({ status: 'success', data: reviews });
  } catch (err) {
    next(err);
  }
};

const createDispute = async (req, res, next) => {
  try {
    const dispute = await governanceService.createDispute(req.user._id, req.body);
    res.status(201).json({ status: 'success', data: dispute });
  } catch (err) {
    next(err);
  }
};

const getCustomerDisputes = async (req, res, next) => {
  try {
    const disputes = await governanceService.getCustomerDisputes(req.user._id);
    res.status(200).json({ status: 'success', data: disputes });
  } catch (err) {
    next(err);
  }
};

const getDisputeById = async (req, res, next) => {
  try {
    const dispute = await governanceService.getDisputeById(req.params.id, req.user);
    res.status(200).json({ status: 'success', data: dispute });
  } catch (err) {
    next(err);
  }
};

const sendDisputeMessage = async (req, res, next) => {
  try {
    const message = await governanceService.sendDisputeMessage(
      req.params.id,
      req.user,
      req.body.message
    );
    res.status(201).json({ status: 'success', data: message });
  } catch (err) {
    next(err);
  }
};

const getAllDisputes = async (req, res, next) => {
  try {
    const disputes = await governanceService.getAllDisputes();
    res.status(200).json({ status: 'success', data: disputes });
  } catch (err) {
    next(err);
  }
};

const resolveDispute = async (req, res, next) => {
  try {
    const dispute = await governanceService.resolveDispute(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: dispute });
  } catch (err) {
    next(err);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await governanceService.getOverviewAnalytics();
    res.status(200).json({ status: 'success', data: analytics });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: users });
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).select('-passwordHash');
    res.status(200).json({ status: 'success', data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitReview,
  getServiceReviews,
  createDispute,
  getCustomerDisputes,
  getDisputeById,
  sendDisputeMessage,
  getAllDisputes,
  resolveDispute,
  getAnalytics,
  getAllUsers,
  updateUserStatus,
};
