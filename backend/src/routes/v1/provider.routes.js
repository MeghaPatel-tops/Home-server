const express = require('express');
const router = express.Router();
const providerController = require('../../controllers/provider.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const { ROLES } = require('../../core/constants');

// Provider routes
router.get('/provider/me', authenticate, authorize(ROLES.PROVIDER), providerController.getProviderMe);
router.get('/provider/zones', authenticate, authorize(ROLES.PROVIDER), providerController.getProviderZones);
router.put('/provider/zones', authenticate, authorize(ROLES.PROVIDER), providerController.updateProviderZones);
router.get('/provider/fleet', authenticate, authorize(ROLES.PROVIDER), providerController.getFleet);
router.post('/provider/fleet', authenticate, authorize(ROLES.PROVIDER), providerController.addTechnician);
router.put(
  '/provider/fleet/:id/status',
  authenticate,
  authorize(ROLES.PROVIDER),
  providerController.updateTechnicianStatus
);
router.post(
  '/provider/kyc/upload',
  authenticate,
  authorize(ROLES.PROVIDER),
  providerController.uploadKyc
);

// Technician routes
router.put(
  '/technician/duty-status',
  authenticate,
  authorize(ROLES.TECHNICIAN),
  providerController.updateDutyStatus
);

// Admin routes
router.get(
  '/admin/kyc/pending',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  providerController.getPendingKyc
);
router.post(
  '/admin/kyc/:providerId/decision',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  providerController.reviewKyc
);
router.get(
  '/admin/zones',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  providerController.getZones
);
router.post(
  '/admin/zones',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  providerController.createZone
);

module.exports = router;
