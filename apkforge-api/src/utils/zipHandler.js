const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const decodeAndExtract = (base64Zip, destDir) => {
  const zipPath = path.join(destDir, 'upload.zip');
  fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(zipPath, Buffer.from(base64Zip, 'base64'));
  execSync(`unzip -q "${zipPath}" -d "${destDir}"`);
  fs.unlinkSync(zipPath);
  return destDir;
};
module.exports = { decodeAndExtract };
