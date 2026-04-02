import { supabaseAdmin } from "./supabase.js";
import { logger } from "./logger.js";

const MIGRATION_006_SQL = `
CREATE TABLE IF NOT EXISTS level_progress (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level        INTEGER     NOT NULL CHECK (level BETWEEN 1 AND 6),
  exam_passed  BOOLEAN     NOT NULL DEFAULT false,
  exam_score   INTEGER,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, level)
);

ALTER TABLE level_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_level_progress" ON level_progress;
CREATE POLICY "users_manage_own_level_progress" ON level_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS level_progress_user_id_idx ON public.level_progress (user_id);
CREATE INDEX IF NOT EXISTS level_progress_level_idx   ON public.level_progress (user_id, level);
`;

export const MIGRATION_006_SQL_EXPORT = MIGRATION_006_SQL;

async function tryPgQuery(supabaseUrl: string, serviceKey: string, sql: string): Promise<boolean> {
  try {
    const response = await fetch(`${supabaseUrl}/pg/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
        "apikey": serviceKey,
      },
      body: JSON.stringify({ query: sql }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function runMigration006IfNeeded(): Promise<{ ran: boolean; note: string }> {
  const { error } = await supabaseAdmin
    .from("level_progress")
    .select("id")
    .limit(0);

  if (!error) {
    return { ran: false, note: "level_progress table already exists" };
  }

  const isMissing =
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    (error.message ?? "").toLowerCase().includes("does not exist") ||
    (error.message ?? "").toLowerCase().includes("schema cache");

  if (!isMissing) {
    logger.warn(
      { code: error.code, msg: error.message },
      "Unexpected error checking level_progress table — treating as missing and attempting migration"
    );
  }

  logger.warn("level_progress table missing — attempting auto-migration 006...");

  const supabaseUrl = process.env.SUPABASE_URL ?? "";
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  const ok = await tryPgQuery(supabaseUrl, serviceKey, MIGRATION_006_SQL);

  if (ok) {
    logger.info("Migration 006 applied automatically ✓");
    return { ran: true, note: "Migration 006 applied via pg/query" };
  }

  logger.warn(
    "Auto-migration 006 failed — please run migrations/006_level_progress.sql in Supabase SQL Editor"
  );
  return {
    ran: false,
    note: "Auto-migration failed. Run migrations/006_level_progress.sql manually in Supabase SQL Editor.",
  };
}
