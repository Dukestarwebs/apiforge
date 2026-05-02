const router    = require('express').Router();
const auth      = require('../middleware/auth');
const validate  = require('../middleware/validate');
const { purchaseSchema } = require('../validators/creditSchema');
const { CREDIT_PACKS }   = require('../config/constants');
const walletsDb = require('../db/wallets');
const txDb      = require('../db/transactions');
const julyPay   = require('../services/julyPay');
const mailer    = require('../services/mailer');
const supabase  = require('../config/supabase');
const { success, error, paginate } = require('../utils/apiResponse');

// GET /credits/balance
router.get('/balance', auth, async (req, res) => {
  try {
    if (req.isAdmin) return success(res, { balance: Infinity, totalPurchased: 0, totalSpent: 0, note: 'Admin account — unlimited credits' });
    const balance = await walletsDb.getBalance(req.user.id);
    const { data: txs } = await txDb.listByUser(req.user.id, { limit: 1000 });
    const totalPurchased = txs.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const totalSpent     = txs.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    return success(res, { balance, totalPurchased, totalSpent });
  } catch (err) { return error(res, err.message, 500); }
});

// GET /credits/packs — list available credit packs
router.get('/packs', (req, res) => success(res, { packs: CREDIT_PACKS }));

// POST /credits/purchase — initiate JulyPay STK push
router.post('/purchase', auth, validate(purchaseSchema), async (req, res) => {
  if (req.isAdmin) return error(res, 'Admin account does not need credits', 400);
  try {
    const { packId, customerPhone } = req.body;
    const pack = CREDIT_PACKS.find(p => p.id === packId);
    if (!pack) return error(res, 'Invalid pack ID', 400, 'INVALID_REQUEST');

    const collection = await julyPay.collectPayment({
      customerPhone,
      amount:       pack.price_ugx,
      description:  `APKForge ${pack.label} — ${pack.credits} credits`,
      customerName: req.user.name,
    });

    // Store pending purchase in DB for webhook to confirm
    await supabase.from('pending_purchases').insert({
      user_id:        req.user.id,
      pack_id:        packId,
      credits:        pack.credits,
      amount_ugx:     pack.price_ugx,
      julypay_txn_id: collection.transaction_id,
      status:         'pending',
    });

    return success(res, {
      message:       'Payment request sent. Customer will receive an STK push.',
      transactionId: collection.transaction_id,
      reference:     collection.reference,
      amountUgx:     pack.price_ugx,
      credits:       pack.credits,
      status:        'pending',
    }, 202);
  } catch (err) { return error(res, err.message, 500); }
});

// GET /credits/purchase/:transactionId/status — poll JulyPay collection status
router.get('/purchase/:transactionId/status', auth, async (req, res) => {
  try {
    const status = await julyPay.getCollectionStatus(req.params.transactionId);
    return success(res, status);
  } catch (err) { return error(res, err.message, 500); }
});

// GET /credits/transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { data, count } = await txDb.listByUser(req.user.id, { page, limit });
    return paginate(res, data, count, page, limit);
  } catch (err) { return error(res, err.message, 500); }
});

module.exports = router;
