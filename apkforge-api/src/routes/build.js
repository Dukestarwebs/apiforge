const router      = require('express').Router();
const auth        = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const validate    = require('../middleware/validate');
const { buildSchema, estimateSchema } = require('../validators/buildSchema');
const buildOrchestrator = require('../services/buildOrchestrator');
const creditManager     = require('../services/creditManager');
const buildJobsDb       = require('../db/buildJobs');
const storage           = require('../services/storage');
const walletsDb         = require('../db/wallets');
const { success, error } = require('../utils/apiResponse');

// POST /build/estimate — no credits deducted, no build started
router.post('/estimate', auth, async (req, res) => {
  try {
    const result  = estimateSchema.safeParse(req.body);
    if (!result.success) return error(res, 'Invalid request', 400);
    const { mode, outputFormat, options } = result.data;
    const cost    = creditManager.estimateCost({ mode, outputFormat, options });
    const balance = req.isAdmin ? Infinity : await walletsDb.getBalance(req.user.id);
    const breakdown = {
      baseMode:    require('../config/constants').CREDIT_COSTS.mode[mode],
      ...(outputFormat === 'both' ? { outputBoth: 1 } : {}),
      ...Object.fromEntries(Object.entries(options || {}).filter(([k,v]) => v && require('../config/constants').CREDIT_COSTS.options[k]).map(([k]) => [k, require('../config/constants').CREDIT_COSTS.options[k]])),
    };
    return success(res, { estimatedCredits: cost, breakdown, currentBalance: balance, canAfford: balance >= cost });
  } catch (err) { return error(res, err.message, 500); }
});

// POST /build — submit a build job
router.post('/', auth, rateLimiter, validate(buildSchema), async (req, res) => {
  try {
    const result = await buildOrchestrator.startBuild(req.isAdmin ? 'admin' : req.user.id, req.body);
    return success(res, result, 202);
  } catch (err) {
    if (err.statusCode) return error(res, err.message, err.statusCode, err.code);
    return error(res, 'Build submission failed: ' + err.message, 500, 'BUILD_ENGINE_ERROR');
  }
});

// GET /build/status/:jobId
router.get('/status/:jobId', auth, async (req, res) => {
  try {
    const job = await buildJobsDb.findById(req.params.jobId);
    if (!job) return error(res, 'Job not found', 404, 'JOB_NOT_FOUND');
    if (!req.isAdmin && job.user_id !== req.user.id) return error(res, 'Job not found', 404, 'JOB_NOT_FOUND');
    return success(res, { jobId: job.id, status: job.status, appName: job.app_name, outputFormat: job.output_format, errorMessage: job.error_message, creditsRefunded: job.credits_refunded, builtAt: job.built_at, expiresAt: job.expires_at });
  } catch (err) { return error(res, err.message, 500); }
});

// GET /build/download/:jobId
router.get('/download/:jobId', auth, async (req, res) => {
  try {
    const job = await buildJobsDb.findById(req.params.jobId);
    if (!job) return error(res, 'Job not found', 404, 'JOB_NOT_FOUND');
    if (!req.isAdmin && job.user_id !== req.user.id) return error(res, 'Job not found', 404, 'JOB_NOT_FOUND');
    if (job.status === 'expired') return error(res, 'Build artifact has expired', 410, 'JOB_EXPIRED');
    if (job.status !== 'success') return error(res, `Build is not complete. Status: ${job.status}`, 400);

    const response = { jobId: job.id, status: job.status, appName: job.app_name, outputFormat: job.output_format };
    if (job.apk_storage_path) response.apk_url = await storage.getDownloadUrl(job.apk_storage_path);
    if (job.aab_storage_path) response.aab_url = await storage.getDownloadUrl(job.aab_storage_path);
    if (job.apk_size_bytes)   response.apkSizeBytes = job.apk_size_bytes;
    if (job.aab_size_bytes)   response.aabSizeBytes = job.aab_size_bytes;
    response.builtAt   = job.built_at;
    response.expiresAt = job.expires_at;
    return success(res, response);
  } catch (err) { return error(res, err.message, 500); }
});

module.exports = router;
