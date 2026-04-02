-- ============================================================
-- HSK Trainer – Migration 005: Ensure profiles backfill
-- Run this in: Supabase Dashboard → SQL Editor
-- Safe to re-run (uses ON CONFLICT DO NOTHING)
-- ============================================================
--
-- Purpose: backfill profile rows for any auth.users that
-- somehow have no matching profiles row (e.g. created before
-- the trigger was set up, or if the trigger failed once).
-- The grant-by-email endpoint depends on profiles existing.
-- ============================================================

-- ─── Backfill missing profile rows ──────────────────────────
INSERT INTO public.profiles (id, email)
SELECT
  u.id,
  u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ─── Ensure trigger is robust (idempotent recreate) ─────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, COALESCE(new.email, ''))
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email
    WHERE profiles.email = '';
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
