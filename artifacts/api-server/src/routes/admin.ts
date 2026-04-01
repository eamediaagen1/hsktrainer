import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// ── All admin routes require auth + admin role ───────────────────────────────
router.use(requireAuth, requireAdmin);

// ── Helper: write an admin_log row ──────────────────────────────────────────
async function writeLog(
  adminUserId: string,
  targetUserId: string | null,
  action: string,
  reason?: string,
  meta?: Record<string, unknown>
): Promise<void> {
  await supabaseAdmin.from("admin_logs").insert({
    admin_user_id: adminUserId,
    target_user_id: targetUserId ?? null,
    action,
    reason: reason ?? null,
    meta: meta ?? null,
  });
}

// ── Allowlisted keys for app_settings ────────────────────────────────────────
const SETTINGS_ALLOWLIST = new Set([
  "support_email",
  "premium_cta_text",
  "maintenance_message",
  "gumroad_checkout_url_override",
  "marketing_banner_enabled",
]);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/users  — paginated list of all users
// ─────────────────────────────────────────────────────────────────────────────
router.get("/admin/users", async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(
      "id, email, is_premium, premium_source, premium_granted_at, gumroad_email, role, created_at, updated_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    res.status(500).json({ error: "Failed to fetch users" });
    return;
  }
  res.json(data);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/user?email=  — full detail for one user (search by email)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/admin/user", async (req, res) => {
  const email = (req.query.email as string | undefined)?.toLowerCase().trim();
  if (!email) {
    res.status(400).json({ error: "email query param is required" });
    return;
  }

  // 1. Profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select(
      "id, email, is_premium, premium_source, premium_granted_at, gumroad_email, role, created_at, updated_at"
    )
    .eq("email", email)
    .maybeSingle();

  if (profileError) {
    res.status(500).json({ error: "DB error fetching profile" });
    return;
  }
  if (!profile) {
    res.status(404).json({ error: "No user found with that email" });
    return;
  }

  // 2. Purchases — by user_id OR by buyer_email (catches unlinked purchases)
  const { data: purchases } = await supabaseAdmin
    .from("purchases")
    .select(
      "id, sale_id, buyer_email, product_permalink, price_cents, refunded, user_id, created_at, updated_at"
    )
    .or(`user_id.eq.${profile.id},buyer_email.eq.${email}`)
    .order("created_at", { ascending: false });

  // 3. Progress summary
  const { count: savedWordCount } = await supabaseAdmin
    .from("saved_words")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id);

  const { data: lastWord } = await supabaseAdmin
    .from("saved_words")
    .select("created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 4. Recent admin logs for this user
  const { data: logs } = await supabaseAdmin
    .from("admin_logs")
    .select(
      "id, action, reason, meta, created_at, admin_user_id, profiles!admin_logs_admin_user_id_fkey(email)"
    )
    .eq("target_user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);

  res.json({
    profile,
    purchases: purchases ?? [],
    progress_summary: {
      total_saved_words: savedWordCount ?? 0,
      last_activity: lastWord?.created_at ?? null,
    },
    recent_logs: logs ?? [],
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/purchases  — all purchases
// ─────────────────────────────────────────────────────────────────────────────
router.get("/admin/purchases", async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("purchases")
    .select(
      "id, sale_id, buyer_email, product_permalink, price_cents, refunded, user_id, created_at, updated_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    res.status(500).json({ error: "Failed to fetch purchases" });
    return;
  }
  res.json(data);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/grant-premium
// Body: { user_id, reason? }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/admin/grant-premium", async (req, res) => {
  const { user_id, reason } = req.body as { user_id?: string; reason?: string };
  if (!user_id) {
    res.status(400).json({ error: "user_id is required" });
    return;
  }

  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      is_premium: true,
      premium_source: "admin",
      premium_granted_at: now,
      updated_at: now,
    })
    .eq("id", user_id);

  if (error) {
    res.status(500).json({ error: "Failed to grant premium" });
    return;
  }

  await writeLog(req.user!.id, user_id, "grant_premium", reason, {
    granted_at: now,
  });

  res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/revoke-premium
// Body: { user_id, reason? }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/admin/revoke-premium", async (req, res) => {
  const { user_id, reason } = req.body as { user_id?: string; reason?: string };
  if (!user_id) {
    res.status(400).json({ error: "user_id is required" });
    return;
  }

  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      is_premium: false,
      premium_source: null,
      premium_granted_at: null,
      updated_at: now,
    })
    .eq("id", user_id);

  if (error) {
    res.status(500).json({ error: "Failed to revoke premium" });
    return;
  }

  await writeLog(req.user!.id, user_id, "revoke_premium", reason, {
    revoked_at: now,
  });

  res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/link-purchase
// Body: { user_id, purchase_id, reason? }
// Links an unlinked purchase row to a specific user and syncs their premium.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/admin/link-purchase", async (req, res) => {
  const { user_id, purchase_id, reason } = req.body as {
    user_id?: string;
    purchase_id?: string;
    reason?: string;
  };

  if (!user_id || !purchase_id) {
    res.status(400).json({ error: "user_id and purchase_id are required" });
    return;
  }

  // Fetch the purchase
  const { data: purchase, error: purchaseError } = await supabaseAdmin
    .from("purchases")
    .select("id, buyer_email, refunded")
    .eq("id", purchase_id)
    .maybeSingle();

  if (purchaseError || !purchase) {
    res.status(404).json({ error: "Purchase not found" });
    return;
  }

  // Link purchase to user
  const { error: linkError } = await supabaseAdmin
    .from("purchases")
    .update({ user_id, updated_at: new Date().toISOString() })
    .eq("id", purchase_id);

  if (linkError) {
    res.status(500).json({ error: "Failed to link purchase" });
    return;
  }

  // If purchase is not refunded, grant premium and store the buyer email
  if (!purchase.refunded) {
    const now = new Date().toISOString();
    await supabaseAdmin
      .from("profiles")
      .update({
        is_premium: true,
        premium_source: "gumroad",
        premium_granted_at: now,
        gumroad_email: purchase.buyer_email,
        updated_at: now,
      })
      .eq("id", user_id);
  }

  await writeLog(req.user!.id, user_id, "link_purchase", reason, {
    purchase_id,
    buyer_email: purchase.buyer_email,
  });

  res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/logs?user_id=  — recent admin logs (optionally filtered)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/admin/logs", async (req, res) => {
  const targetUserId = req.query.user_id as string | undefined;

  let query = supabaseAdmin
    .from("admin_logs")
    .select(
      "id, action, reason, meta, created_at, admin_user_id, target_user_id, profiles!admin_logs_admin_user_id_fkey(email)"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (targetUserId) {
    query = query.eq("target_user_id", targetUserId);
  }

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ error: "Failed to fetch logs" });
    return;
  }
  res.json(data ?? []);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/config  — environment health check (no secrets exposed)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/admin/config", (_req, res) => {
  const vars = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    GUMROAD_WEBHOOK_SECRET: !!process.env.GUMROAD_WEBHOOK_SECRET,
    GUMROAD_PRODUCT_PERMALINK: !!process.env.GUMROAD_PRODUCT_PERMALINK,
    APP_URL: !!process.env.APP_URL,
  };

  const warnings: string[] = [];
  if (!vars.SUPABASE_URL) warnings.push("SUPABASE_URL not set — auth will fail");
  if (!vars.SUPABASE_SERVICE_ROLE_KEY)
    warnings.push("SUPABASE_SERVICE_ROLE_KEY not set — all protected routes return 401");
  if (!vars.GUMROAD_WEBHOOK_SECRET)
    warnings.push("GUMROAD_WEBHOOK_SECRET not set — webhook endpoint is disabled");
  if (!vars.APP_URL)
    warnings.push("APP_URL not set — CORS is open to all origins");
  if (!vars.GUMROAD_PRODUCT_PERMALINK)
    warnings.push("GUMROAD_PRODUCT_PERMALINK not set — any Gumroad product will be accepted");

  res.json({
    env: vars,
    app_mode: process.env.NODE_ENV ?? "unknown",
    app_url: process.env.APP_URL ?? null,
    warnings,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/settings  — list all app_settings
// ─────────────────────────────────────────────────────────────────────────────
router.get("/admin/settings", async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("key, value, description, updated_at, updated_by")
    .order("key");

  if (error) {
    res.status(500).json({ error: "Failed to fetch settings" });
    return;
  }
  res.json(data ?? []);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/settings
// Body: { key, value, reason? }
// Updates a single non-secret app setting (allowlisted keys only).
// ─────────────────────────────────────────────────────────────────────────────
router.post("/admin/settings", async (req, res) => {
  const { key, value, reason } = req.body as {
    key?: string;
    value?: unknown;
    reason?: string;
  };

  if (!key) {
    res.status(400).json({ error: "key is required" });
    return;
  }
  if (!SETTINGS_ALLOWLIST.has(key)) {
    res.status(400).json({ error: `Key '${key}' is not an editable setting` });
    return;
  }
  if (value === undefined) {
    res.status(400).json({ error: "value is required" });
    return;
  }

  const { error } = await supabaseAdmin
    .from("app_settings")
    .upsert({
      key,
      value: value,
      updated_at: new Date().toISOString(),
      updated_by: req.user!.id,
    });

  if (error) {
    res.status(500).json({ error: "Failed to update setting" });
    return;
  }

  await writeLog(req.user!.id, null, "update_setting", reason, { key, value });

  res.json({ success: true });
});

export default router;
