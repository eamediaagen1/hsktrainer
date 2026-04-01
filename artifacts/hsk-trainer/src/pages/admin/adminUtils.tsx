import { CheckCircle2, XCircle } from "lucide-react";

// ── Date / currency helpers ────────────────────────────────────────────────

export function fmt(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function centsToPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ── Admin session verification (sessionStorage-backed, 60-min window) ─────

export const ADMIN_VERIFIED_KEY = "hsk_admin_verified_at";
export const ADMIN_SESSION_MS = 60 * 60 * 1000;

export function isAdminVerified(): boolean {
  try {
    const ts = sessionStorage.getItem(ADMIN_VERIFIED_KEY);
    if (!ts) return false;
    return Date.now() - parseInt(ts, 10) < ADMIN_SESSION_MS;
  } catch {
    return false;
  }
}

export function setAdminVerified(): void {
  try {
    sessionStorage.setItem(ADMIN_VERIFIED_KEY, Date.now().toString());
  } catch {
    // sessionStorage unavailable
  }
}

export function clearAdminVerified(): void {
  try {
    sessionStorage.removeItem(ADMIN_VERIFIED_KEY);
  } catch {
    // ignore
  }
}

// ── Reusable mini components ───────────────────────────────────────────────

export function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
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

export function WarnBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      {label}
    </span>
  );
}

export function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide opacity-60">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0 w-36">{label}</span>
      <span className="text-foreground text-right break-all">{value ?? "—"}</span>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-10 text-center text-sm text-muted-foreground">{message}</div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="py-10 flex justify-center">
      <div className="w-7 h-7 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function ActionLabel({ action }: { action: string }) {
  const map: Record<string, { label: string; color: string }> = {
    grant_premium:   { label: "Granted Premium",  color: "text-emerald-600 dark:text-emerald-400" },
    revoke_premium:  { label: "Revoked Premium",  color: "text-red-600 dark:text-red-400" },
    link_purchase:   { label: "Linked Purchase",  color: "text-blue-600 dark:text-blue-400" },
    update_setting:  { label: "Changed Setting",  color: "text-amber-600 dark:text-amber-400" },
  };
  const entry = map[action];
  if (!entry) return <span className="font-medium text-foreground">{action}</span>;
  return <span className={`font-medium ${entry.color}`}>{entry.label}</span>;
}
