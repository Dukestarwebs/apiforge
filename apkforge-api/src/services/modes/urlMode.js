const { generateCapacitorConfig } = require('../../utils/webviewConfig');
// Prepare inputs for url mode — wraps a URL in a WebView Capacitor app
const prepare = async ({ url, appName, packageName }) => {
  const config = generateCapacitorConfig({ appName, packageName, url });
  return { repoUrl: '', branch: 'main', buildCmd: '', githubPat: '',
    extra: JSON.stringify({ type:'url', capacitorConfig: config }) };
};
module.exports = { prepare };
