import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { hskData } from "../data/hskData.js";

const router = Router();

/**
 * GET /api/lessons?level=N
 *
 * Level 1 — public, no auth required.
 * Level 2–6 — requires a valid Supabase JWT + is_premium = true (or role = 'admin').
 */
router.get("/lessons", async (req, res) => {
  const level = parseInt(String(req.query.level ?? ""), 10);

  if (!level || level < 1 || level > 6) {
    res.status(400).json({ error: "level must be an integer between 1 and 6" });
    return;
  }

  // ── Level 1 is free ────────────────────────────────────────────────────────
  if (level === 1) {
    const words = hskData.filter((w) => w.hskLevel === 1);
    res.json({ level, words });
    return;
  }

  // ── Levels 2–6 require auth + premium ──────────────────────────────────────
  const token = req.headers.authorization?.replace("Bearer ", "").trim();
  if (!token) {
    res.status(401).json({ error: "Authentication required for HSK 2–6" });
    return;
  }

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_premium, role")
    .eq("id", user.id)
    .single();

  if (!profile?.is_premium && profile?.role !== "admin") {
    res.status(403).json({ error: "Premium subscription required for HSK 2–6" });
    return;
  }

  const words = hskData.filter((w) => w.hskLevel === level);
  res.json({ level, words });
});

export default router;
