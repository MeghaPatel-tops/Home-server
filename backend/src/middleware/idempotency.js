const config = require('../config/env');
const crypto = require('crypto');
const IdempotencyRecord = require('../models/IdempotencyRecord');

/**
 * Enforce idempotency on mutative operations (e.g. Booking, Payment, Payout)
 */
const idempotencyMiddleware = async (req, res, next) => {
  const key = req.headers['idempotency-key'];
  if (!key) {
    return next(); // If not provided, continue normally or enforce if strictly needed
  }

  const userId = req.user ? req.user._id : null;
  const requestHash = crypto
    .createHash('sha256')
    .update(req.method + req.originalUrl + JSON.stringify(req.body || {}))
    .digest('hex');

  try {
    const existing = await IdempotencyRecord.findOne({ key, userId }).lean();
    if (existing) {
      if (existing.expiresAt < new Date()) {
        await IdempotencyRecord.deleteOne({ _id: existing._id });
      } else {
        if (existing.requestHash !== requestHash) {
          return res.status(409).json({
            status: 'fail',
            message: 'Idempotency key reused with different request payload.',
          });
        }
        return res.status(existing.responseStatus).json(existing.responseBody);
      }
    }

    // Intercept response to store result
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Restore before storing
      res.json = originalJson;
      const status = res.statusCode;

      if (status >= 200 && status < 300) {
        IdempotencyRecord.create({
          key,
          userId,
          requestHash,
          responseStatus: status,
          responseBody: body,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        }).catch((err) => {
          console.error('Failed to store idempotency record:', err.message);
        });
      }

      return originalJson(body);
    };

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = idempotencyMiddleware;
