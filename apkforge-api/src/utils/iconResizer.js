const sharp = require('sharp');
const fs    = require('fs');
const path  = require('path');
const DENSITIES = [
  { name:'mipmap-mdpi',    size:48  },
  { name:'mipmap-hdpi',    size:72  },
  { name:'mipmap-xhdpi',   size:96  },
  { name:'mipmap-xxhdpi',  size:144 },
  { name:'mipmap-xxxhdpi', size:192 },
];
const resizeIcon = async (base64Png, resDir) => {
  const buf = Buffer.from(base64Png, 'base64');
  for (const d of DENSITIES) {
    const out = path.join(resDir, d.name);
    fs.mkdirSync(out, { recursive: true });
    await sharp(buf).resize(d.size, d.size).png().toFile(path.join(out, 'ic_launcher.png'));
    await sharp(buf).resize(d.size, d.size).png().toFile(path.join(out, 'ic_launcher_round.png'));
  }
};
module.exports = { resizeIcon };
