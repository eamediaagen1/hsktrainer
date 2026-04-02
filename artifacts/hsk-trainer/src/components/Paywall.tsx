import { ExternalLink, Lock, BookOpen, Brain, Star, BarChart3, RefreshCw } from "lucide-react";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

const GUMROAD_URL =
  (import.meta.env.VITE_GUMROAD_URL as string | undefined) ?? "https://gumroad.com";

const FEATURES = [
  { icon: BookOpen, text: "All 6 HSK levels — 5,000+ vocabulary words" },
  { icon: Brain,    text: "Full quiz mode with 20-question sessions" },
  { icon: Star,     text: "Spaced-repetition review for every word you save" },
  { icon: BarChart3, text: "Progress tracking across all levels" },
];

interface PaywallProps {
  heading?: string;
  subheading?: string;
  showDemo?: boolean;
}

export function Paywall({
  heading = "Unlock Full Access",
  subheading = "All HSK levels, full quizzes, and progress tracking — with a single one-time purchase.",
  showDemo = true,
}: PaywallProps) {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await apiFetch<{ is_premium: boolean; message: string }>("/api/premium/sync", {
        method: "POST",
      });
      setSyncMsg(res.message);
      if (res.is_premium) {
        qc.invalidateQueries({ queryKey: ["profile"] });
      }
    } catch {
      setSyncMsg("Sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-card border border-border/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-amber-400 to-primary" />
        <div className="p-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-7 h-7 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-foreground text-center mb-2">{heading}</h2>
          <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">{subheading}</p>

          <ul className="space-y-3 mb-7">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-foreground">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                {text}
              </li>
            ))}
          </ul>

          <a
            href={GUMROAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 mb-3"
          >
            Upgrade to Premium
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors disabled:opacity-60 mb-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "I already purchased — sync access"}
          </button>

          {syncMsg && (
            <p className="text-xs text-center text-muted-foreground mt-1">{syncMsg}</p>
          )}

          {showDemo && (
            <button
              onClick={() => navigate("/demo")}
              className="w-full text-xs text-center text-muted-foreground hover:text-foreground transition-colors mt-3"
            >
              Not ready? Try the free demo →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
