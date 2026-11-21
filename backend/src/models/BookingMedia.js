const mongoose = require('mongoose');

const bookingMediaSchema = new mongoose.Schema(
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
    mediaType: {
      type: String,
      enum: ['BEFORE', 'AFTER'],
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'booking_media',
  }
);

const BookingMedia = mongoose.model('BookingMedia', bookingMediaSchema);
module.exports = BookingMedia;
