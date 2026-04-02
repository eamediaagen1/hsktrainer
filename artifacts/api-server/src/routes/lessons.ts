import { Router } from "express";
import { requireAuth, requirePremium } from "../middleware/auth.js";
import { hskData } from "../data/hskData.js";

const router = Router();

/**
 * GET /api/lessons?level=N
 *
 * All HSK levels (1–6) require a valid JWT + is_premium = true (or role = 'admin').
 * There is no longer a free tier for any level.
 */
router.get("/lessons", requireAuth, requirePremium, async (req, res) => {
  const level = parseInt(String(req.query.level ?? ""), 10);

  if (!level || level < 1 || level > 6) {
    res.status(400).json({ error: "level must be an integer between 1 and 6" });
    return;
  }

  const words = hskData.filter((w) => w.hskLevel === level);
  res.json({ level, words });
});

export default router;
