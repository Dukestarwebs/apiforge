const octokit  = require('../config/octokit');
const env      = require('../config/env');
const { retry } = require('../utils/retry');

const triggerBuild = async ({ jobId, mode, outputFormat, gradleTasks, repoUrl, branch, buildCmd, githubPat }) => {
  await retry(() => octokit.actions.createWorkflowDispatch({
    owner:    env.GITHUB_OWNER,
    repo:     env.GITHUB_BUILD_REPO,
    workflow_id: `build-${outputFormat === 'both' ? 'both' : outputFormat}.yml`,
    ref:      'main',
    inputs: {
      job_id:        jobId,
      mode,
      output_format: outputFormat,
      gradle_tasks:  gradleTasks,
      repo_url:      repoUrl      || '',
      branch:        branch       || 'main',
      build_cmd:     buildCmd     || 'npm run build',
      github_pat:    githubPat    || '',
    },
  }));
};

const getRunStatus = async (runId) => {
  const { data } = await octokit.actions.getWorkflowRun({
    owner:   env.GITHUB_OWNER,
    repo:    env.GITHUB_BUILD_REPO,
    run_id:  runId,
  });
  return { status: data.status, conclusion: data.conclusion };
};

module.exports = { triggerBuild, getRunStatus };
