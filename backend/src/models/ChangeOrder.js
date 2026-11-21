const mongoose = require('mongoose');
const { CHANGE_ORDER_STATUS } = require('../core/constants');

const changeOrderSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technician',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    additionalAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    gstAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(CHANGE_ORDER_STATUS),
      default: CHANGE_ORDER_STATUS.PENDING,
      index: true,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'change_orders',
  }
);

const ChangeOrder = mongoose.model('ChangeOrder', changeOrderSchema);
module.exports = ChangeOrder;
