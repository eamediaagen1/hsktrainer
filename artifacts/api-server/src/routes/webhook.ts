import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { webhookLimiter } from "../middleware/rate-limit.js";

const router = Router();

const WEBHOOK_SECRET = process.env.GUMROAD_WEBHOOK_SECRET;
// Set GUMROAD_PRODUCT_PERMALINK in Replit Secrets once your product is live.
// Leave blank to skip product validation (useful during testing).
const PRODUCT_PERMALINK = process.env.GUMROAD_PRODUCT_PERMALINK;

/**
 * POST /api/gumroad/webhook
 *
 * Receives Gumroad Ping notifications for sale and refund events.
 * Webhook URL to configure in Gumroad:
 *   https://<your-replit-app>/api/gumroad/webhook?secret=<GUMROAD_WEBHOOK_SECRET>
 *
 * Gumroad sends application/x-www-form-urlencoded with fields:
 *   sale_id, product_permalink, email, price, refunded, ...
 */
router.post("/gumroad/webhook", webhookLimiter, async (req, res) => {
  // 1. Validate webhook secret (sent as URL query param by Gumroad)
  if (!WEBHOOK_SECRET) {
    // Secret not configured — reject all webhooks until it is set
    res.status(503).json({ error: "Webhook secret not configured" });
    return;
  }

  if (req.query.secret !== WEBHOOK_SECRET) {
    res.status(403).json({ error: "Invalid webhook secret" });
    return;
  }

  const {
    sale_id,
    product_permalink,
    email,
    price,
    refunded,
  } = req.body as Record<string, string>;

  // 2. Validate required fields
  if (!sale_id || !email) {
    res.status(400).json({ error: "Missing required fields: sale_id, email" });
    return;
  }

  // 3. Validate product (skip if no permalink configured)
  if (PRODUCT_PERMALINK && product_permalink !== PRODUCT_PERMALINK) {
    // Unknown product — acknowledge but do not process
    res.json({ status: "ignored", reason: "unknown_product" });
    return;
  }

  const isRefunded = refunded === "true";
  const buyerEmail = email.toLowerCase().trim();

  // 4. Idempotency — check if we've already processed this sale_id
  const { data: existing } = await supabaseAdmin
    .from("purchases")
    .select("id, refunded")
    .eq("sale_id", sale_id)
    .maybeSingle();

  if (existing) {
    // Only update if the refund status has changed
    if (existing.refunded !== isRefunded) {
      await supabaseAdmin
        .from("purchases")
        .update({ refunded: isRefunded, updated_at: new Date().toISOString() })
        .eq("sale_id", sale_id);

      if (isRefunded) {
        await revokePremiumByEmail(buyerEmail);
      }
    }
    res.json({ status: "updated" });
    return;
  }

  // 5. Insert new purchase record
  const { error: insertError } = await supabaseAdmin.from("purchases").insert({
    sale_id,
    buyer_email: buyerEmail,
    product_permalink: product_permalink ?? "",
    price_cents: price ? Math.round(parseFloat(price) * 100) : 0,
    refunded: isRefunded,
    raw_payload: req.body,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      // Duplicate key — already processed (race condition)
      res.json({ status: "already_processed" });
      return;
    }
    res.status(500).json({ error: "Failed to save purchase" });
    return;
  }

  // 6. Grant premium if not a refund
  if (!isRefunded) {
    await grantPremiumByEmail(buyerEmail, sale_id);
  }

  res.json({ status: "ok" });
});

async function findProfileByEmail(email: string) {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  return data;
}

async function grantPremiumByEmail(email: string, saleId: string) {
  const profile = await findProfileByEmail(email);
  if (!profile) {
    // User hasn't signed up yet — premium will be picked up via /api/premium/sync
    return;
  }

  await supabaseAdmin
    .from("profiles")
    .update({
      is_premium: true,
      premium_source: "gumroad",
      premium_granted_at: new Date().toISOString(),
      gumroad_email: email,
    })
    .eq("id", profile.id);

  // Link purchase record to user
  await supabaseAdmin
    .from("purchases")
    .update({ user_id: profile.id })
    .eq("sale_id", saleId);
}

async function revokePremiumByEmail(email: string) {
  const profile = await findProfileByEmail(email);
  if (!profile) return;

  await supabaseAdmin
    .from("profiles")
    .update({
      is_premium: false,
      premium_source: null,
      premium_granted_at: null,
    })
    .eq("id", profile.id);
}

export default router;
