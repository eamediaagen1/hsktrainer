import { useQuery } from "@tanstack/react-query";
import { Users, Star, TrendingUp, ShoppingBag, AlertTriangle, Link } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { OverviewStats } from "./adminTypes";
import { fmt, timeAgo, LoadingSpinner, ActionLabel } from "./adminUtils";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  accent?: "green" | "amber" | "red";
}) {
  const accentClass =
    accent === "green"
      ? "text-emerald-600 dark:text-emerald-400"
      : accent === "amber"
      ? "text-amber-600 dark:text-amber-400"
      : accent === "red"
      ? "text-red-500 dark:text-red-400"
      : "text-foreground";

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className={`text-2xl font-bold leading-none ${accentClass}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardTab() {
  const { data, isLoading, error } = useQuery<OverviewStats>({
    queryKey: ["admin-overview"],
    queryFn: () => apiFetch<OverviewStats>("/api/admin/overview"),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  if (isLoading) return <LoadingSpinner />;

  if (error || !data) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
        Failed to load overview.{" "}
        {error instanceof Error ? error.message : "Please try again."}
      </div>
    );
  }

  const premiumPct =
    data.total_users > 0
      ? Math.round((data.premium_users / data.total_users) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard icon={Users} label="Total Users" value={data.total_users} />
        <StatCard
          icon={Star}
          label="Premium Users"
          value={data.premium_users}
          sub={`${premiumPct}% of all users`}
          accent="green"
        />
        <StatCard
          icon={TrendingUp}
          label="New Signups (7d)"
          value={data.signups_7d}
        />
        <StatCard
          icon={ShoppingBag}
          label="Purchases (7d)"
          value={data.purchases_7d}
        />
        <StatCard
          icon={AlertTriangle}
          label="Refunds (total)"
          value={data.refunds_total}
          accent={data.refunds_total > 0 ? "red" : undefined}
        />
        <StatCard
          icon={Link}
          label="Unlinked Purchases"
          value={data.unlinked_purchases}
          sub="Need manual linking"
          accent={data.unlinked_purchases > 0 ? "amber" : undefined}
        />
      </div>

      {/* Recent admin activity */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide opacity-60 mb-3">
          Recent Admin Activity
        </h3>
        {data.recent_logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No admin actions yet.</p>
        ) : (
          <div className="space-y-3">
            {data.recent_logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-border mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ActionLabel action={log.action} />
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(log.created_at)}
                    </span>
                  </div>
                  {log.reason && (
                    <p className="text-xs text-muted-foreground truncate">
                      "{log.reason}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    by{" "}
                    {(log.profiles as { email?: string } | null)?.email ??
                      log.admin_user_id}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                  {fmt(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
