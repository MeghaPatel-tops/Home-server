const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const catalogRoutes = require('./catalog.routes');
const providerRoutes = require('./provider.routes');
const bookingRoutes = require('./booking.routes');
const paymentRoutes = require('./payment.routes');
const payoutRoutes = require('./payout.routes');
const governanceRoutes = require('./governance.routes');

router.use('/auth', authRoutes);
router.use('/', userRoutes);
router.use('/', catalogRoutes);
router.use('/', providerRoutes);
router.use('/', bookingRoutes);
router.use('/', paymentRoutes);
router.use('/', payoutRoutes);
router.use('/', governanceRoutes);

module.exports = router;
