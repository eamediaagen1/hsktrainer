import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { hskData } from "../data/hskData.js";

const router = Router();

interface SavedWordRow {
  word_id: string;
  next_review: string;
  interval_days: number;
}

// GET /api/progress — get all saved words for the current user, enriched with word details
router.get("/progress", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("saved_words")
    .select("word_id, next_review, interval_days")
    .eq("user_id", req.user!.id)
    .order("next_review", { ascending: true });

  if (error) {
    res.status(500).json({ error: "Failed to fetch progress" });
    return;
  }

  // Enrich each row with the word details from the local data source
  const enriched = (data as SavedWordRow[]).map((row) => {
    const word = hskData.find((w) => w.id === row.word_id);
    return { ...row, ...(word ?? {}) };
  });

  res.json(enriched);
});

// POST /api/progress — save or unsave a word
router.post("/progress", requireAuth, async (req, res) => {
  const { word_id, action } = req.body as {
    word_id?: string;
    action?: "save" | "unsave";
  };

  if (!word_id || !action) {
    res.status(400).json({ error: "word_id and action are required" });
    return;
  }

  if (action === "save") {
    const { error } = await supabaseAdmin.from("saved_words").upsert(
      {
        user_id: req.user!.id,
        word_id,
        next_review: new Date().toISOString(),
        interval_days: 0,
      },
      { onConflict: "user_id,word_id" }
    );
    if (error) {
      res.status(500).json({ error: "Failed to save word" });
      return;
    }
    res.json({ success: true, action: "saved" });
  } else if (action === "unsave") {
    const { error } = await supabaseAdmin
      .from("saved_words")
      .delete()
      .eq("user_id", req.user!.id)
      .eq("word_id", word_id);
    if (error) {
      res.status(500).json({ error: "Failed to unsave word" });
      return;
    }
    res.json({ success: true, action: "unsaved" });
  } else {
    res.status(400).json({ error: "action must be 'save' or 'unsave'" });
  }
});

// PATCH /api/progress/:wordId — update spaced-repetition schedule
router.patch("/progress/:wordId", requireAuth, async (req, res) => {
  const { wordId } = req.params;
  const { difficulty } = req.body as {
    difficulty?: "hard" | "good" | "easy";
  };

  if (!difficulty || !["hard", "good", "easy"].includes(difficulty)) {
    res.status(400).json({ error: "difficulty must be 'hard', 'good', or 'easy'" });
    return;
  }

  const { data: current } = await supabaseAdmin
    .from("saved_words")
    .select("interval_days")
    .eq("user_id", req.user!.id)
    .eq("word_id", wordId)
    .maybeSingle();

  const currentInterval = current?.interval_days ?? 0;

  let newInterval: number;
  if (difficulty === "hard") newInterval = 1;
  else if (difficulty === "good") newInterval = Math.max(3, currentInterval * 2);
  else newInterval = Math.max(7, currentInterval * 3);

  const nextReview = new Date(
    Date.now() + newInterval * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error } = await supabaseAdmin
    .from("saved_words")
    .update({ interval_days: newInterval, next_review: nextReview })
    .eq("user_id", req.user!.id)
    .eq("word_id", wordId);

  if (error) {
    res.status(500).json({ error: "Failed to update review schedule" });
    return;
  }

  res.json({ success: true, next_review: nextReview, interval_days: newInterval });
});

// POST /api/progress/migrate — migrate localStorage saved cards on first sign-in
router.post("/progress/migrate", requireAuth, async (req, res) => {
  const { saved_cards } = req.body as {
    saved_cards?: Record<string, { id: string; nextReview: number; interval: number }>;
  };

  if (!saved_cards || typeof saved_cards !== "object") {
    res.status(400).json({ error: "saved_cards is required" });
    return;
  }

  const rows = Object.values(saved_cards).map((card) => ({
    user_id: req.user!.id,
    word_id: card.id,
    next_review: new Date(card.nextReview ?? Date.now()).toISOString(),
    interval_days: card.interval ?? 0,
  }));

  if (rows.length === 0) {
    res.json({ success: true, migrated: 0 });
    return;
  }

  const { error } = await supabaseAdmin
    .from("saved_words")
    .upsert(rows, { onConflict: "user_id,word_id", ignoreDuplicates: true });

  if (error) {
    res.status(500).json({ error: "Migration failed" });
    return;
  }

  res.json({ success: true, migrated: rows.length });
});

export default router;
