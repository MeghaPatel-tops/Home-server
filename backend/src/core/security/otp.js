const crypto = require('crypto');
const config = require('../../config/env');

/**
 * Generate 6-digit cryptographically secure OTP
 */
const generateOtp = (length = 6) => {
  if (length === 4) {
    return crypto.randomInt(1000, 10000).toString();
  }
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Generate HMAC-SHA256 digest using booking context (bookingId + userId + otp)
 */
const hashOtp = (contextString) => {
  return crypto
    .createHmac('sha256', config.OTP_HMAC_SECRET)
    .update(contextString)
    .digest('hex');
};

/**
 * Constant-time comparison for OTP digests
 */
const verifyOtpHash = (providedContext, storedHash) => {
  const calculatedHash = hashOtp(providedContext);
  if (!storedHash || storedHash.length !== calculatedHash.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(calculatedHash, 'hex'),
    Buffer.from(storedHash, 'hex')
  );
};

module.exports = {
  generateOtp,
  hashOtp,
  verifyOtpHash,
};
