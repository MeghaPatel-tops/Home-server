const mongoose = require('mongoose');

const disputeMessageSchema = new mongoose.Schema(
  {
    disputeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DisputeTicket',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'dispute_messages',
  }
);

disputeMessageSchema.index({ disputeId: 1, createdAt: 1 });

const DisputeMessage = mongoose.model('DisputeMessage', disputeMessageSchema);
module.exports = DisputeMessage;
