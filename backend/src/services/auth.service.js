
/**
 * Revised authentication service with stricter validation and clear error messages.
 * Includes:
 *   • Defensive checks for missing email/password.
 *   • Consistent error types (UnauthorizedError for auth failures).
 *   • Explicit role assignment and token payload.
 */
const { User, RefreshToken, Provider } = require('../models');
const { hashPassword, comparePassword } = require('../core/security/password');
const {
  generateAccessToken,
  generateRefreshTokenString,
  hashRefreshToken,
} = require('../core/security/jwt');
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} = require('../core/errors');
const { ROLES } = require('../core/constants');
const crypto = require('crypto');

class AuthService {
  /** Register a regular customer */
  async registerCustomer(data) {
    if (!data.email || !data.password) {
      throw new BadRequestError('Email and password are required');
    }
    const existing = await User.findOne({
      $or: [{ email: data.email.toLowerCase() }, { phone: data.phone }],
    });
    if (existing) {
      throw new ConflictError('A user with this email or phone already exists');
    }
    const passwordHash = await hashPassword(data.password);
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      passwordHash,
      role: ROLES.CUSTOMER,
    });
    return user;
  }

  /** Register a provider (business) */
  async registerProvider(data) {
    if (!data.email || !data.password) {
      throw new BadRequestError('Email and password are required');
    }
    const existing = await User.findOne({
      $or: [{ email: data.email.toLowerCase() }, { phone: data.phone }],
    });
    if (existing) {
      throw new ConflictError('A user with this email or phone already exists');
    }
    const passwordHash = await hashPassword(data.password);
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      passwordHash,
      role: ROLES.PROVIDER,
    });
    await Provider.create({
      userId: user._id,
      businessName: data.businessName,
      businessAddress: data.businessAddress,
      gstNumber: data.gstNumber,
      panNumber: data.panNumber,
      categories: data.categoryIds || [],
    });
    return user;
  }

  /** Login with email + password */
  async login(email, password) {
    if (!email || !password) {
      throw new BadRequestError('Both email and password must be supplied');
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }
    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Your account has been suspended');
    }
    const tokenPayload = { id: user._id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    // Refresh token handling – family tracking to enable revocation on reuse
    const rawRefreshToken = generateRefreshTokenString();
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const tokenFamilyId = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshToken.create({ userId: user._id, tokenHash, tokenFamilyId, expiresAt });
    return { user: user.toJSON(), accessToken, refreshToken: rawRefreshToken };
  }

  /** Rotate a refresh token – detects reuse and revokes the whole family */
  async rotateRefreshToken(rawToken) {
    if (!rawToken) {
      throw new UnauthorizedError('Refresh token required');
    }
    const tokenHash = hashRefreshToken(rawToken);
    const storedToken = await RefreshToken.findOne({ tokenHash });
    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    if (storedToken.revokedAt) {
      await RefreshToken.updateMany({ tokenFamilyId: storedToken.tokenFamilyId }, { revokedAt: new Date() });
      throw new UnauthorizedError('Compromised refresh token reused. All sessions terminated.');
    }
    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired');
    }
    storedToken.revokedAt = new Date();
    await storedToken.save();
    const user = await User.findById(storedToken.userId);
    if (!user || user.status === 'SUSPENDED') {
      throw new UnauthorizedError('User inactive or suspended');
    }
    const accessToken = generateAccessToken({ id: user._id, role: user.role, email: user.email });
    const newRawRefreshToken = generateRefreshTokenString();
    const newTokenHash = hashRefreshToken(newRawRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const newRecord = await RefreshToken.create({
      userId: user._id,
      tokenHash: newTokenHash,
      tokenFamilyId: storedToken.tokenFamilyId,
      expiresAt,
    });
    storedToken.replacedByTokenId = newRecord._id;
    await storedToken.save();
    return { user: user.toJSON(), accessToken, refreshToken: newRawRefreshToken };
  }

  /** Logout – optional revocation of the presented refresh token */
  async logout(rawToken) {
    if (rawToken) {
      const tokenHash = hashRefreshToken(rawToken);
      await RefreshToken.updateOne({ tokenHash }, { revokedAt: new Date() });
    }
  }
}

module.exports = new AuthService();
