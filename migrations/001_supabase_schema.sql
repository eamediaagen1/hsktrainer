-- ============================================================
-- HSK Trainer – Supabase Schema v1
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── profiles ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT        NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_premium          BOOLEAN     NOT NULL DEFAULT false,
  premium_source      TEXT,                       -- 'gumroad' | 'admin'
  premium_granted_at  TIMESTAMPTZ,
  gumroad_email       TEXT,
  role                TEXT        NOT NULL DEFAULT 'user'  -- 'user' | 'admin'
);

-- ─── saved_words (spaced-repetition progress) ────────────────
CREATE TABLE IF NOT EXISTS saved_words (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  word_id      TEXT        NOT NULL,        -- e.g. 'hsk1-g1'
  next_review  TIMESTAMPTZ NOT NULL DEFAULT now(),
  interval_days INTEGER    NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, word_id)
);

-- ─── purchases (Gumroad webhook records) ────────────────────
CREATE TABLE IF NOT EXISTS purchases (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id           TEXT        UNIQUE NOT NULL,   -- Gumroad sale_id (idempotency)
  user_id           UUID        REFERENCES profiles(id),
  buyer_email       TEXT        NOT NULL,
  product_permalink TEXT        NOT NULL DEFAULT '',
  price_cents       INTEGER,
  refunded          BOOLEAN     NOT NULL DEFAULT false,
  raw_payload       JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Row Level Security ──────────────────────────────────────
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases   ENABLE ROW LEVEL SECURITY;

-- profiles: users can read and update only their own row
DROP POLICY IF EXISTS "users_select_own_profile"  ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile"  ON profiles;
CREATE POLICY "users_select_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'user');  -- prevents self-promotion to admin

-- saved_words: users manage only their own records
DROP POLICY IF EXISTS "users_manage_own_saved_words" ON saved_words;
CREATE POLICY "users_manage_own_saved_words" ON saved_words
  FOR ALL USING (auth.uid() = user_id);

-- purchases: users can see their own purchases
DROP POLICY IF EXISTS "users_select_own_purchases" ON purchases;
CREATE POLICY "users_select_own_purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);

-- ─── Auto-create profile on sign-up ─────────────────────────
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Grant admin role to ADMIN_EMAIL ────────────────────────
-- Run manually after your first sign-in:
-- UPDATE profiles SET role = 'admin' WHERE email = 'YOUR_ADMIN_EMAIL';
