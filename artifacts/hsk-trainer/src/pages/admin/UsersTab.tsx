import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, ChevronRight, Lock } from "lucide-react";
import { useLocation } from "wouter";
import { apiFetch } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { AdminProfile, UserDetail } from "./adminTypes";
import {
  fmt,
  centsToPrice,
  StatusBadge,
  WarnBadge,
  SectionCard,
  DataRow,
  LoadingSpinner,
  EmptyState,
  isAdminVerified,
} from "./adminUtils";

// ── User detail panel ─────────────────────────────────────────────────────────

function UserDetailPanel({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [reason, setReason] = useState("");
  const [linkPurchaseId, setLinkPurchaseId] = useState("");
  const verified = isAdminVerified();

  const { data, isLoading, error } = useQuery<UserDetail>({
    queryKey: ["admin-user-detail", userId],
    queryFn: () => apiFetch<UserDetail>(`/api/admin/users/${userId}`),
    staleTime: 0,
  });

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["admin-user-detail", userId] }),
    [queryClient, userId]
  );

  const grantMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/admin/grant-premium", {
        method: "POST",
        body: JSON.stringify({ user_id: data!.profile.id, reason }),
      }),
    onSuccess: () => {
      toast({ title: "Premium granted", description: `${data!.profile.email} is now premium.` });
      setReason("");
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) =>
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Grant failed",
        variant: "destructive",
      }),
  });

  const revokeMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/admin/revoke-premium", {
        method: "POST",
        body: JSON.stringify({ user_id: data!.profile.id, reason }),
      }),
    onSuccess: () => {
      toast({ title: "Premium revoked", description: `${data!.profile.email} is no longer premium.` });
      setReason("");
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) =>
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Revoke failed",
        variant: "destructive",
      }),
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
      toast({ title: "Purchase linked", description: "Purchase linked and premium granted." });
      setLinkPurchaseId("");
      setReason("");
      invalidate();
    },
    onError: (err) =>
      toast({
        title: "Link failed",
        description: err instanceof Error ? err.message : "Link failed",
        variant: "destructive",
      }),
  });

  if (isLoading) return <LoadingSpinner />;

  if (error || !data) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
        {error instanceof Error ? error.message : "Failed to load user"}
      </div>
    );
  }

  const { profile, purchases, progress_summary, recent_logs } = data;
  const isPending = grantMutation.isPending || revokeMutation.isPending || linkMutation.isPending;
  const unlinkedPurchases = purchases.filter((p) => !p.user_id && !p.refunded);

  return (
    <div className="space-y-4">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground truncate">{profile.email}</h2>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground shrink-0"
        >
          ✕ close
        </button>
      </div>

      {/* Profile */}
      <SectionCard title="Profile">
        <DataRow label="User ID" value={<code className="text-xs">{profile.id}</code>} />
        <DataRow label="Email" value={profile.email} />
        <DataRow
          label="Role"
          value={<StatusBadge ok={profile.role === "admin"} label={profile.role} />}
        />
        <DataRow label="Joined" value={fmt(profile.created_at)} />
        <DataRow label="Updated" value={fmt(profile.updated_at)} />
      </SectionCard>

      {/* Premium */}
      <SectionCard title="Premium Status">
        <DataRow
          label="Status"
          value={
            <StatusBadge
              ok={profile.is_premium}
              label={profile.is_premium ? "Active" : "Inactive"}
            />
          }
        />
        <DataRow label="Source" value={profile.premium_source} />
        <DataRow label="Granted" value={fmt(profile.premium_granted_at)} />
        <DataRow label="Gumroad Email" value={profile.gumroad_email} />
      </SectionCard>

      {/* Progress */}
      <SectionCard title="Progress">
        <DataRow label="Saved Words" value={progress_summary.total_saved_words} />
        <DataRow label="Last Activity" value={fmt(progress_summary.last_activity)} />
      </SectionCard>

      {/* Purchases */}
      <SectionCard title={`Purchases (${purchases.length})`}>
        {purchases.length === 0 ? (
          <p className="text-xs text-muted-foreground">No purchases found</p>
        ) : (
          <div className="space-y-2">
            {purchases.map((p) => (
              <div key={p.id} className="border border-border/50 rounded-lg p-3 text-xs space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge ok={!p.refunded} label={p.refunded ? "Refunded" : "Paid"} />
                  {!p.user_id && <WarnBadge label="⚠ Unlinked" />}
                  <span className="font-mono text-muted-foreground text-xs">{p.sale_id}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
                  <span>Buyer: {p.buyer_email}</span>
                  <span>Amount: {centsToPrice(p.price_cents)}</span>
                  <span>Product: {p.product_permalink || "—"}</span>
                  <span>Date: {fmt(p.created_at)}</span>
                </div>
                <p className="font-mono text-muted-foreground/40 break-all">{p.id}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Actions */}
      <SectionCard title="Admin Actions">
        {!verified ? (
          <div className="text-center py-3 space-y-2">
            <Lock className="w-5 h-5 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">
              Verify your identity to enable admin actions.
            </p>
            <button
              onClick={() => navigate("/admin/login?next=/admin/users")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Verify Identity →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Reason <span className="text-destructive">*</span> (required, logged)
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
                disabled={isPending || profile.is_premium || !reason.trim()}
                className="flex-1 text-sm font-semibold py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Grant Premium
              </button>
              <button
                onClick={() => revokeMutation.mutate()}
                disabled={isPending || !profile.is_premium || !reason.trim()}
                className="flex-1 text-sm font-semibold py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Revoke Premium
              </button>
            </div>

            {unlinkedPurchases.length > 0 && (
              <div className="border border-amber-300 dark:border-amber-700 rounded-lg p-3 space-y-2">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Link an unlinked purchase to this user
                </p>
                <select
                  value={linkPurchaseId}
                  onChange={(e) => setLinkPurchaseId(e.target.value)}
                  className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select a purchase…</option>
                  {unlinkedPurchases.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.buyer_email} — {centsToPrice(p.price_cents)} — {fmt(p.created_at)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => linkMutation.mutate()}
                  disabled={isPending || !linkPurchaseId}
                  className="w-full text-xs font-semibold py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 transition-colors"
                >
                  Link Purchase
                </button>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* Audit log */}
      <SectionCard title={`Audit Log (${recent_logs.length})`}>
        {recent_logs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No admin actions recorded</p>
        ) : (
          <div className="space-y-2">
            {recent_logs.map((log) => (
              <div key={log.id} className="text-xs border-l-2 border-border pl-2 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{log.action}</span>
                  <span className="text-muted-foreground">{fmt(log.created_at)}</span>
                </div>
                {log.reason && (
                  <p className="text-muted-foreground">Reason: {log.reason}</p>
                )}
                <p className="text-muted-foreground">
                  By:{" "}
                  {(log.profiles as { email?: string } | null)?.email ?? log.admin_user_id}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ── User list item ────────────────────────────────────────────────────────────

function UserListItem({
  user,
  isSelected,
  onSelect,
}: {
  user: AdminProfile;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-xl border transition-colors ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:bg-muted/50"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <StatusBadge ok={user.is_premium} label={user.is_premium ? "Premium" : "Free"} />
            {user.role === "admin" && (
              <StatusBadge ok={true} label="Admin" />
            )}
          </div>
        </div>
        <ChevronRight
          className={`w-4 h-4 shrink-0 transition-colors ${
            isSelected ? "text-primary" : "text-muted-foreground"
          }`}
        />
      </div>
    </button>
  );
}

// ── UsersTab ──────────────────────────────────────────────────────────────────

export default function UsersTab() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const debounceRef = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef[0]) clearTimeout(debounceRef[0]);
    debounceRef[1](
      setTimeout(() => {
        setDebouncedQuery(val.trim());
        setSelectedUserId(null);
      }, 350)
    );
  };

  const { data: users, isLoading } = useQuery<AdminProfile[]>({
    queryKey: ["admin-users", debouncedQuery],
    queryFn: () =>
      apiFetch<AdminProfile[]>(
        `/api/admin/users${debouncedQuery ? `?q=${encodeURIComponent(debouncedQuery)}` : ""}`
      ),
    staleTime: 30_000,
  });

  const showDetail = selectedUserId !== null;

  return (
    <div className={`grid gap-4 ${showDetail ? "lg:grid-cols-[1fr_1fr]" : ""}`}>
      {/* Left: search + list */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search by email…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Results */}
        {isLoading ? (
          <LoadingSpinner />
        ) : !users || users.length === 0 ? (
          <EmptyState
            message={
              debouncedQuery
                ? `No users matching "${debouncedQuery}"`
                : "Start typing to search users."
            }
          />
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground px-1">
              {users.length} user{users.length !== 1 ? "s" : ""}
              {debouncedQuery ? ` matching "${debouncedQuery}"` : ""}
            </p>
            {users.map((u) => (
              <UserListItem
                key={u.id}
                user={u}
                isSelected={selectedUserId === u.id}
                onSelect={() =>
                  setSelectedUserId(selectedUserId === u.id ? null : u.id)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Right: detail panel */}
      {showDetail && selectedUserId && (
        <div>
          <UserDetailPanel
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
          />
        </div>
      )}
    </div>
  );
}
