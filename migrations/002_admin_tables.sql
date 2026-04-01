-- ============================================================
-- HSK Trainer – Admin Schema v2
-- Run this in: Supabase Dashboard → SQL Editor
-- Safe to re-run (uses IF NOT EXISTS / ON CONFLICT DO NOTHING)
-- ============================================================

-- ─── Add updated_at to profiles ──────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ─── admin_logs ──────────────────────────────────────────────
-- Records every manual admin action (grant, revoke, link, etc.)
CREATE TABLE IF NOT EXISTS admin_logs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id  UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  action          TEXT        NOT NULL,     -- 'grant_premium' | 'revoke_premium' | 'link_purchase' | 'update_setting'
  reason          TEXT,                     -- optional human note
  meta            JSONB,                    -- extra structured context
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
-- All admin_logs reads/writes go through the service role from backend only.
-- No user-facing RLS policies — the table is invisible to normal users.

-- ─── app_settings ────────────────────────────────────────────
-- Non-secret runtime configuration editable by admin.
-- Never store API keys or secrets here.
CREATE TABLE IF NOT EXISTS app_settings (
  key         TEXT        PRIMARY KEY,
  value       JSONB       NOT NULL DEFAULT '"" '::jsonb,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID        REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
-- All reads/writes go through the service role from backend only.

-- ─── Seed default settings ───────────────────────────────────
INSERT INTO app_settings (key, value, description) VALUES
  ('support_email',                '"support@example.com"',   'Support contact email shown to users'),
  ('premium_cta_text',             '"Unlock HSK 2–6"',        'Text shown on premium upgrade prompts'),
  ('maintenance_message',          'null',                    'If non-null, shown as a banner to all users'),
  ('gumroad_checkout_url_override','null',                    'Override Gumroad checkout URL (null = use VITE_GUMROAD_URL env var)'),
  ('marketing_banner_enabled',     'false',                   'Whether to show the marketing banner on the landing page')
ON CONFLICT (key) DO NOTHING;
