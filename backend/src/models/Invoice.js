const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
      index: true,
    },
    baseAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    travelFeePaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    cgstPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    sgstPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    pdfStorageKey: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'invoices',
  }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
