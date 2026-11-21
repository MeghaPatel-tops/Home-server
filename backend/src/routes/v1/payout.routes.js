const express = require('express');
const router = express.Router();
const payoutController = require('../../controllers/payout.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const idempotency = require('../../middleware/idempotency');
const { ROLES } = require('../../core/constants');

// Provider payouts
router.get(
  '/provider/payouts',
  authenticate,
  authorize(ROLES.PROVIDER),
  payoutController.getProviderPayouts
);
router.post(
  '/provider/payouts/request',
  authenticate,
  authorize(ROLES.PROVIDER),
  idempotency,
  payoutController.requestPayout
);

// Admin payouts management
router.get(
  '/admin/payouts',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  payoutController.getAllPayouts
);
router.post(
  '/admin/payouts/:id/process',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  payoutController.processPayout
);
router.post(
  '/admin/payouts/:id/reject',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  payoutController.rejectPayout
);

module.exports = router;
