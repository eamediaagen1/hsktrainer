import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { AdminLog, LogActionFilter } from "./adminTypes";
import { fmt, LoadingSpinner, EmptyState, ActionLabel } from "./adminUtils";

const ACTION_FILTERS: { value: LogActionFilter; label: string }[] = [
  { value: "all",             label: "All Actions" },
  { value: "grant_premium",   label: "Grants" },
  { value: "revoke_premium",  label: "Revokes" },
  { value: "link_purchase",   label: "Link Purchase" },
  { value: "update_setting",  label: "Settings" },
];

export default function LogsTab() {
  const [actionFilter, setActionFilter] = useState<LogActionFilter>("all");

  const { data, isLoading, error } = useQuery<AdminLog[]>({
    queryKey: ["admin-logs", actionFilter],
    queryFn: () =>
      apiFetch<AdminLog[]>(`/api/admin/logs?action=${actionFilter}`),
    staleTime: 30_000,
  });

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {ACTION_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActionFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              actionFilter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load logs"}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState message="No admin actions recorded yet." />
      ) : (
        <div className="space-y-2">
          {data.map((log) => (
            <div
              key={log.id}
              className="bg-card border border-border rounded-xl p-4 space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <ActionLabel action={log.action} />
                <span className="text-xs text-muted-foreground shrink-0">
                  {fmt(log.created_at)}
                </span>
              </div>

              {log.reason && (
                <p className="text-sm text-foreground">
                  "{log.reason}"
                </p>
              )}

              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>
                  By:{" "}
                  <span className="text-foreground">
                    {(log.profiles as { email?: string } | null)?.email ??
                      log.admin_user_id}
                  </span>
                </p>
                {log.target_user_id && (
                  <p>
                    Target user ID:{" "}
                    <code className="font-mono text-xs">
                      {log.target_user_id}
                    </code>
                  </p>
                )}
                {log.meta && Object.keys(log.meta).length > 0 && (
                  <p className="font-mono text-xs bg-muted rounded px-2 py-1 break-all">
                    {JSON.stringify(log.meta)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
