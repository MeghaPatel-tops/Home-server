const { Category, Service, Zone, ProviderZone } = require('../models');
const { NotFoundError } = require('../core/errors');

class CatalogService {
  async getCategories() {
    return Category.find({ isActive: true }).sort({ name: 1 });
  }

  async getAllCategories() {
    return Category.find().sort({ name: 1 });
  }

  async getCategoryServices(categoryId) {
    return Service.find({ categoryId, isActive: true }).sort({ name: 1 });
  }

  async getAllServices(search = '', categoryId = '') {
    const query = { isActive: true };
    if (categoryId) {
      // Support matching by ObjectId or category slug
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryId);
      if (isObjectId) {
        query.categoryId = categoryId;
      } else {
        const cat = await Category.findOne({ slug: categoryId });
        if (cat) query.categoryId = cat._id;
      }
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    return Service.find(query).populate('categoryId', 'name slug').sort({ name: 1 });
  }

  async getServiceById(serviceId) {
    const service = await Service.findById(serviceId).populate('categoryId', 'name slug');
    if (!service) throw new NotFoundError('Service not found');
    return service;
  }

  async checkServiceability(pincode, categoryId) {
    const zone = await Zone.findOne({ pincode, isActive: true });
    if (!zone) {
      return {
        pincode,
        is_serviceable: false,
        city: null,
        message: 'HomeServe is currently expanding to this PIN code.',
      };
    }

    // Check if active provider covers zone
    const providerCovered = await ProviderZone.findOne({ zoneId: zone._id, isActive: true });

    return {
      pincode,
      is_serviceable: true,
      city: zone.city,
      state: zone.state,
      zone_id: zone._id,
      message: 'Great news! HomeServe professionals are active in your area.',
    };
  }

  async createCategory(data) {
    return Category.create(data);
  }

  async updateCategory(id, data) {
    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!category) throw new NotFoundError('Category not found');
    return category;
  }

  async createService(data) {
    const payload = {
      categoryId: data.categoryId || data.category_id,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: data.description,
      basePricePaise: data.basePricePaise !== undefined ? data.basePricePaise : data.base_price_paise,
      estimatedDurationMinutes: data.estimatedDurationMinutes !== undefined ? data.estimatedDurationMinutes : data.estimated_duration_minutes,
      isActive: data.isActive !== undefined ? data.isActive : (data.is_active !== undefined ? data.is_active : true),
    };
    return Service.create(payload);
  }

  async updateService(id, data) {
    const payload = {};
    if (data.categoryId || data.category_id) payload.categoryId = data.categoryId || data.category_id;
    if (data.name) payload.name = data.name;
    if (data.slug) payload.slug = data.slug;
    if (data.description !== undefined) payload.description = data.description;
    if (data.basePricePaise !== undefined) payload.basePricePaise = data.basePricePaise;
    else if (data.base_price_paise !== undefined) payload.basePricePaise = data.base_price_paise;
    if (data.estimatedDurationMinutes !== undefined) payload.estimatedDurationMinutes = data.estimatedDurationMinutes;
    else if (data.estimated_duration_minutes !== undefined) payload.estimatedDurationMinutes = data.estimated_duration_minutes;
    if (data.isActive !== undefined) payload.isActive = data.isActive;
    else if (data.is_active !== undefined) payload.isActive = data.is_active;

    const service = await Service.findByIdAndUpdate(id, payload, { new: true });
    if (!service) throw new NotFoundError('Service not found');
    return service;
  }
}

module.exports = new CatalogService();
