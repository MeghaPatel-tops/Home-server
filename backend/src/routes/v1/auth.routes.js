const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const validate = require('../../middleware/validate');
const { authLimiter } = require('../../middleware/rateLimiter');
const {
  registerCustomerSchema,
  registerProviderSchema,
  loginSchema,
} = require('../../validators/auth.validator');

router.post(
  '/register/customer',
  authLimiter,
  validate(registerCustomerSchema),
  authController.registerCustomer
);
router.post(
  '/register/provider',
  authLimiter,
  validate(registerProviderSchema),
  authController.registerProvider
);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
