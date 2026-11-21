const providerService = require('../services/provider.service');
const { Zone } = require('../models');

const getProviderMe = async (req, res, next) => {
  try {
    const profile = await providerService.getProviderProfile(req.user._id);
    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    next(err);
  }
};

const getProviderZones = async (req, res, next) => {
  try {
    const provider = await providerService.getProviderProfile(req.user._id);
    const zones = await providerService.getProviderZones(provider._id);
    res.status(200).json({ status: 'success', data: zones });
  } catch (err) {
    next(err);
  }
};

const updateProviderZones = async (req, res, next) => {
  try {
    const provider = await providerService.getProviderProfile(req.user._id);
    const zones = await providerService.updateZones(provider._id, req.body.zone_ids || []);
    res.status(200).json({ status: 'success', data: zones });
  } catch (err) {
    next(err);
  }
};

const getFleet = async (req, res, next) => {
  try {
    const provider = await providerService.getProviderProfile(req.user._id);
    const fleet = await providerService.getFleet(provider._id);
    res.status(200).json({ status: 'success', data: fleet });
  } catch (err) {
    next(err);
  }
};

const addTechnician = async (req, res, next) => {
  try {
    const provider = await providerService.getProviderProfile(req.user._id);
    const tech = await providerService.addTechnician(provider._id, req.body);
    res.status(201).json({ status: 'success', data: tech });
  } catch (err) {
    next(err);
  }
};

const updateTechnicianStatus = async (req, res, next) => {
  try {
    const provider = await providerService.getProviderProfile(req.user._id);
    const tech = await providerService.updateTechnicianStatus(
      provider._id,
      req.params.id,
      req.body.is_active
    );
    res.status(200).json({ status: 'success', data: tech });
  } catch (err) {
    next(err);
  }
};

const uploadKyc = async (req, res, next) => {
  try {
    const provider = await providerService.getProviderProfile(req.user._id);
    // In production, file uploaded via Multer and saved to private object storage
    const storageKey = req.file ? `kyc/${provider._id}/${req.file.originalname}` : 'kyc/documents/doc.pdf';
    const updated = await providerService.submitKyc(provider._id, storageKey, req.body.document_type || 'GST & PAN');
    res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    next(err);
  }
};

// Technician
const updateDutyStatus = async (req, res, next) => {
  try {
    const updated = await providerService.updateTechnicianDuty(req.user._id, req.body.duty_status);
    res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    next(err);
  }
};

// Super Admin
const getPendingKyc = async (req, res, next) => {
  try {
    const pending = await providerService.getPendingKyc();
    res.status(200).json({ status: 'success', data: pending });
  } catch (err) {
    next(err);
  }
};

const reviewKyc = async (req, res, next) => {
  try {
    const { decision, rejection_reason } = req.body;
    const reviewed = await providerService.reviewKyc(req.params.providerId, decision, rejection_reason);
    res.status(200).json({ status: 'success', data: reviewed });
  } catch (err) {
    next(err);
  }
};

const getZones = async (req, res, next) => {
  try {
    const zones = await Zone.find().sort({ pincode: 1 });
    res.status(200).json({ status: 'success', data: zones });
  } catch (err) {
    next(err);
  }
};

const createZone = async (req, res, next) => {
  try {
    const zone = await Zone.create(req.body);
    res.status(201).json({ status: 'success', data: zone });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProviderMe,
  getProviderZones,
  updateProviderZones,
  getFleet,
  addTechnician,
  updateTechnicianStatus,
  uploadKyc,
  updateDutyStatus,
  getPendingKyc,
  reviewKyc,
  getZones,
  createZone,
};
