require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
  SUPABASE_URL:              z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  GITHUB_TOKEN:              z.string().min(10),
  GITHUB_OWNER:              z.string().min(1),
  GITHUB_TEMPLATE_REPO:      z.string().min(1),
  GITHUB_BUILD_REPO:         z.string().min(1),
  ADMIN_API_KEY:             z.string().startsWith('apkf_admin_'),
  JWT_SECRET:                z.string().min(32),
  JULYPAY_API_KEY:           z.string().min(1),
  JULYPAY_BASE_URL:          z.string().url(),
  JULYPAY_WEBHOOK_SECRET:    z.string().min(1),
  RESEND_API_KEY:            z.string().min(1),
  EMAIL_FROM:                z.string().email(),
  KEYSTORE_ENCRYPTION_KEY:   z.string().min(32),
  NODE_ENV:   z.enum(['development','production','test']).default('development'),
  PORT:       z.string().default('3000'),
  API_BASE_URL: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:');
  parsed.error.issues.forEach(i => console.error(`  ${i.path.join('.')}: ${i.message}`));
  process.exit(1);
}
module.exports = parsed.data;
