import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Book, Star, Lock, Trophy, ExternalLink, RefreshCw, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { useSavedWords } from "@/hooks/use-saved-words";
import { apiFetch } from "@/lib/api";
import { PageShell } from "@/components/PageShell";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const levels = [
  { id: 1, count: 150,  title: "Beginner",          locked: true },
  { id: 2, count: 150,  title: "Elementary",         locked: true },
  { id: 3, count: 300,  title: "Intermediate",       locked: true },
  { id: 4, count: 600,  title: "Upper-Intermediate", locked: true },
  { id: 5, count: 1300, title: "Advanced",           locked: true },
  { id: 6, count: 2500, title: "Mastery",            locked: true },
];

// Configure via VITE_GUMROAD_URL in Replit Secrets
const GUMROAD_URL = import.meta.env.VITE_GUMROAD_URL as string | undefined
  ?? "https://gumroad.com"; // TODO: replace with your product URL

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } },
};

export default function LevelSelection() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: profile, refetch: refetchProfile } = useProfile();
  const { getDueCards } = useSavedWords();
  const qc = useQueryClient();

  const isPremium = profile?.is_premium ?? false;
  const dueCardsCount = getDueCards().length;

  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleSyncPremium = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await apiFetch<{ is_premium: boolean; message: string }>("/api/premium/sync", {
        method: "POST",
      });
      setSyncResult(res.message);
      if (res.is_premium) {
        await refetchProfile();
        qc.invalidateQueries({ queryKey: ["profile"] });
      }
    } catch {
      setSyncResult("Sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <PageShell maxWidth="xl">
      {/* Page intro */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-2 leading-tight">
            Choose Your Level
          </h1>
          <p className="text-muted-foreground text-base max-w-md">
            Select an HSK level to start practicing. Master the vocabulary step-by-step.
          </p>
        </div>

        {dueCardsCount > 0 && (
          <button
            onClick={() => setLocation("/review")}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold/10 border border-gold/30 text-foreground hover:bg-gold/20 font-semibold transition-colors relative self-start sm:self-auto"
          >
            <Star className="w-4 h-4 text-gold fill-gold" />
            Review Mode
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
              {dueCardsCount}
            </span>
          </button>
        )}
      </div>

      {/* Premium sync banner — shown only to non-premium users */}
      {!isPremium && (
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-gold/5 border border-gold/20">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              Unlock all HSK levels — 1 through 6
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Already purchased? Click Sync to activate your access.
            </p>
            {syncResult && (
              <p className="text-xs mt-1 text-foreground/70">{syncResult}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSyncPremium}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-60"
            >
              <RefreshCw className={cn("w-3 h-3", syncing && "animate-spin")} />
              {syncing ? "Syncing…" : "Sync"}
            </button>
            <a
              href={GUMROAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Upgrade
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {isPremium && (
        <div className="mb-8 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Premium access active — all HSK levels unlocked
        </div>
      )}

      {/* Level grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {levels.map((level) => {
          const isLocked = level.locked && !isPremium;
          return (
            <motion.div key={level.id} variants={item}>
              <div
                className={cn(
                  "group relative rounded-2xl border bg-card p-6 transition-all duration-200",
                  isLocked
                    ? "opacity-70 border-border/40 cursor-default"
                    : "border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
                )}
                onClick={() => !isLocked && setLocation(`/flashcards/${level.id}`)}
              >
                {isLocked && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-4 h-4 text-muted-foreground/60" />
                  </div>
                )}
                {!isLocked && (
                  <div className="absolute top-4 right-4">
                    <Trophy className="w-4 h-4 text-gold" />
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Book className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      HSK {level.id}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif text-foreground">{level.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {level.count.toLocaleString()} words
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={isLocked}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLocked) setLocation(`/flashcards/${level.id}`);
                    }}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-sm font-medium transition-colors",
                      isLocked
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    {isLocked ? "Locked" : "Study"}
                  </button>
                  {!isLocked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/quiz/${level.id}`);
                      }}
                      className="px-3 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
                    >
                      Quiz
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </PageShell>
  );
}
