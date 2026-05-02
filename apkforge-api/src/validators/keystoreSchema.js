const { z } = require('zod');
const keystoreSchema = z.object({ keystoreBase64: z.string().min(1), alias: z.string().min(1), keystorePassword: z.string().min(1), keyPassword: z.string().min(1) });
module.exports = { keystoreSchema };
