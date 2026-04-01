export interface AdminProfile {
  id: string;
  email: string;
  is_premium: boolean;
  premium_source: string | null;
  premium_granted_at: string | null;
  gumroad_email: string | null;
  role: string;
  created_at: string;
  updated_at: string | null;
}

export interface Purchase {
  id: string;
  sale_id: string;
  buyer_email: string;
  product_permalink: string;
  price_cents: number;
  refunded: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AdminLog {
  id: string;
  action: string;
  reason: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
  admin_user_id: string;
  target_user_id: string | null;
  profiles?: { email: string } | null;
}

export interface UserDetail {
  profile: AdminProfile;
  purchases: Purchase[];
  progress_summary: { total_saved_words: number; last_activity: string | null };
  recent_logs: AdminLog[];
}

export interface AppSetting {
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface ConfigStatus {
  env: Record<string, boolean>;
  app_mode: string;
  app_url: string | null;
  warnings: string[];
}

export interface OverviewStats {
  total_users: number;
  premium_users: number;
  signups_7d: number;
  purchases_7d: number;
  refunds_total: number;
  unlinked_purchases: number;
  recent_logs: AdminLog[];
}

export type PurchaseFilter = "all" | "paid" | "refunded" | "linked" | "unlinked";
export type LogActionFilter = "all" | "grant_premium" | "revoke_premium" | "link_purchase" | "update_setting";
