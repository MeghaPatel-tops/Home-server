const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../../config/env');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.ACCESS_TOKEN_EXPIRE,
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, config.JWT_ACCESS_SECRET);
};

const generateRefreshTokenString = () => {
  return crypto.randomBytes(40).toString('hex');
};

const hashRefreshToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshTokenString,
  hashRefreshToken,
};
