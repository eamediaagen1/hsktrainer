import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Purchase, PurchaseFilter } from "./adminTypes";
import { fmt, centsToPrice, StatusBadge, WarnBadge, LoadingSpinner, EmptyState } from "./adminUtils";

const FILTERS: { value: PurchaseFilter; label: string }[] = [
  { value: "all",       label: "All" },
  { value: "paid",      label: "Paid" },
  { value: "refunded",  label: "Refunded" },
  { value: "linked",    label: "Linked" },
  { value: "unlinked",  label: "Unlinked" },
];

export default function PurchasesTab() {
  const [filter, setFilter] = useState<PurchaseFilter>("all");

  const { data, isLoading, error } = useQuery<Purchase[]>({
    queryKey: ["admin-purchases", filter],
    queryFn: () =>
      apiFetch<Purchase[]>(`/api/admin/purchases?filter=${filter}`),
    staleTime: 30_000,
  });

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === f.value
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
          {error instanceof Error ? error.message : "Failed to load purchases"}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState message="No purchases match this filter." />
      ) : (
        <div className="space-y-2">
          {data.map((p) => (
            <div
              key={p.id}
              className="bg-card border border-border rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge ok={!p.refunded} label={p.refunded ? "Refunded" : "Paid"} />
                <StatusBadge ok={!!p.user_id} label={p.user_id ? "Linked" : "Unlinked"} />
                {!p.user_id && !p.refunded && (
                  <WarnBadge label="⚠ Needs Linking" />
                )}
                <span className="text-xs font-mono text-muted-foreground ml-auto">
                  {p.sale_id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <div>
                  <span className="text-foreground font-medium">Buyer: </span>
                  {p.buyer_email}
                </div>
                <div>
                  <span className="text-foreground font-medium">Amount: </span>
                  {centsToPrice(p.price_cents)}
                </div>
                <div>
                  <span className="text-foreground font-medium">Product: </span>
                  {p.product_permalink || "—"}
                </div>
                <div>
                  <span className="text-foreground font-medium">Date: </span>
                  {fmt(p.created_at)}
                </div>
              </div>

              {!p.user_id && !p.refunded && (
                <p className="text-xs text-amber-600 dark:text-amber-400 border-t border-border/50 pt-2">
                  To link: go to Users tab → search by buyer email → Link Purchase
                </p>
              )}

              <p className="text-xs font-mono text-muted-foreground/50 break-all">
                {p.id}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
