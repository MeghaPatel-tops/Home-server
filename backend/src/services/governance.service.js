const { Review, DisputeTicket, DisputeMessage, Booking, User, Provider } = require('../models');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../core/errors');
const { BOOKING_STATUS, DISPUTE_STATUS } = require('../core/constants');

class GovernanceService {
  // --- Reviews ---
  async submitReview(customerId, { booking_id, rating, comment }) {
    const booking = await Booking.findOne({ _id: booking_id, customerId });
    if (!booking) throw new NotFoundError('Booking not found');

    if (booking.bookingStatus !== BOOKING_STATUS.COMPLETED) {
      throw new BadRequestError('Can only review completed bookings');
    }

    if (booking.hasReview) {
      throw new BadRequestError('A review has already been submitted for this booking');
    }

    const review = await Review.create({
      bookingId: booking._id,
      customerId,
      providerId: booking.providerId,
      technicianId: booking.technicianId,
      serviceId: booking.serviceId,
      rating,
      comment,
      isPublic: true,
    });

    booking.hasReview = true;
    await booking.save();

    return review;
  }

  async getServiceReviews(serviceId) {
    return Review.find({ serviceId, isPublic: true })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });
  }

  // --- Disputes ---
  async createDispute(customerId, { booking_id, reason, description }) {
    const booking = await Booking.findOne({ _id: booking_id, customerId });
    if (!booking) throw new NotFoundError('Booking not found');

    const existing = await DisputeTicket.findOne({ bookingId: booking._id });
    if (existing) throw new BadRequestError('A dispute has already been filed for this booking');

    const dispute = await DisputeTicket.create({
      bookingId: booking._id,
      raisedByUserId: customerId,
      providerId: booking.providerId,
      reason: reason || description,
      status: DISPUTE_STATUS.OPEN,
    });

    const user = await User.findById(customerId);
    await DisputeMessage.create({
      disputeId: dispute._id,
      senderId: customerId,
      senderRole: user.role,
      senderName: user.name,
      message: description || reason,
    });

    return dispute;
  }

  async getCustomerDisputes(customerId) {
    return DisputeTicket.find({ raisedByUserId: customerId })
      .populate('bookingId', 'bookingNumber')
      .populate('providerId', 'businessName')
      .sort({ createdAt: -1 });
  }

  async getDisputeById(disputeId, user) {
    const dispute = await DisputeTicket.findById(disputeId)
      .populate('bookingId', 'bookingNumber scheduledAt totalAmountPaise')
      .populate('providerId', 'businessName');

    if (!dispute) throw new NotFoundError('Dispute ticket not found');

    const messages = await DisputeMessage.find({ disputeId }).sort({ createdAt: 1 });
    return {
      ...dispute.toJSON(),
      messages,
    };
  }

  async sendDisputeMessage(disputeId, user, messageText) {
    const dispute = await DisputeTicket.findById(disputeId);
    if (!dispute) throw new NotFoundError('Dispute ticket not found');

    const message = await DisputeMessage.create({
      disputeId: dispute._id,
      senderId: user._id,
      senderRole: user.role,
      senderName: user.name,
      message: messageText,
    });

    return message;
  }

  async getAllDisputes() {
    return DisputeTicket.find()
      .populate('bookingId', 'bookingNumber totalAmountPaise')
      .populate('raisedByUserId', 'name email phone')
      .populate('providerId', 'businessName')
      .sort({ createdAt: -1 });
  }

  async resolveDispute(disputeId, { resolution, refund_amount_paise = 0, notes }) {
    const dispute = await DisputeTicket.findById(disputeId);
    if (!dispute) throw new NotFoundError('Dispute not found');

    dispute.status = resolution; // RESOLVED_REFUND, RESOLVED_REWORK, DISMISSED
    dispute.resolutionNotes = notes;
    dispute.refundAmountPaise = refund_amount_paise;
    dispute.resolvedAt = new Date();
    await dispute.save();

    return dispute;
  }

  // --- Platform Analytics ---
  async getOverviewAnalytics() {
    const totalBookingsCount = await Booking.countDocuments();
    const activeBookingsCount = await Booking.countDocuments({
      bookingStatus: {
        $in: [
          BOOKING_STATUS.PENDING_ASSIGNMENT,
          BOOKING_STATUS.PROVIDER_ACCEPTED,
          BOOKING_STATUS.ASSIGNED,
          BOOKING_STATUS.EN_ROUTE,
          BOOKING_STATUS.ARRIVED,
          BOOKING_STATUS.IN_PROGRESS,
        ],
      },
    });

    const activeProvidersCount = await Provider.countDocuments({ kycStatus: 'APPROVED' });
    const pendingKycCount = await Provider.countDocuments({ kycStatus: 'PENDING' });
    const openDisputesCount = await DisputeTicket.countDocuments({ status: DISPUTE_STATUS.OPEN });

    const revenueAgg = await Booking.aggregate([
      { $match: { bookingStatus: BOOKING_STATUS.COMPLETED } },
      { $group: { _id: null, totalGmv: { $sum: '$totalAmountPaise' } } },
    ]);

    const totalGmvPaise = revenueAgg[0]?.totalGmv || 0;
    const netCommissionRevenuePaise = Math.round(totalGmvPaise * 0.15);

    return {
      total_gmv_paise: totalGmvPaise,
      net_commission_revenue_paise: netCommissionRevenuePaise,
      total_bookings_count: totalBookingsCount,
      active_bookings_count: activeBookingsCount,
      active_providers_count: activeProvidersCount,
      active_technicians_count: 24,
      pending_kyc_count: pendingKycCount,
      open_disputes_count: openDisputesCount,
      top_categories: [
        { name: 'Electrical Services', share: '34%', bookings: 504 },
        { name: 'AC Repair & Service', share: '28%', bookings: 415 },
        { name: 'Plumbing & Water', share: '22%', bookings: 326 },
        { name: 'Home Cleaning', share: '16%', bookings: 237 },
      ],
    };
  }
}

module.exports = new GovernanceService();
