import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { ConfigStatus, AppSetting } from "./adminTypes";
import { fmt, isAdminVerified, LoadingSpinner } from "./adminUtils";

export default function ConfigTab() {
  const queryClient = useQueryClient();

  const { data: config, isLoading: configLoading } = useQuery<ConfigStatus>({
    queryKey: ["admin-config"],
    queryFn: () => apiFetch<ConfigStatus>("/api/admin/config"),
    staleTime: 60_000,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<AppSetting[]>({
    queryKey: ["admin-settings"],
    queryFn: () => apiFetch<AppSetting[]>("/api/admin/settings"),
    staleTime: 60_000,
  });

  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editReason, setEditReason] = useState("");
  const verified = isAdminVerified();

  const saveMutation = useMutation({
    mutationFn: () => {
      let parsed: unknown;
      try { parsed = JSON.parse(editValue); } catch { parsed = editValue; }
      return apiFetch("/api/admin/settings", {
        method: "POST",
        body: JSON.stringify({ key: editKey, value: parsed, reason: editReason }),
      });
    },
    onSuccess: () => {
      toast({ title: "Setting saved", description: `${editKey} updated.` });
      setEditKey(null);
      setEditValue("");
      setEditReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (err) => {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-5">
      {/* ── Environment Health ───────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide opacity-60">
          Environment Health
        </h3>

        {configLoading ? (
          <LoadingSpinner />
        ) : config ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(config.env).map(([key, ok]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2 text-xs border border-border/50 rounded-lg px-3 py-2"
                >
                  <span className="font-mono text-foreground">{key}</span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      ok
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {ok ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    {ok ? "configured" : "missing"}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-xs text-muted-foreground pt-1 flex flex-wrap gap-3">
              <span>
                <span className="font-semibold text-foreground">Mode:</span>{" "}
                {config.app_mode}
              </span>
              <span>
                <span className="font-semibold text-foreground">APP_URL:</span>{" "}
                {config.app_url ?? (
                  <span className="text-amber-500">not set</span>
                )}
              </span>
            </div>

            {config.warnings.length > 0 && (
              <div className="border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-1.5 bg-amber-50 dark:bg-amber-900/10">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {config.warnings.length} warning
                  {config.warnings.length !== 1 ? "s" : ""}
                </p>
                {config.warnings.map((w) => (
                  <p key={w} className="text-xs text-amber-700 dark:text-amber-400">
                    • {w}
                  </p>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground border-t border-border/50 pt-2">
              VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are frontend-only
              variables — not visible to the server. Verify them in Replit Secrets.
            </p>
          </>
        ) : null}
      </div>

      {/* ── Runtime Settings ─────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide opacity-60">
          Runtime Settings
        </h3>
        <p className="text-xs text-muted-foreground">
          Non-secret settings stored in the database. Changes are logged.
          {!verified && (
            <span className="ml-1 text-amber-600 dark:text-amber-400">
              Verify your identity to edit.
            </span>
          )}
        </p>

        {settingsLoading ? (
          <LoadingSpinner />
        ) : settings && settings.length > 0 ? (
          <div className="space-y-3">
            {settings.map((s) => (
              <div key={s.key} className="border border-border/50 rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-mono font-semibold text-foreground">
                      {s.key}
                    </span>
                    {s.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.description}
                      </p>
                    )}
                  </div>
                  {verified && editKey !== s.key && (
                    <button
                      onClick={() => {
                        setEditKey(s.key);
                        setEditValue(
                          typeof s.value === "string"
                            ? s.value
                            : JSON.stringify(s.value)
                        );
                      }}
                      className="text-xs text-primary hover:underline shrink-0"
                    >
                      Edit
                    </button>
                  )}
                </div>

                <div className="text-xs font-mono bg-muted rounded px-2 py-1 break-all">
                  {JSON.stringify(s.value)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated: {fmt(s.updated_at)}
                </p>

                {editKey === s.key && (
                  <div className="space-y-2 pt-1 border-t border-border/50">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <input
                      type="text"
                      value={editReason}
                      onChange={(e) => setEditReason(e.target.value)}
                      placeholder="Reason for change (optional, logged)"
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
                        onClick={() => { setEditKey(null); setEditValue(""); setEditReason(""); }}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
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
      </div>
    </div>
  );
}
