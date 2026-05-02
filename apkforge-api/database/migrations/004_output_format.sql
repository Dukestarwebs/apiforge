-- Output format and webhook url columns
ALTER TABLE build_jobs  ADD COLUMN IF NOT EXISTS output_format TEXT NOT NULL DEFAULT 'apk';
ALTER TABLE api_users   ADD COLUMN IF NOT EXISTS webhook_url   TEXT;
