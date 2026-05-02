const router      = require('express').Router();
const auth        = require('../middleware/auth');
const buildJobsDb = require('../db/buildJobs');
const storage     = require('../services/storage');
const { success, error, paginate } = require('../utils/apiResponse');

// GET /builds — list all builds for user
router.get('/', auth, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const userId = req.isAdmin ? req.query.userId : req.user.id;
    const { data, count } = await buildJobsDb.findByUser(userId, { page, limit });
    return paginate(res, data, count, page, limit);
  } catch (err) { return error(res, err.message, 500); }
});

// DELETE /builds/:jobId
router.delete('/:jobId', auth, async (req, res) => {
  try {
    const job = await buildJobsDb.findById(req.params.jobId);
    if (!job) return error(res, 'Job not found', 404, 'JOB_NOT_FOUND');
    if (!req.isAdmin && job.user_id !== req.user.id) return error(res, 'Job not found', 404, 'JOB_NOT_FOUND');
    if (job.apk_storage_path) await storage.deleteArtifact(job.apk_storage_path);
    if (job.aab_storage_path) await storage.deleteArtifact(job.aab_storage_path);
    await buildJobsDb.deleteJob(job.id, req.isAdmin ? job.user_id : req.user.id);
    return success(res, { message: 'Build deleted' });
  } catch (err) { return error(res, err.message, 500); }
});

module.exports = router;
