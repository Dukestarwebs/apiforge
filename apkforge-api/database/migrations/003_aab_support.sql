-- Add AAB support columns (already included in 001 — this is a standalone patch for existing DBs)
ALTER TABLE build_jobs ADD COLUMN IF NOT EXISTS aab_storage_path TEXT;
ALTER TABLE build_jobs ADD COLUMN IF NOT EXISTS aab_size_bytes    BIGINT;
