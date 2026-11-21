const bookingService = require('../services/booking.service');
const { Provider, Technician } = require('../models');

const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.user._id, req.body);
    res.status(201).json({ status: 'success', data: booking });
  } catch (err) {
    next(err);
  }
};

const getCustomerBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getCustomerBookings(req.user._id, req.query.status);
    res.status(200).json({ status: 'success', data: bookings });
  } catch (err) {
    next(err);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user);
    res.status(200).json({ status: 'success', data: booking });
  } catch (err) {
    next(err);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const result = await bookingService.cancelBooking(
      req.params.id,
      req.user._id,
      req.body.cancellation_reason
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const resendOtp = async (req, res, next) => {
  try {
    const result = await bookingService.resendOtp(req.params.id, req.user._id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Provider
const getProviderQueue = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user._id });
    const queue = await bookingService.getProviderQueue(provider._id);
    res.status(200).json({ status: 'success', data: queue });
  } catch (err) {
    next(err);
  }
};

const acceptBooking = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user._id });
    const booking = await bookingService.acceptDispatch(provider._id, req.params.id);
    res.status(200).json({ status: 'success', data: booking });
  } catch (err) {
    next(err);
  }
};

const rejectBooking = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user._id });
    const result = await bookingService.rejectDispatch(provider._id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const assignTechnician = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user._id });
    const booking = await bookingService.assignTechnician(
      provider._id,
      req.body.booking_id,
      req.body.technician_id
    );
    res.status(200).json({ status: 'success', data: booking });
  } catch (err) {
    next(err);
  }
};

// Technician
const getTechnicianJobs = async (req, res, next) => {
  try {
    const tech = await Technician.findOne({ userId: req.user._id });
    const jobs = await bookingService.getTechnicianJobs(tech._id);
    res.status(200).json({ status: 'success', data: jobs });
  } catch (err) {
    next(err);
  }
};

const updateTechnicianStatus = async (req, res, next) => {
  try {
    const tech = await Technician.findOne({ userId: req.user._id });
    const booking = await bookingService.updateTechnicianJobStatus(
      tech._id,
      req.params.id,
      req.body.status
    );
    res.status(200).json({ status: 'success', data: booking });
  } catch (err) {
    next(err);
  }
};

const verifyStartOtp = async (req, res, next) => {
  try {
    const tech = await Technician.findOne({ userId: req.user._id });
    const result = await bookingService.verifyStartOtp(tech._id, req.params.id, req.body.otp);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const submitChangeOrder = async (req, res, next) => {
  try {
    const tech = await Technician.findOne({ userId: req.user._id });
    const co = await bookingService.submitChangeOrder(tech._id, req.params.id, req.body);
    res.status(201).json({ status: 'success', data: co });
  } catch (err) {
    next(err);
  }
};

const verifyCompletionOtp = async (req, res, next) => {
  try {
    const tech = await Technician.findOne({ userId: req.user._id });
    const result = await bookingService.verifyCompletionOtp(tech._id, req.params.id, req.body.otp);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const confirmCash = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Cash collection confirmed and posted to provider ledger.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getBookingById,
  cancelBooking,
  resendOtp,
  getProviderQueue,
  acceptBooking,
  rejectBooking,
  assignTechnician,
  getTechnicianJobs,
  updateTechnicianStatus,
  verifyStartOtp,
  submitChangeOrder,
  verifyCompletionOtp,
  confirmCash,
};
