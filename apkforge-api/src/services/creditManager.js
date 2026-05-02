const { CREDIT_COSTS, PLANS } = require('../config/constants');
const walletsDb = require('../db/wallets');
const txDb      = require('../db/transactions');

const estimateCost = ({ mode, outputFormat, options = {} }) => {
  let cost = CREDIT_COSTS.mode[mode] || 1;
  if (outputFormat === 'both') cost += CREDIT_COSTS.outputBoth;
  for (const [opt, enabled] of Object.entries(options)) {
    if (enabled && CREDIT_COSTS.options[opt] !== undefined) cost += CREDIT_COSTS.options[opt];
  }
  return cost;
};

const deductForBuild = async (userId, cost, jobId) => {
  const balance = await walletsDb.getBalance(userId);
  if (balance < cost) throw Object.assign(new Error('Insufficient credits'), { code: 'INSUFFICIENT_CREDITS', statusCode: 402 });
  await walletsDb.deductCredits(userId, cost);
  await txDb.insert({ userId, type: 'debit', amount: cost, description: `Build job`, referenceId: jobId });
  return await walletsDb.getBalance(userId);
};

const refund = async (userId, amount, jobId) => {
  await walletsDb.addCredits(userId, amount);
  await txDb.insert({ userId, type: 'refund', amount, description: `Refund for failed build`, referenceId: jobId });
};

const checkPlanLimit = async (userId, subscription) => {
  if (!subscription) return;
  const plan = PLANS[subscription.plan];
  if (!plan) return;
  if (plan.monthlyBuilds === -1) return; // unlimited
  if (subscription.builds_used >= plan.monthlyBuilds) {
    throw Object.assign(new Error(`Monthly build limit reached for ${plan.name} plan`), { code: 'PLAN_LIMIT_REACHED', statusCode: 403 });
  }
};

module.exports = { estimateCost, deductForBuild, refund, checkPlanLimit };
