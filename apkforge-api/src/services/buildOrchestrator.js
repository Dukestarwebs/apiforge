const { v4: uuidv4 }   = require('uuid');
const buildJobsDb      = require('../db/buildJobs');
const walletsDb        = require('../db/wallets');
const subscriptionsDb  = require('../db/subscriptions');
const creditManager    = require('./creditManager');
const githubActions    = require('./githubActions');
const mailer           = require('./mailer');
const { getGradleTasks } = require('../utils/outputFormat');

const htmlMode   = require('./modes/htmlMode');
const urlMode    = require('./modes/urlMode');
const zipMode    = require('./modes/zipMode');
const githubMode = require('./modes/githubMode');

const modeHandlers = { html: htmlMode, url: urlMode, zip: zipMode, github: githubMode };

const startBuild = async (userId, buildData) => {
  const { mode, outputFormat, appName, packageName, options = {} } = buildData;

  // 1. Check plan limits
  const subscription = await subscriptionsDb.getByUser(userId);
  await creditManager.checkPlanLimit(userId, subscription);

  // 2. Estimate and deduct credits
  const cost         = creditManager.estimateCost({ mode, outputFormat, options });
  const jobId        = uuidv4();
  const remaining    = await creditManager.deductForBuild(userId, cost, jobId);

  // 3. Create job record
  const job = await buildJobsDb.create({ userId, mode, outputFormat, appName, packageName, creditsDeducted: cost });

  // 4. Get mode-specific inputs for the workflow
  const handler    = modeHandlers[mode];
  const workflowInputs = await handler.prepare(buildData);

  // 5. Trigger GitHub Actions
  try {
    await githubActions.triggerBuild({
      jobId:        job.id,
      mode,
      outputFormat,
      gradleTasks:  getGradleTasks(outputFormat),
      ...workflowInputs,
    });
    await buildJobsDb.updateStatus(job.id, 'building');
  } catch (err) {
    // Refund if trigger fails
    await creditManager.refund(userId, cost, job.id);
    await buildJobsDb.updateStatus(job.id, 'failed', { error_message: err.message });
    throw err;
  }

  // 6. Increment subscription build count
  subscriptionsDb.incrementBuilds(userId).catch(() => {});

  return { jobId: job.id, status: 'queued', creditsDeducted: cost, creditsRemaining: remaining };
};

module.exports = { startBuild };
