const router  = require('express').Router();
const auth    = require('../middleware/auth');
const validate = require('../middleware/validate');
const { upgradeSchema } = require('../validators/subscriptionSchema');
const subsDb  = require('../db/subscriptions');
const { PLANS, CREDIT_PACKS } = require('../config/constants');
const julyPay = require('../services/julyPay');
const supabase = require('../config/supabase');
const { success, error } = require('../utils/apiResponse');

// GET /subscription
router.get('/', auth, async (req, res) => {
  try {
    if (req.isAdmin) return success(res, { plan:'agency', buildsUsed:0, monthlyBuilds:-1, note:'Admin — unlimited' });
    const sub  = await subsDb.getByUser(req.user.id);
    const plan = PLANS[sub?.plan || 'free'];
    return success(res, { plan: sub?.plan || 'free', planDetails: plan, buildsUsed: sub?.builds_used || 0, monthlyBuilds: plan.monthlyBuilds, periodStart: sub?.period_start, periodEnd: sub?.period_end });
  } catch (err) { return error(res, err.message, 500); }
});

// POST /subscription/upgrade
router.post('/upgrade', auth, validate(upgradeSchema), async (req, res) => {
  try {
    if (req.isAdmin) return error(res, 'Admin is already on unlimited plan', 400);
    const { plan, customerPhone } = req.body;
    const planDetails = PLANS[plan];
    if (!planDetails) return error(res, 'Invalid plan', 400);

    const collection = await julyPay.collectPayment({
      customerPhone, amount: planDetails.price_ugx,
      description: `APKForge ${planDetails.name} Plan — Monthly`,
      customerName: req.user.name,
    });

    // Store pending upgrade
    await supabase.from('pending_purchases').insert({
      user_id: req.user.id, pack_id: `plan_${plan}`,
      credits: 0, amount_ugx: planDetails.price_ugx,
      julypay_txn_id: collection.transaction_id,
      status: 'pending', meta: JSON.stringify({ type:'subscription', plan }),
    });

    return success(res, { message: 'Payment request sent', transactionId: collection.transaction_id, plan, priceUgx: planDetails.price_ugx }, 202);
  } catch (err) { return error(res, err.message, 500); }
});

module.exports = router;
