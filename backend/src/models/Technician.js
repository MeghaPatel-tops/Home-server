const mongoose = require('mongoose');
const { DUTY_STATUS } = require('../core/constants');

const technicianSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
      index: true,
    },
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    dutyStatus: {
      type: String,
      enum: Object.values(DUTY_STATUS),
      default: DUTY_STATUS.OFFLINE,
      index: true,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    totalJobsCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'technicians',
  }
);

const Technician = mongoose.model('Technician', technicianSchema);
module.exports = Technician;
