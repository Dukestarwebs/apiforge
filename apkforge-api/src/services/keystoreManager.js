const crypto = require('crypto');
const env    = require('../config/env');

const ALGORITHM = 'aes-256-cbc';
const KEY       = Buffer.from(env.KEYSTORE_ENCRYPTION_KEY, 'hex');

const encrypt = (data) => {
  const iv         = crypto.randomBytes(16);
  const cipher     = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted  = Buffer.concat([cipher.update(data), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (encryptedStr) => {
  const [ivHex, encHex] = encryptedStr.split(':');
  const iv              = Buffer.from(ivHex, 'hex');
  const encrypted       = Buffer.from(encHex, 'hex');
  const decipher        = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};

module.exports = { encrypt, decrypt };
