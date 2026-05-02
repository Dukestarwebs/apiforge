// Cron job routes — called by Vercel Cron
const router   = require('express').Router();
const buildJobsDb = require('../db/buildJobs');
const storage     = require('../services/storage');
const creditManager = require('../services/creditManager');
const { BUILD_TIMEOUT_MS } = require('../config/constants');
const { success } = require('../utils/apiResponse');

// GET /jobs/cleanup — delete expired artifacts (runs daily at 2am)
router.get('/cleanup', async (req, res) => {
  const expired = await buildJobsDb.findExpired();
  let deleted = 0;
  for (const job of expired) {
    if (job.apk_storage_path) await storage.deleteArtifact(job.apk_storage_path).catch(() => {});
    if (job.aab_storage_path) await storage.deleteArtifact(job.aab_storage_path).catch(() => {});
    await buildJobsDb.markExpired(job.id);
    deleted++;
  }
  console.log(`Cleanup: ${deleted} expired builds removed`);
  return success(res, { cleaned: deleted });
});

// GET /jobs/stuck-builds — detect stuck builds, refund credits (runs hourly)
router.get('/stuck-builds', async (req, res) => {
  const stuck = await buildJobsDb.findStuck(BUILD_TIMEOUT_MS);
  let fixed = 0;
  for (const job of stuck) {
    await creditManager.refund(job.user_id, job.credits_deducted, job.id);
    await buildJobsDb.updateStatus(job.id, 'failed', { error_message: 'Build timed out — credits refunded', credits_refunded: job.credits_deducted });
    fixed++;
  }
  console.log(`Stuck builds: ${fixed} jobs reset`);
  return success(res, { fixed });
});

// GET /jobs/subscriptions — renew monthly subscription counters (runs daily at 3am)
router.get('/subscriptions', async (req, res) => {
  const { data: expiredSubs } = await require('../config/supabase')
    .from('subscriptions').select('*').lt('period_end', new Date().toISOString());
  let renewed = 0;
  for (const sub of (expiredSubs || [])) {
    const now = new Date(); const end = new Date(now); end.setMonth(end.getMonth() + 1);
    await require('../config/supabase').from('subscriptions').update({ builds_used: 0, period_start: now.toISOString(), period_end: end.toISOString() }).eq('id', sub.id);
    renewed++;
  }
  return success(res, { renewed });
});

module.exports = router;
