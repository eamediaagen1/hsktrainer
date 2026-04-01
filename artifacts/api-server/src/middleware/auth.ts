import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabase.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
      profile?: { is_premium: boolean; role: string };
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.headers.authorization?.replace("Bearer ", "").trim();
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  req.user = { id: user.id, email: user.email ?? "" };
  next();
}

export async function requirePremium(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("is_premium, role")
    .eq("id", req.user.id)
    .single();

  if (error || (!profile?.is_premium && profile?.role !== "admin")) {
    res.status(403).json({ error: "Premium subscription required" });
    return;
  }

  req.profile = profile;
  next();
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", req.user.id)
    .single();

  if (profile?.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
}
