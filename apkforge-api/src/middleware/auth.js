const env        = require('../config/env');
const { hashKey } = require('../utils/hash');
const apiKeysDb  = require('../db/apiKeys');
const { error }  = require('../utils/apiResponse');

// Admin user object injected when admin key is used
const ADMIN_USER = {
  id: 'admin',
  email: 'admin@apkforge.dev',
  name: 'Admin',
  plan: 'agency',
  isAdmin: true,
};

const auth = async (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!key) return error(res, 'Missing x-api-key header', 401, 'UNAUTHORIZED');

  // ── Admin key check — bypasses DB, credits, and rate limits ──
  if (key === env.ADMIN_API_KEY) {
    req.user    = ADMIN_USER;
    req.isAdmin = true;
    return next();
  }

  // ── Regular key — hash and look up in DB ──
  try {
    const hash   = hashKey(key);
    const record = await apiKeysDb.findByHash(hash);
    if (!record) return error(res, 'Invalid or revoked API key', 401, 'UNAUTHORIZED');

    req.user    = record.api_users;
    req.apiKey  = record;
    req.isAdmin = false;

    // Update last_used_at in background — don't await
    apiKeysDb.touchLastUsed(record.id).catch(() => {});

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return error(res, 'Authentication error', 500, 'SERVER_ERROR');
  }
};

module.exports = auth;
