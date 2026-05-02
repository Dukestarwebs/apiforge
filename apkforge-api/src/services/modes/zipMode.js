// Prepare inputs for zip mode — user supplies a base64-encoded dist ZIP
const prepare = async ({ distZip }) => {
  return { repoUrl: '', branch: 'main', buildCmd: '', githubPat: '',
    extra: JSON.stringify({ type:'zip', distZip }) };
};
module.exports = { prepare };
