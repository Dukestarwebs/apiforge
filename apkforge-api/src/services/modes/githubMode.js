// Prepare inputs for github mode — clone a repo, run build cmd, hand off to zip pipeline
const prepare = async ({ repoUrl, branch = 'main', buildCmd = 'npm run build', githubPat = '' }) => {
  return { repoUrl, branch, buildCmd, githubPat, extra: JSON.stringify({ type:'github' }) };
};
module.exports = { prepare };
