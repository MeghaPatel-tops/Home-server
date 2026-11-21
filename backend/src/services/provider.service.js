const { Provider, Technician, ProviderZone, Zone, User } = require('../models');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../core/errors');
const { KYC_STATUS, ROLES, DUTY_STATUS } = require('../core/constants');

class ProviderService {
  async getProviderProfile(userId) {
    const provider = await Provider.findOne({ userId })
      .populate('userId', 'name email phone')
      .populate('categories', 'name slug');
    if (!provider) throw new NotFoundError('Provider profile not found');
    return provider;
  }

  async updateZones(providerId, zoneIds) {
    await ProviderZone.deleteMany({ providerId });
    const records = zoneIds.map((zoneId) => ({
      providerId,
      zoneId,
      isActive: true,
    }));
    await ProviderZone.insertMany(records);
    return this.getProviderZones(providerId);
  }

  async getProviderZones(providerId) {
    return ProviderZone.find({ providerId, isActive: true }).populate('zoneId');
  }

  async getFleet(providerId) {
    return Technician.find({ providerId })
      .populate('userId', 'name email phone status')
      .populate('skills', 'name slug');
  }

  async addTechnician(providerId, techData) {
    const { name, email, phone, password, skills } = techData;
    const { hashPassword } = require('../core/security/password');

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (existing) {
      throw new BadRequestError('User with this email or phone already exists');
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: ROLES.TECHNICIAN,
    });

    const technician = await Technician.create({
      userId: user._id,
      providerId,
      skills: skills || [],
      dutyStatus: DUTY_STATUS.OFFLINE,
    });

    return technician;
  }

  async updateTechnicianStatus(providerId, technicianId, isActive) {
    const tech = await Technician.findOne({ _id: technicianId, providerId });
    if (!tech) throw new NotFoundError('Technician not found');

    tech.isActive = isActive;
    await tech.save();
    return tech;
  }

  async updateTechnicianDuty(userId, dutyStatus) {
    const tech = await Technician.findOne({ userId });
    if (!tech) throw new NotFoundError('Technician profile not found');

    tech.dutyStatus = dutyStatus;
    await tech.save();
    return tech;
  }

  async submitKyc(providerId, documentKey, documentType) {
    const provider = await Provider.findById(providerId);
    if (!provider) throw new NotFoundError('Provider not found');

    provider.kycDocumentKey = documentKey;
    provider.kycDocumentType = documentType;
    provider.kycStatus = KYC_STATUS.PENDING;
    provider.kycRejectionReason = null;
    await provider.save();
    return provider;
  }

  async reviewKyc(providerId, decision, rejectionReason = '') {
    const provider = await Provider.findById(providerId);
    if (!provider) throw new NotFoundError('Provider not found');

    if (decision === 'APPROVED') {
      provider.kycStatus = KYC_STATUS.APPROVED;
      provider.kycRejectionReason = null;
    } else {
      provider.kycStatus = KYC_STATUS.REJECTED;
      provider.kycRejectionReason = rejectionReason;
    }

    await provider.save();
    return provider;
  }

  async getPendingKyc() {
    return Provider.find({ kycStatus: KYC_STATUS.PENDING })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
  }
}

module.exports = new ProviderService();
