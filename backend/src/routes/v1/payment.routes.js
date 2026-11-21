const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/payment.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const idempotency = require('../../middleware/idempotency');
const { ROLES } = require('../../core/constants');

router.post(
  '/payments/razorpay/create-order',
  authenticate,
  authorize(ROLES.CUSTOMER),
  idempotency,
  paymentController.createOrder
);
router.post(
  '/payments/razorpay/verify',
  authenticate,
  authorize(ROLES.CUSTOMER),
  idempotency,
  paymentController.verifyPayment
);
router.post('/payments/razorpay/webhook', paymentController.handleWebhook);
router.get(
  '/customer/bookings/:id/invoice',
  authenticate,
  paymentController.getInvoice
);

module.exports = router;
