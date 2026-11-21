const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    basePricePaise: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedDurationMinutes: {
      type: Number,
      required: true,
      default: 60,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'services',
  }
);

serviceSchema.index({ categoryId: 1, isActive: 1 });

serviceSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.category_id = obj.categoryId?._id ? obj.categoryId._id.toString() : obj.categoryId?.toString();
  obj.category_name = obj.categoryId?.name || '';
  obj.base_price_paise = obj.basePricePaise;
  obj.estimated_duration_minutes = obj.estimatedDurationMinutes;
  obj.is_active = obj.isActive;
  return obj;
};

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
