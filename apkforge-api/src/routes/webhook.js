const router  = require('express').Router();
const crypto  = require('crypto');
const env     = require('../config/env');
const buildJobsDb = require('../db/buildJobs');
const storage     = require('../services/storage');
const creditManager = require('../services/creditManager');
const walletsDb   = require('../db/wallets');
const txDb        = require('../db/transactions');
const mailer      = require('../services/mailer');
const usersDb     = require('../db/users');
const supabase    = require('../config/supabase');
const { success, error } = require('../utils/apiResponse');

// POST /webhooks/github — called by GitHub Actions when build completes
router.post('/github', async (req, res) => {
  const { jobId, status, apkStoragePath, aabStoragePath, apkSizeBytes, aabSizeBytes, errorMessage } = req.body;
  if (!jobId) return error(res, 'Missing jobId', 400);
  try {
    const job = await buildJobsDb.findById(jobId);
    if (!job) return error(res, 'Job not found', 404);

    if (status === 'success') {
      await buildJobsDb.updateStatus(jobId, 'success', {
        apk_storage_path: apkStoragePath || null,
        aab_storage_path: aabStoragePath || null,
        apk_size_bytes:   apkSizeBytes   || null,
        aab_size_bytes:   aabSizeBytes   || null,
        built_at:         new Date().toISOString(),
        error_message:    null,
      });
      // Email user
      const user = await usersDb.findById(job.user_id);
      if (user) mailer.sendBuildSuccess(user.email, user.name, jobId, job.app_name).catch(() => {});
    } else {
      // Refund credits on failure
      await creditManager.refund(job.user_id, job.credits_deducted, jobId);
      await buildJobsDb.updateStatus(jobId, 'failed', { error_message: errorMessage || 'Build failed', credits_refunded: job.credits_deducted });
      const user = await usersDb.findById(job.user_id);
      if (user) mailer.sendBuildFailed(user.email, user.name, job.app_name, errorMessage).catch(() => {});
    }
    return success(res, { received: true });
  } catch (err) { return error(res, err.message, 500); }
});

// POST /webhooks/julypay — JulyPay payment result callback
router.post('/julypay', async (req, res) => {
  // Verify webhook signature
  const event     = req.headers['x-julypay-event'];
  const signature = req.headers['x-julypay-signature'];
  const payload   = JSON.stringify(req.body);
  const expected  = crypto.createHmac('sha256', env.JULYPAY_WEBHOOK_SECRET).update(payload).digest('hex');
  if (signature !== expected) return error(res, 'Invalid signature', 401);

  try {
    const { type, data } = req.body;
    if (type === 'transaction.completed') {
      // Find pending purchase by julypay transaction id
      const { data: purchase, error: dbErr } = await supabase
        .from('pending_purchases').select('*').eq('julypay_txn_id', data.id).eq('status', 'pending').single();
      if (dbErr || !purchase) return success(res, { received: true });

      // Credit the user
      await walletsDb.addCredits(purchase.user_id, purchase.credits);
      await txDb.insert({ userId: purchase.user_id, type: 'credit', amount: purchase.credits, description: `Credit pack purchase — ${purchase.pack_id}`, referenceId: data.id });
      await supabase.from('pending_purchases').update({ status: 'completed' }).eq('id', purchase.id);

      // Send confirmation email
      const user = await usersDb.findById(purchase.user_id);
      if (user) mailer.sendPurchaseConfirm(user.email, user.name, purchase.credits, purchase.amount_ugx).catch(() => {});
    }
    return success(res, { received: true });
  } catch (err) { return error(res, err.message, 500); }
});

module.exports = router;
