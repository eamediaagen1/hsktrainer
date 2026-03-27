import { Router, type IRouter } from "express";

const router: IRouter = Router();

/**
 * In-memory store of verified paid emails.
 * Replace with Supabase `profiles` table update when Supabase is configured:
 *
 *   import { createClient } from "@supabase/supabase-js";
 *   const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
 *   await supabase.from("profiles").update({ is_paid: true }).eq("email", email);
 */
const paidEmails = new Set<string>();

/**
 * POST /api/gumroad-webhook
 *
 * Gumroad fires this endpoint after a successful sale. Validate the shared
 * secret (passed as ?secret=<value> in the webhook URL you configure on
 * Gumroad's dashboard) then mark the buyer's email as paid.
 *
 * Required environment variables:
 *   GUMROAD_WEBHOOK_SECRET  — a random string you set in both Gumroad and .env
 *
 * Gumroad sends application/x-www-form-urlencoded with fields including:
 *   sale_id, product_permalink, email, full_name, price, ...
 */
router.post("/gumroad-webhook", (req, res) => {
  const secret = req.query["secret"] as string | undefined;
  const expectedSecret = process.env["GUMROAD_WEBHOOK_SECRET"];

  // Reject if the secret env var is missing — misconfigured server
  if (!expectedSecret) {
    req.log.error("GUMROAD_WEBHOOK_SECRET is not set");
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  // Reject if the caller didn't provide the correct secret
  if (!secret || secret !== expectedSecret) {
    req.log.warn({ providedSecret: !!secret }, "Gumroad webhook: invalid secret");
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { sale_id, product_permalink, email } = req.body as {
    sale_id?: string;
    product_permalink?: string;
    email?: string;
  };

  if (!sale_id || !product_permalink) {
    req.log.warn({ sale_id, product_permalink }, "Gumroad webhook: missing required fields");
    res.status(400).json({ error: "Missing required fields: sale_id, product_permalink" });
    return;
  }

  const buyerEmail = (email ?? "").trim().toLowerCase();
  if (!buyerEmail) {
    req.log.warn({ sale_id }, "Gumroad webhook: missing buyer email");
    res.status(400).json({ error: "Missing email" });
    return;
  }

  // Grant access
  paidEmails.add(buyerEmail);
  req.log.info({ sale_id, product_permalink, email: buyerEmail }, "Gumroad sale verified — access granted");

  res.status(200).json({ success: true });
});

/**
 * GET /api/check-access?email=<email>
 *
 * Frontend calls this after login to determine if the user has paid.
 * Returns { isPaid: boolean }.
 *
 * When Supabase is configured, replace the paidEmails lookup with:
 *   const { data } = await supabase
 *     .from("profiles")
 *     .select("is_paid")
 *     .eq("email", normalizedEmail)
 *     .single();
 *   return { isPaid: data?.is_paid ?? false };
 */
router.get("/check-access", (req, res) => {
  const raw = req.query["email"];
  if (!raw || typeof raw !== "string") {
    res.status(400).json({ error: "email query parameter is required" });
    return;
  }

  const normalizedEmail = raw.trim().toLowerCase();
  const isPaid = paidEmails.has(normalizedEmail);

  req.log.info({ email: normalizedEmail, isPaid }, "Access check");
  res.json({ isPaid });
});

export default router;
