const router    = require('express').Router();
const auth      = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const apiKeysDb = require('../db/apiKeys');
const { hashKey } = require('../utils/hash');
const { success, error } = require('../utils/apiResponse');

// GET /keys
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.isAdmin ? (req.query.userId || 'admin') : req.user.id;
    if (req.isAdmin && req.query.userId === undefined) return success(res, { keys: [], note: 'Admin uses ADMIN_API_KEY from env' });
    const keys = await apiKeysDb.listByUser(userId);
    return success(res, { keys });
  } catch (err) { return error(res, err.message, 500); }
});

// POST /keys — generate new API key
router.post('/', auth, async (req, res) => {
  try {
    if (req.isAdmin) return error(res, 'Admin key is set in .env, not generated via API', 400);
    const { label = 'New Key' } = req.body;
    const rawKey    = 'apkf_' + uuidv4().replace(/-/g, '');
    const keyHash   = hashKey(rawKey);
    const keyPrefix = rawKey.substring(0, 12) + '...';
    const record    = await apiKeysDb.createKey({ userId: req.user.id, keyHash, keyPrefix, label });
    // Raw key shown ONCE — not stored
    return success(res, { id: record.id, apiKey: rawKey, keyPrefix, label, message: 'Save this key — it will not be shown again.' }, 201);
  } catch (err) { return error(res, err.message, 500); }
});

// DELETE /keys/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.isAdmin) return error(res, 'Admin key cannot be revoked via API', 400);
    await apiKeysDb.revokeKey(req.params.id, req.user.id);
    return success(res, { message: 'API key revoked' });
  } catch (err) { return error(res, err.message, 500); }
});

module.exports = router;
