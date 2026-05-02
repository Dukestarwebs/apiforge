-- APKForge Initial Schema
-- Run this on your Supabase project

-- Users table
CREATE TABLE IF NOT EXISTS api_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  webhook_url   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES api_users(id) ON DELETE CASCADE,
  key_hash     TEXT UNIQUE NOT NULL,
  key_prefix   TEXT NOT NULL,
  label        TEXT DEFAULT 'My Key',
  is_active    BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Wallets
CREATE TABLE IF NOT EXISTS wallets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID UNIQUE REFERENCES api_users(id) ON DELETE CASCADE,
  balance    INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES api_users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('credit','debit','refund','bonus')),
  amount       INTEGER NOT NULL,
  description  TEXT,
  reference_id TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID UNIQUE REFERENCES api_users(id) ON DELETE CASCADE,
  plan         TEXT NOT NULL DEFAULT 'free',
  builds_used  INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ DEFAULT NOW(),
  period_end   TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 month',
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Build jobs
CREATE TABLE IF NOT EXISTS build_jobs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES api_users(id) ON DELETE CASCADE,
  mode              TEXT NOT NULL CHECK (mode IN ('html','url','zip','github')),
  output_format     TEXT NOT NULL DEFAULT 'apk',
  status            TEXT NOT NULL DEFAULT 'queued',
  app_name          TEXT NOT NULL,
  package_name      TEXT NOT NULL,
  credits_deducted  INTEGER NOT NULL DEFAULT 0,
  credits_refunded  INTEGER,
  apk_storage_path  TEXT,
  aab_storage_path  TEXT,
  apk_size_bytes    BIGINT,
  aab_size_bytes    BIGINT,
  error_message     TEXT,
  built_at          TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Keystores
CREATE TABLE IF NOT EXISTS keystores (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID UNIQUE REFERENCES api_users(id) ON DELETE CASCADE,
  encrypted_data TEXT NOT NULL,
  alias          TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Play Store connections
CREATE TABLE IF NOT EXISTS playstore_connections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE REFERENCES api_users(id) ON DELETE CASCADE,
  encrypted_token TEXT NOT NULL,
  package_name    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Pending JulyPay purchases
CREATE TABLE IF NOT EXISTS pending_purchases (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES api_users(id) ON DELETE CASCADE,
  pack_id        TEXT NOT NULL,
  credits        INTEGER NOT NULL DEFAULT 0,
  amount_ugx     INTEGER NOT NULL,
  julypay_txn_id TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending',
  meta           JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_hash        ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_build_jobs_user_id   ON build_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_build_jobs_status    ON build_jobs(status);
CREATE INDEX IF NOT EXISTS idx_build_jobs_expires   ON build_jobs(expires_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON credit_transactions(user_id);
