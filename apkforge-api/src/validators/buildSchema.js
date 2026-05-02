const { z } = require('zod');

const optionsSchema = z.object({
  signedApk:         z.boolean().default(false),
  offlineSupport:    z.boolean().default(false),
  pushNotifications: z.boolean().default(false),
  submitToPlayStore: z.boolean().default(false),
  useOwnKeystore:    z.boolean().default(false),
}).optional().default({});

const baseFields = {
  appName:      z.string().min(1).max(50),
  packageName:  z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){2,}$/, 'Invalid Android package name'),
  versionName:  z.string().default('1.0.0'),
  versionCode:  z.number().int().min(1).default(1),
  orientation:  z.enum(['portrait','landscape','unspecified']).default('portrait'),
  outputFormat: z.enum(['apk','aab','both']).default('apk'),
  icon:         z.string().optional(),
  splashScreen: z.string().optional(),
  options:      optionsSchema,
};

const htmlSchema = z.object({ ...baseFields, mode: z.literal('html'), html: z.string().min(1), css: z.string().optional(), js: z.string().optional() });
const urlSchema  = z.object({ ...baseFields, mode: z.literal('url'),  url: z.string().url() });
const zipSchema  = z.object({ ...baseFields, mode: z.literal('zip'),  distZip: z.string().min(1) });
const githubSchema = z.object({ ...baseFields, mode: z.literal('github'), repoUrl: z.string().url(), branch: z.string().default('main'), buildCmd: z.string().default('npm run build'), githubPat: z.string().optional() });

const buildSchema = z.discriminatedUnion('mode', [htmlSchema, urlSchema, zipSchema, githubSchema]);

const estimateSchema = z.object({
  mode:         z.enum(['html','url','zip','github']),
  outputFormat: z.enum(['apk','aab','both']).default('apk'),
  options:      optionsSchema,
});

module.exports = { buildSchema, estimateSchema };
