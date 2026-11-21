const express = require('express');
const router = express.Router();
const govController = require('../../controllers/governance.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const { ROLES } = require('../../core/constants');

// Customer Reviews
router.post(
  '/customer/reviews',
  authenticate,
  authorize(ROLES.CUSTOMER),
  govController.submitReview
);
router.get('/reviews/service/:id', govController.getServiceReviews);

// Customer Disputes
router.post(
  '/customer/disputes',
  authenticate,
  authorize(ROLES.CUSTOMER),
  govController.createDispute
);
router.get(
  '/customer/disputes',
  authenticate,
  authorize(ROLES.CUSTOMER),
  govController.getCustomerDisputes
);
router.get(
  '/customer/disputes/:id',
  authenticate,
  govController.getDisputeById
);
router.post(
  '/customer/disputes/:id/messages',
  authenticate,
  govController.sendDisputeMessage
);

// Admin Governance & Analytics
router.get(
  '/admin/disputes',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  govController.getAllDisputes
);
router.post(
  '/admin/disputes/:id/resolve',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  govController.resolveDispute
);
router.get(
  '/admin/analytics/overview',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  govController.getAnalytics
);
router.get(
  '/admin/users',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  govController.getAllUsers
);
router.put(
  '/admin/users/:id/status',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  govController.updateUserStatus
);

module.exports = router;
