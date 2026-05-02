const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const usersDb = require('../db/users');
const walletsDb = require('../db/wallets');
const subsDb  = require('../db/subscriptions');
const apiKeysDb = require('../db/apiKeys');
const txDb    = require('../db/transactions');
const mailer  = require('../services/mailer');
const { hashKey } = require('../utils/hash');
const validate    = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authSchema');
const { success, error } = require('../utils/apiResponse');
const env     = require('../config/env');
const { SIGNUP_BONUS_CREDITS } = require('../config/constants');

// POST /auth/register
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await usersDb.findByEmail(email);
    if (existing) return error(res, 'Email already registered', 409, 'EMAIL_EXISTS');

    const passwordHash = await bcrypt.hash(password, 12);
    const user         = await usersDb.createUser({ email, passwordHash, name });

    // Create wallet with signup bonus
    await walletsDb.createWallet(user.id);
    await walletsDb.addCredits(user.id, SIGNUP_BONUS_CREDITS);
    await txDb.insert({ userId: user.id, type: 'bonus', amount: SIGNUP_BONUS_CREDITS, description: 'Signup bonus credits', referenceId: user.id });

    // Create subscription (free plan)
    await subsDb.create(user.id, 'free');

    // Generate first API key
    const rawKey    = 'apkf_' + uuidv4().replace(/-/g, '');
    const keyHash   = hashKey(rawKey);
    const keyPrefix = rawKey.substring(0, 12) + '...';
    await apiKeysDb.createKey({ userId: user.id, keyHash, keyPrefix, label: 'Default Key' });

    // Send welcome email (non-blocking)
    mailer.sendWelcome(email, name).catch(() => {});

    return success(res, {
      message: 'Account created successfully',
      apiKey: rawKey,
      user: { id: user.id, name, email },
      credits: SIGNUP_BONUS_CREDITS,
    }, 201);
  } catch (err) {
    console.error('Register error:', err.message);
    return error(res, 'Registration failed', 500);
  }
});

// POST /auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await usersDb.findByEmail(email);
    if (!user) return error(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return error(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');

    const token = jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });
    return success(res, { token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    return error(res, 'Login failed', 500);
  }
});

module.exports = router;
