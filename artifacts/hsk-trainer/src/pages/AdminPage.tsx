import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Search, CheckCircle2, XCircle, AlertTriangle, ChevronLeft, Loader2, ExternalLink } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useProfile } from "@/hooks/use-profile";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminProfile {
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

interface Purchase {
  id: string;
  sale_id: string;
  buyer_email: string;
  product_permalink: string;
  price_cents: number;
  refunded: boolean;
  user_id: string | null;
  created_at: string;
}

interface AdminLog {
  id: string;
  action: string;
  reason: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
  admin_user_id: string;
  profiles?: { email: string } | null;
}

interface UserDetail {
  profile: AdminProfile;
  purchases: Purchase[];
  progress_summary: { total_saved_words: number; last_activity: string | null };
  recent_logs: AdminLog[];
}

interface AppSetting {
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
}

interface ConfigStatus {
  env: Record<string, boolean>;
  app_mode: string;
  app_url: string | null;
  warnings: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function centsToPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Small reusable bits ──────────────────────────────────────────────────────

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
        ok
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label}
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide opacity-60">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0 w-36">{label}</span>
      <span className="text-foreground text-right break-all">{value ?? "—"}</span>
    </div>
  );
}

// ─── User Detail Panel ────────────────────────────────────────────────────────

function UserDetailPanel({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [linkPurchaseId, setLinkPurchaseId] = useState("");

  const { data, isLoading, error } = useQuery<UserDetail>({
    queryKey: ["admin-user", email],
    queryFn: () =>
      apiFetch<UserDetail>(`/api/admin/user?email=${encodeURIComponent(email)}`),
    staleTime: 0,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-user", email] });

  const grantMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/admin/grant-premium", {
        method: "POST",
        body: JSON.stringify({ user_id: data!.profile.id, reason }),
      }),
    onSuccess: () => {
      setReason("");
      invalidate();
    },
  });

  const revokeMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/admin/revoke-premium", {
        method: "POST",
        body: JSON.stringify({ user_id: data!.profile.id, reason }),
      }),
    onSuccess: () => {
      setReason("");
      invalidate();
    },
  });

  const linkMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/admin/link-purchase", {
        method: "POST",
        body: JSON.stringify({
          user_id: data!.profile.id,
          purchase_id: linkPurchaseId,
          reason,
        }),
      }),
    onSuccess: () => {
      setLinkPurchaseId("");
      setReason("");
      invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
        {error instanceof Error ? error.message : "Failed to load user"}
      </div>
    );
  }

  const { profile, purchases, progress_summary, recent_logs } = data;
  const isPending = grantMutation.isPending || revokeMutation.isPending || linkMutation.isPending;
  const mutationError = grantMutation.error || revokeMutation.error || linkMutation.error;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">{profile.email}</h2>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ✕ clear
        </button>
      </div>

      {/* Profile */}
      <Card title="Profile">
        <Row label="User ID" value={<code className="text-xs">{profile.id}</code>} />
        <Row label="Email" value={profile.email} />
        <Row label="Role" value={<Badge ok={profile.role === "admin"} label={profile.role} />} />
        <Row label="Created" value={fmt(profile.created_at)} />
        <Row label="Updated" value={fmt(profile.updated_at)} />
      </Card>

      {/* Premium */}
      <Card title="Premium Status">
        <Row
          label="Premium"
          value={<Badge ok={profile.is_premium} label={profile.is_premium ? "Active" : "Inactive"} />}
        />
        <Row label="Source" value={profile.premium_source} />
        <Row label="Granted At" value={fmt(profile.premium_granted_at)} />
        <Row label="Gumroad Email" value={profile.gumroad_email} />
      </Card>

      {/* Progress */}
      <Card title="Progress">
        <Row label="Saved Words" value={progress_summary.total_saved_words} />
        <Row label="Last Activity" value={fmt(progress_summary.last_activity)} />
      </Card>

      {/* Purchases */}
      <Card title={`Purchases (${purchases.length})`}>
        {purchases.length === 0 ? (
          <p className="text-xs text-muted-foreground">No purchases found</p>
        ) : (
          purchases.map((p) => (
            <div
              key={p.id}
              className="border border-border/50 rounded-lg p-3 text-xs space-y-1"
            >
              <div className="flex items-center gap-2">
                <Badge ok={!p.refunded} label={p.refunded ? "Refunded" : "Paid"} />
                <span className="font-mono text-muted-foreground">{p.sale_id}</span>
                {!p.user_id && (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">⚠ Unlinked</span>
                )}
              </div>
              <div className="text-muted-foreground space-y-0.5">
                <div>Buyer: {p.buyer_email}</div>
                <div>Product: {p.product_permalink || "—"}</div>
                <div>Amount: {centsToPrice(p.price_cents)}</div>
                <div>Date: {fmt(p.created_at)}</div>
                <div>ID: <code>{p.id}</code></div>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Actions */}
      <Card title="Actions">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Reason (optional, logged)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. verified buyer on Gumroad"
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => grantMutation.mutate()}
              disabled={isPending || profile.is_premium}
              className="flex-1 text-sm font-semibold py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Grant Premium
            </button>
            <button
              onClick={() => revokeMutation.mutate()}
              disabled={isPending || !profile.is_premium}
              className="flex-1 text-sm font-semibold py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Revoke Premium
            </button>
          </div>

          {/* Link purchase */}
          {purchases.some((p) => !p.user_id) && (
            <div className="border border-amber-300 dark:border-amber-700 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Link an unlinked purchase to this user
              </p>
              <input
                type="text"
                value={linkPurchaseId}
                onChange={(e) => setLinkPurchaseId(e.target.value)}
                placeholder="Purchase UUID"
                className="w-full text-xs font-mono border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={() => linkMutation.mutate()}
                disabled={isPending || !linkPurchaseId.trim()}
                className="w-full text-xs font-semibold py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 transition-colors"
              >
                Link Purchase
              </button>
            </div>
          )}

          {mutationError && (
            <p className="text-xs text-destructive">
              {mutationError instanceof Error ? mutationError.message : "Action failed"}
            </p>
          )}
          {(grantMutation.isSuccess || revokeMutation.isSuccess || linkMutation.isSuccess) && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Done ✓</p>
          )}
        </div>
      </Card>

      {/* Audit log */}
      <Card title={`Audit Log (${recent_logs.length})`}>
        {recent_logs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No admin actions recorded</p>
        ) : (
          <div className="space-y-2">
            {recent_logs.map((log) => (
              <div key={log.id} className="text-xs border-l-2 border-border pl-2 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{log.action}</span>
                  <span className="text-muted-foreground">{fmt(log.created_at)}</span>
                </div>
                {log.reason && (
                  <div className="text-muted-foreground">Reason: {log.reason}</div>
                )}
                <div className="text-muted-foreground">
                  By: {(log.profiles as { email?: string } | null)?.email ?? log.admin_user_id}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [inputEmail, setInputEmail] = useState("");
  const [searchedEmail, setSearchedEmail] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const v = inputEmail.trim().toLowerCase();
    if (v) setSearchedEmail(v);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="email"
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          placeholder="Search by email address…"
          className="flex-1 border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </form>

      {searchedEmail && (
        <UserDetailPanel
          email={searchedEmail}
          onClose={() => {
            setSearchedEmail("");
            setInputEmail("");
          }}
        />
      )}
    </div>
  );
}

// ─── Config Tab ───────────────────────────────────────────────────────────────

function ConfigTab() {
  const queryClient = useQueryClient();

  const { data: config, isLoading: configLoading } = useQuery<ConfigStatus>({
    queryKey: ["admin-config"],
    queryFn: () => apiFetch<ConfigStatus>("/api/admin/config"),
    staleTime: 30_000,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<AppSetting[]>({
    queryKey: ["admin-settings"],
    queryFn: () => apiFetch<AppSetting[]>("/api/admin/settings"),
    staleTime: 30_000,
  });

  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [settingReason, setSettingReason] = useState("");

  const saveMutation = useMutation({
    mutationFn: () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(editValue);
      } catch {
        parsed = editValue;
      }
      return apiFetch("/api/admin/settings", {
        method: "POST",
        body: JSON.stringify({ key: editKey, value: parsed, reason: settingReason }),
      });
    },
    onSuccess: () => {
      setEditKey(null);
      setEditValue("");
      setSettingReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
  });

  return (
    <div className="space-y-4">
      {/* Env health */}
      <Card title="Environment Health">
        {configLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : config ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(config.env).map(([key, ok]) => (
                <div key={key} className="flex items-center justify-between gap-2 text-xs border border-border/50 rounded-lg px-3 py-2">
                  <span className="font-mono text-foreground">{key}</span>
                  <Badge ok={ok} label={ok ? "set" : "missing"} />
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground pt-1">
              <span className="font-semibold">Mode:</span> {config.app_mode} ·{" "}
              <span className="font-semibold">APP_URL:</span>{" "}
              {config.app_url ?? <span className="text-amber-500">not set</span>}
            </div>
            {config.warnings.length > 0 && (
              <div className="space-y-1 pt-1">
                {config.warnings.map((w) => (
                  <div
                    key={w}
                    className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    {w}
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground border-t border-border/50 pt-2">
              VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are frontend-only — not visible from the server. Verify them in Replit Secrets.
            </p>
          </>
        ) : null}
      </Card>

      {/* App settings */}
      <Card title="App Settings">
        {settingsLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : settings && settings.length > 0 ? (
          <div className="space-y-3">
            {settings.map((s) => (
              <div key={s.key} className="border border-border/50 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-mono font-semibold text-foreground">{s.key}</span>
                  <button
                    onClick={() => {
                      setEditKey(s.key);
                      setEditValue(
                        typeof s.value === "string" ? s.value : JSON.stringify(s.value)
                      );
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
                  </button>
                </div>
                {s.description && (
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                )}
                <div className="text-xs font-mono bg-muted rounded px-2 py-1 break-all">
                  {JSON.stringify(s.value)}
                </div>
                <p className="text-xs text-muted-foreground">Updated: {fmt(s.updated_at)}</p>

                {editKey === s.key && (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <input
                      type="text"
                      value={settingReason}
                      onChange={(e) => setSettingReason(e.target.value)}
                      placeholder="Reason for change (optional)"
                      className="w-full text-xs border border-border rounded-lg px-3 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveMutation.mutate()}
                        disabled={saveMutation.isPending}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                      >
                        {saveMutation.isPending ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={() => { setEditKey(null); setEditValue(""); }}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    {saveMutation.error && (
                      <p className="text-xs text-destructive">
                        {saveMutation.error instanceof Error ? saveMutation.error.message : "Save failed"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No settings found. Run migration 002 in Supabase to seed defaults.
          </p>
        )}
      </Card>
    </div>
  );
}

// ─── AdminPage (root component) ───────────────────────────────────────────────

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"users" | "config">("users");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) navigate("/app");
  }, [user, authLoading, navigate]);

  // Redirect if not admin
  useEffect(() => {
    if (!profileLoading && profile && profile.role !== "admin") {
      navigate("/levels");
    }
  }, [profile, profileLoading, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile || profile.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground text-sm">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {profile.email}
            </span>
            <button
              onClick={() => navigate("/levels")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back to App
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 flex gap-0">
          {(["users", "config"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "users" ? "Users" : "Config & Settings"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {tab === "users" ? <UsersTab /> : <ConfigTab />}
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-4 py-4 text-xs text-muted-foreground border-t border-border/50 flex items-center gap-1">
        <ExternalLink className="w-3 h-3" />
        <span>
          To promote a user to admin, run:{" "}
          <code className="font-mono bg-muted px-1 rounded">
            UPDATE profiles SET role = &apos;admin&apos; WHERE email = &apos;EMAIL&apos;;
          </code>
        </span>
      </footer>
    </div>
  );
}
