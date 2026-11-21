const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { updateProfileSchema, addressSchema } = require('../../validators/auth.validator');
const { ROLES } = require('../../core/constants');

// User profile routes
router.get('/users/me', authenticate, userController.getMe);
router.put('/users/me', authenticate, validate(updateProfileSchema), userController.updateMe);

// Customer addresses routes
router.get(
  '/customer/addresses',
  authenticate,
  authorize(ROLES.CUSTOMER),
  userController.getAddresses
);
router.post(
  '/customer/addresses',
  authenticate,
  authorize(ROLES.CUSTOMER),
  validate(addressSchema),
  userController.createAddress
);
router.put(
  '/customer/addresses/:id',
  authenticate,
  authorize(ROLES.CUSTOMER),
  validate(addressSchema),
  userController.updateAddress
);
router.delete(
  '/customer/addresses/:id',
  authenticate,
  authorize(ROLES.CUSTOMER),
  userController.deleteAddress
);

module.exports = router;
