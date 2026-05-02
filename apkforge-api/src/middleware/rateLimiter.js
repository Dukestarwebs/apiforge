const rateLimit  = require('express-rate-limit');
const { PLANS }  = require('../config/constants');
const { error }  = require('../utils/apiResponse');

// Dynamic rate limiter — reads plan from req.user set by auth middleware
const rateLimiter = (req, res, next) => {
  // Admin bypasses rate limiting entirely
  if (req.isAdmin) return next();

  const plan  = req.user?.plan || 'free';
  const limit = PLANS[plan]?.requestsPerMin || 10;

  const limiter = rateLimit({
    windowMs:         60 * 1000,
    max:              limit,
    keyGenerator:     (r) => r.user?.id || r.ip,
    handler:          (r, rs) => error(rs, 'Rate limit exceeded. Slow down.', 429, 'RATE_LIMIT_EXCEEDED'),
    standardHeaders:  true,
    legacyHeaders:    false,
  });

  return limiter(req, res, next);
};

module.exports = rateLimiter;
