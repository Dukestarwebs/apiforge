const generateCapacitorConfig = ({ appName, packageName, url }) => ({
  appId: packageName, appName,
  webDir: 'www',
  server: { url, cleartext: true, androidScheme: 'https' },
  android: { allowMixedContent: true },
});
module.exports = { generateCapacitorConfig };
