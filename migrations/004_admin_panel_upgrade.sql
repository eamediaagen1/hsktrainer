-- ============================================================
-- HSK Trainer – Migration 004: Admin panel upgrade
-- Run this in: Supabase Dashboard → SQL Editor
-- Safe to re-run (all statements are idempotent)
-- ============================================================

-- ─── Performance indexes ──────────────────────────────────────

-- profiles: partial email search (ILIKE %fragment%)
CREATE INDEX IF NOT EXISTS profiles_email_idx
  ON public.profiles (email);

-- profiles: filter by premium status
CREATE INDEX IF NOT EXISTS profiles_is_premium_idx
  ON public.profiles (is_premium);

-- profiles: recent signups sort
CREATE INDEX IF NOT EXISTS profiles_created_at_idx
  ON public.profiles (created_at DESC);

-- purchases: filter by refund status
CREATE INDEX IF NOT EXISTS purchases_refunded_idx
  ON public.purchases (refunded);

-- purchases: filter by linked status (IS NULL / IS NOT NULL)
CREATE INDEX IF NOT EXISTS purchases_user_id_idx
  ON public.purchases (user_id);

-- purchases: recent purchases sort
CREATE INDEX IF NOT EXISTS purchases_created_at_idx
  ON public.purchases (created_at DESC);

-- admin_logs: filter by action type
CREATE INDEX IF NOT EXISTS admin_logs_action_idx
  ON public.admin_logs (action);

-- admin_logs: filter by target user
CREATE INDEX IF NOT EXISTS admin_logs_target_user_idx
  ON public.admin_logs (target_user_id);

-- admin_logs: sort by recent
CREATE INDEX IF NOT EXISTS admin_logs_created_at_idx
  ON public.admin_logs (created_at DESC);

-- saved_words: count per user
CREATE INDEX IF NOT EXISTS saved_words_user_id_idx
  ON public.saved_words (user_id);

-- ─── Seed any missing app_settings ───────────────────────────
-- (idempotent — ON CONFLICT DO NOTHING)
INSERT INTO app_settings (key, value, description) VALUES
  ('support_email',                 '"support@example.com"', 'Support contact email shown to users'),
  ('premium_cta_text',              '"Unlock HSK 2–6"',      'Text shown on premium upgrade prompts'),
  ('maintenance_message',           'null',                  'If non-null, shown as a banner to all users'),
  ('gumroad_checkout_url_override', 'null',                  'Override Gumroad checkout URL'),
  ('marketing_banner_enabled',      'false',                 'Whether to show the marketing banner')
ON CONFLICT (key) DO NOTHING;
