const mongoose = require('mongoose');

const idempotencyRecordSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    requestHash: {
      type: String,
      required: true,
    },
    responseStatus: {
      type: Number,
      required: true,
    },
    responseBody: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL Index
    },
  },
  {
    timestamps: true,
    collection: 'idempotency_keys',
  }
);

idempotencyRecordSchema.index({ key: 1, userId: 1 }, { unique: true });

const IdempotencyRecord = mongoose.model('IdempotencyRecord', idempotencyRecordSchema);
module.exports = IdempotencyRecord;
