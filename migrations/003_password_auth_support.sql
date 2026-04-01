-- ============================================================
-- HSK Trainer – Migration 003: Password auth support
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================
--
-- The handle_new_user() trigger from migration 001 already covers
-- password signups — it fires on ANY insert into auth.users, so
-- no new trigger is needed.
--
-- This migration just makes the trigger idempotent (safe to re-run)
-- and adds a performance index on profiles.email if missing.
-- ============================================================

-- Recreate the profile trigger function safely (idempotent)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Ensure the trigger exists (safe: DROP IF EXISTS then recreate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Performance index on email (used heavily by admin search)
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);

-- ─── REQUIRED SUPABASE DASHBOARD STEPS ──────────────────────
--
-- To enable Email + Password login:
--
-- 1. Go to: https://supabase.com/dashboard/project/kztonbtojocwsudwknrb
-- 2. Click "Authentication" in the left sidebar
-- 3. Click "Providers"
-- 4. Find "Email" and click it to expand
-- 5. Ensure "Enable Email provider" is ON (toggle)
-- 6. For testing WITHOUT email confirmation:
--      Turn OFF "Confirm email" — users log in immediately after signup
-- 7. For production WITH email confirmation:
--      Leave "Confirm email" ON — users get a confirmation email first
-- 8. Click "Save"
--
-- That's it. No code changes needed for either setting —
-- the app handles both flows (signUpWithPassword returns
-- { needsConfirmation: true } when confirmation is required).
-- ============================================================
