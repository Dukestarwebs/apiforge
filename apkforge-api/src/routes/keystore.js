const router   = require('express').Router();
const auth     = require('../middleware/auth');
const validate = require('../middleware/validate');
const { keystoreSchema } = require('../validators/keystoreSchema');
const keystoresDb        = require('../db/keystores');
const keystoreManager    = require('../services/keystoreManager');
const { success, error } = require('../utils/apiResponse');

// POST /keystore/upload
router.post('/upload', auth, validate(keystoreSchema), async (req, res) => {
  try {
    if (req.isAdmin) return error(res, 'Admin does not need a keystore', 400);
    const { keystoreBase64, alias, keystorePassword, keyPassword } = req.body;
    const payload    = JSON.stringify({ keystoreBase64, keystorePassword, keyPassword });
    const encrypted  = keystoreManager.encrypt(Buffer.from(payload));
    await keystoresDb.save({ userId: req.user.id, encryptedData: encrypted, alias });
    return success(res, { message: 'Keystore saved securely', alias });
  } catch (err) { return error(res, err.message, 500); }
});

// GET /keystore
router.get('/', auth, async (req, res) => {
  try {
    if (req.isAdmin) return success(res, { keystore: null });
    const ks = await keystoresDb.get(req.user.id);
    if (!ks) return success(res, { keystore: null });
    return success(res, { keystore: { alias: ks.alias, createdAt: ks.created_at } });
  } catch (err) { return error(res, err.message, 500); }
});

// DELETE /keystore
router.delete('/', auth, async (req, res) => {
  try {
    if (req.isAdmin) return error(res, 'Admin does not have a keystore', 400);
    await keystoresDb.remove(req.user.id);
    return success(res, { message: 'Keystore deleted' });
  } catch (err) { return error(res, err.message, 500); }
});

module.exports = router;
