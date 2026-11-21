const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/booking.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const idempotency = require('../../middleware/idempotency');
const {
  createBookingSchema,
  cancelBookingSchema,
  assignTechnicianSchema,
  verifyOtpSchema,
  changeOrderSchema,
} = require('../../validators/booking.validator');
const { ROLES } = require('../../core/constants');

// Customer endpoints
router.post(
  '/customer/bookings',
  authenticate,
  authorize(ROLES.CUSTOMER),
  idempotency,
  validate(createBookingSchema),
  bookingController.createBooking
);
router.get(
  '/customer/bookings/my-bookings',
  authenticate,
  authorize(ROLES.CUSTOMER),
  bookingController.getCustomerBookings
);
router.get(
  '/customer/bookings/:id',
  authenticate,
  bookingController.getBookingById
);
router.post(
  '/customer/bookings/:id/cancel',
  authenticate,
  authorize(ROLES.CUSTOMER),
  validate(cancelBookingSchema),
  bookingController.cancelBooking
);
router.post(
  '/customer/bookings/:id/resend-otp',
  authenticate,
  authorize(ROLES.CUSTOMER),
  bookingController.resendOtp
);

// Provider endpoints
router.get(
  '/provider/bookings/queue',
  authenticate,
  authorize(ROLES.PROVIDER),
  bookingController.getProviderQueue
);
router.post(
  '/provider/bookings/:id/accept',
  authenticate,
  authorize(ROLES.PROVIDER),
  bookingController.acceptBooking
);
router.post(
  '/provider/bookings/:id/reject',
  authenticate,
  authorize(ROLES.PROVIDER),
  bookingController.rejectBooking
);
router.post(
  '/provider/dispatch/assign',
  authenticate,
  authorize(ROLES.PROVIDER),
  validate(assignTechnicianSchema),
  bookingController.assignTechnician
);

// Technician endpoints
router.get(
  '/technician/my-jobs',
  authenticate,
  authorize(ROLES.TECHNICIAN),
  bookingController.getTechnicianJobs
);
router.put(
  '/technician/bookings/:id/status',
  authenticate,
  authorize(ROLES.TECHNICIAN),
  bookingController.updateTechnicianStatus
);
router.post(
  '/technician/bookings/:id/start-otp',
  authenticate,
  authorize(ROLES.TECHNICIAN),
  validate(verifyOtpSchema),
  bookingController.verifyStartOtp
);
router.post(
  '/technician/bookings/:id/change-order',
  authenticate,
  authorize(ROLES.TECHNICIAN),
  validate(changeOrderSchema),
  bookingController.submitChangeOrder
);
router.post(
  '/technician/bookings/:id/verify-completion-otp',
  authenticate,
  authorize(ROLES.TECHNICIAN),
  validate(verifyOtpSchema),
  bookingController.verifyCompletionOtp
);
router.post(
  '/technician/bookings/:id/confirm-cash',
  authenticate,
  authorize(ROLES.TECHNICIAN),
  bookingController.confirmCash
);

module.exports = router;
