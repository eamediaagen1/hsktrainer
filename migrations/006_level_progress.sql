-- ============================================================
-- HSK Trainer – Migration 006: Level progression tracking
-- Run this in: Supabase Dashboard → SQL Editor
-- Safe to re-run (uses IF NOT EXISTS / ON CONFLICT DO NOTHING)
-- ============================================================

-- ─── level_progress ──────────────────────────────────────────
-- One row per (user, level). Tracks exam pass/fail and unlocks.

CREATE TABLE IF NOT EXISTS level_progress (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level        INTEGER     NOT NULL CHECK (level BETWEEN 1 AND 6),
  exam_passed  BOOLEAN     NOT NULL DEFAULT false,
  exam_score   INTEGER,                    -- percentage 0–100
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, level)
);

ALTER TABLE level_progress ENABLE ROW LEVEL SECURITY;

-- Users can read/write only their own rows
DROP POLICY IF EXISTS "users_manage_own_level_progress" ON level_progress;
CREATE POLICY "users_manage_own_level_progress" ON level_progress
  FOR ALL USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS level_progress_user_id_idx ON public.level_progress (user_id);
CREATE INDEX IF NOT EXISTS level_progress_level_idx   ON public.level_progress (user_id, level);
