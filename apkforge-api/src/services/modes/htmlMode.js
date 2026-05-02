// Prepare inputs for html mode — injects HTML/CSS/JS into Capacitor www/
const prepare = async ({ html, css = '', js = '' }) => {
  // The GitHub Actions workflow will receive these as base64 encoded strings
  const htmlB64 = Buffer.from(html).toString('base64');
  const cssB64  = Buffer.from(css).toString('base64');
  const jsB64   = Buffer.from(js).toString('base64');
  return { repoUrl: '', branch: 'main', buildCmd: '', githubPat: '',
    extra: JSON.stringify({ type:'html', html: htmlB64, css: cssB64, js: jsB64 }) };
};
module.exports = { prepare };
