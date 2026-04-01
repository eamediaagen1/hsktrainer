import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { syncLimiter } from "../middleware/rate-limit.js";

const router = Router();

// GET /api/me — return profile + premium status
router.get("/me", requireAuth, async (req, res) => {
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, is_premium, premium_source, premium_granted_at, role, created_at")
    .eq("id", req.user!.id)
    .single();

  if (error || !profile) {
    // Profile may not exist yet (trigger delay) — create it
    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from("profiles")
      .insert({ id: req.user!.id, email: req.user!.email })
      .select("id, email, is_premium, premium_source, premium_granted_at, role, created_at")
      .single();

    if (insertError) {
      res.status(500).json({ error: "Failed to load profile" });
      return;
    }
    res.json(newProfile);
    return;
  }

  res.json(profile);
});

// POST /api/premium/sync — check if a Gumroad purchase exists for this email
// and grant premium if so. Rate limited to prevent abuse.
router.post("/premium/sync", requireAuth, syncLimiter, async (req, res) => {
  const userEmail = req.user!.email.toLowerCase().trim();

  const { data: purchase } = await supabaseAdmin
    .from("purchases")
    .select("id, refunded")
    .eq("buyer_email", userEmail)
    .eq("refunded", false)
    .limit(1)
    .maybeSingle();

  if (!purchase) {
    res.json({
      is_premium: false,
      message: "No valid purchase found for this email. Buy at the link below to unlock HSK 2–6.",
    });
    return;
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      is_premium: true,
      premium_source: "gumroad",
      premium_granted_at: new Date().toISOString(),
      gumroad_email: userEmail,
    })
    .eq("id", req.user!.id);

  if (error) {
    res.status(500).json({ error: "Failed to sync premium status" });
    return;
  }

  res.json({ is_premium: true, message: "Premium access granted." });
});

// DELETE /api/account — permanently delete user account
router.delete("/account", requireAuth, async (req, res) => {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(req.user!.id);
  if (error) {
    res.status(500).json({ error: "Failed to delete account" });
    return;
  }
  res.json({ success: true });
});

export default router;
