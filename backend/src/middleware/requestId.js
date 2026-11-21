const crypto = require('crypto');

const requestIdMiddleware = (req, res, next) => {
  const incomingId = req.headers['x-request-id'];
  const requestId = incomingId || (crypto.randomUUID ? crypto.randomUUID() : 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
  
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

module.exports = requestIdMiddleware;
