const catalogService = require('../services/catalog.service');

const getCategories = async (req, res, next) => {
  try {
    const categories = await catalogService.getCategories();
    res.status(200).json({ status: 'success', data: categories });
  } catch (err) {
    next(err);
  }
};

const getCategoryServices = async (req, res, next) => {
  try {
    const services = await catalogService.getCategoryServices(req.params.id);
    res.status(200).json({ status: 'success', data: services });
  } catch (err) {
    next(err);
  }
};

const getAllServices = async (req, res, next) => {
  try {
    const { search, category_id } = req.query;
    const services = await catalogService.getAllServices(search, category_id);
    res.status(200).json({ status: 'success', data: services });
  } catch (err) {
    next(err);
  }
};

const getServiceById = async (req, res, next) => {
  try {
    const service = await catalogService.getServiceById(req.params.id);
    res.status(200).json({ status: 'success', data: service });
  } catch (err) {
    next(err);
  }
};

const checkServiceability = async (req, res, next) => {
  try {
    const { pincode, category_id } = req.query;
    const result = await catalogService.checkServiceability(pincode, category_id);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

// Admin
const createCategory = async (req, res, next) => {
  try {
    const category = await catalogService.createCategory(req.body);
    res.status(201).json({ status: 'success', data: category });
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await catalogService.updateCategory(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: category });
  } catch (err) {
    next(err);
  }
};

const createService = async (req, res, next) => {
  try {
    const service = await catalogService.createService(req.body);
    res.status(201).json({ status: 'success', data: service });
  } catch (err) {
    next(err);
  }
};

const updateService = async (req, res, next) => {
  try {
    const service = await catalogService.updateService(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: service });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCategories,
  getCategoryServices,
  getAllServices,
  getServiceById,
  checkServiceability,
  createCategory,
  updateCategory,
  createService,
  updateService,
};
