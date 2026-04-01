import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth, requireAdmin);

// GET /api/admin/users
router.get("/admin/users", async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, is_premium, premium_source, premium_granted_at, role, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    res.status(500).json({ error: "Failed to fetch users" });
    return;
  }
  res.json(data);
});

// GET /api/admin/purchases
router.get("/admin/purchases", async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("purchases")
    .select("id, sale_id, buyer_email, product_permalink, price_cents, refunded, created_at, updated_at, user_id")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    res.status(500).json({ error: "Failed to fetch purchases" });
    return;
  }
  res.json(data);
});

// POST /api/admin/grant-premium
router.post("/admin/grant-premium", async (req, res) => {
  const { user_id } = req.body as { user_id?: string };
  if (!user_id) {
    res.status(400).json({ error: "user_id is required" });
    return;
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      is_premium: true,
      premium_source: "admin",
      premium_granted_at: new Date().toISOString(),
    })
    .eq("id", user_id);

  if (error) {
    res.status(500).json({ error: "Failed to grant premium" });
    return;
  }
  res.json({ success: true });
});

// POST /api/admin/revoke-premium
router.post("/admin/revoke-premium", async (req, res) => {
  const { user_id } = req.body as { user_id?: string };
  if (!user_id) {
    res.status(400).json({ error: "user_id is required" });
    return;
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      is_premium: false,
      premium_source: null,
      premium_granted_at: null,
    })
    .eq("id", user_id);

  if (error) {
    res.status(500).json({ error: "Failed to revoke premium" });
    return;
  }
  res.json({ success: true });
});

export default router;
