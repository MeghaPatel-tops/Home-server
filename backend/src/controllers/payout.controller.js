const payoutService = require('../services/payout.service');
const { Provider } = require('../models');

const getProviderPayouts = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user._id });
    const result = await payoutService.getProviderLedgerAndBalance(provider._id);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

const requestPayout = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user._id });
    const payout = await payoutService.requestPayout(provider._id, req.body.amount_paise);
    res.status(201).json({ status: 'success', data: payout });
  } catch (err) {
    next(err);
  }
};

const getAllPayouts = async (req, res, next) => {
  try {
    const payouts = await payoutService.getAllPayouts();
    res.status(200).json({ status: 'success', data: payouts });
  } catch (err) {
    next(err);
  }
};

const processPayout = async (req, res, next) => {
  try {
    const payout = await payoutService.processPayout(req.params.id, req.body.bank_reference_utr);
    res.status(200).json({ status: 'success', data: payout });
  } catch (err) {
    next(err);
  }
};

const rejectPayout = async (req, res, next) => {
  try {
    const payout = await payoutService.rejectPayout(req.params.id, req.body.admin_notes);
    res.status(200).json({ status: 'success', data: payout });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProviderPayouts,
  requestPayout,
  getAllPayouts,
  processPayout,
  rejectPayout,
};
