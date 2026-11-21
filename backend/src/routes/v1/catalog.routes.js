const express = require('express');
const router = express.Router();
const catalogController = require('../../controllers/catalog.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const {
  createCategorySchema,
  createServiceSchema,
  serviceabilityQuerySchema,
} = require('../../validators/catalog.validator');
const { ROLES } = require('../../core/constants');

// Public catalog routes
router.get('/categories', catalogController.getCategories);
router.get('/categories/:id/services', catalogController.getCategoryServices);
router.get('/services', catalogController.getAllServices);
router.get('/services/:id', catalogController.getServiceById);
router.get('/zones/check-serviceability', catalogController.checkServiceability);

// Admin catalog routes
router.post(
  '/admin/categories',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  validate(createCategorySchema),
  catalogController.createCategory
);
router.put(
  '/admin/categories/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  catalogController.updateCategory
);
router.post(
  '/admin/services',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  validate(createServiceSchema),
  catalogController.createService
);
router.put(
  '/admin/services/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  catalogController.updateService
);

module.exports = router;
