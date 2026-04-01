import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  BookOpen, Brain, Star, Trophy, ChevronRight,
  Lock, CheckCircle2, RefreshCw, ExternalLink, Flame,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { useSavedWords } from "@/hooks/use-saved-words";
import { useStudyPrefs } from "@/hooks/use-study-prefs";
import { apiFetch } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useState } from "react";

const GUMROAD_URL =
  (import.meta.env.VITE_GUMROAD_URL as string | undefined) ?? "https://gumroad.com";

const LEVEL_NAMES: Record<number, string> = {
  1: "Beginner",
  2: "Elementary",
  3: "Intermediate",
  4: "Upper-Intermediate",
  5: "Advanced",
  6: "Mastery",
};

const cardAnim = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0 },
};

// ── Quick-action button ──────────────────────────────────────────────────────

function QuickAction({
  icon: Icon,
  label,
  sublabel,
  onClick,
  accent = false,
  disabled = false,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  onClick: () => void;
  accent?: boolean;
  disabled?: boolean;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all duration-200 shadow-sm",
        accent
          ? "bg-primary text-primary-foreground border-primary shadow-primary/20 hover:bg-primary/90 hover:shadow-md"
          : "bg-card text-foreground border-border/60 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5",
        disabled && "opacity-50 cursor-not-allowed hover:shadow-sm hover:border-border/60"
      )}
    >
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      <Icon className={cn("w-5 h-5 shrink-0", accent ? "text-primary-foreground" : "text-primary")} />
      <div>
        <p className={cn("text-sm font-semibold leading-tight", accent ? "text-primary-foreground" : "text-foreground")}>
          {label}
        </p>
        {sublabel && (
          <p className={cn("text-xs mt-0.5 leading-tight", accent ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {sublabel}
          </p>
        )}
      </div>
    </button>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border/60 p-4 flex items-center gap-3 shadow-sm">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", color)}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground tabular-nums leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── DashboardPage ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { savedWords, getDueCards, getDueWords, isLoading: wordsLoading } = useSavedWords();
  const { prefs } = useStudyPrefs();
  const qc = useQueryClient();

  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const isPremium = profile?.is_premium ?? false;
  const dueCards = getDueCards();
  const dueCount = dueCards.length;
  const savedCount = savedWords.length;
  const dueWords = getDueWords().slice(0, 4);
  const isNew = savedCount === 0 && !wordsLoading;
  const lastLevel = prefs.lastLevel ?? 1;
  const levelName = LEVEL_NAMES[lastLevel] ?? "Beginner";
  const email = user?.email ?? "";
  const firstName = email.split("@")[0];

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
    <div className="w-full mx-auto max-w-3xl px-4 md:px-6 lg:px-8 py-6 md:py-8 pb-20 space-y-7">

      {/* ── Welcome header ──────────────────────────────────── */}
      <motion.div
        variants={cardAnim}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4"
      >
        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-primary">
            {firstName ? firstName[0].toUpperCase() : "🎋"}
          </span>
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-foreground leading-tight">
            Welcome back, {firstName || "learner"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dueCount > 0
              ? `You have ${dueCount} card${dueCount !== 1 ? "s" : ""} ready to review.`
              : isNew
              ? "Start studying HSK 1 — it's free!"
              : "You're all caught up. Keep the streak going!"}
          </p>
        </div>
      </motion.div>

      {/* ── Stats row ─────────────────────────────────────────── */}
      <motion.div
        variants={cardAnim}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
      >
        <StatCard
          icon={BookOpen}
          label="Cards saved"
          value={wordsLoading ? "…" : savedCount}
          color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={Star}
          label="Due for review"
          value={wordsLoading ? "…" : dueCount}
          color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={Flame}
          label="Current level"
          value={`HSK ${lastLevel}`}
          color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
        />
      </motion.div>

      {/* ── Quick actions ─────────────────────────────────────── */}
      <motion.section
        variants={cardAnim}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2.5 px-0.5">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction
            icon={BookOpen}
            label="Study Flashcards"
            sublabel={`HSK ${lastLevel} · ${levelName}`}
            onClick={() => navigate(`/flashcards/${lastLevel}`)}
            accent
          />
          <QuickAction
            icon={Star}
            label="Review Cards"
            sublabel={dueCount > 0 ? `${dueCount} due` : "No cards due"}
            onClick={() => navigate("/review")}
            disabled={dueCount === 0}
            badge={dueCount > 0 ? dueCount : undefined}
          />
          <QuickAction
            icon={Brain}
            label="Take Quiz"
            sublabel={`HSK ${lastLevel} · 20 questions`}
            onClick={() => navigate(`/quiz/${lastLevel}`)}
          />
          <QuickAction
            icon={Trophy}
            label="View Levels"
            sublabel="Choose your HSK level"
            onClick={() => navigate("/levels")}
          />
        </div>
      </motion.section>

      {/* ── Premium status card ───────────────────────────────── */}
      {!profileLoading && (
        <motion.section
          variants={cardAnim}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          {isPremium ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 flex-1">
                Premium active — all HSK 1–6 levels unlocked
              </p>
              <button
                onClick={() => navigate("/settings")}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
              >
                Settings
              </button>
            </div>
          ) : (
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <Lock className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Unlock HSK 2–6</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    One-time purchase · lifetime access to all 5,000+ words
                  </p>
                  {syncMsg && (
                    <p className="text-xs text-foreground/70 mt-1">{syncMsg}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <a
                  href={GUMROAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Upgrade
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-60"
                >
                  <RefreshCw className={cn("w-3 h-3", syncing && "animate-spin")} />
                  {syncing ? "Syncing…" : "Sync purchase"}
                </button>
              </div>
            </div>
          )}
        </motion.section>
      )}

      {/* ── Due for review ────────────────────────────────────── */}
      {dueCount > 0 && (
        <motion.section
          variants={cardAnim}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-0.5">
              Due for Review
            </h2>
            <button
              onClick={() => navigate("/review")}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Review all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            {dueWords.map((word, idx) => (
              <div
                key={word.word_id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  idx < dueWords.length - 1 && "border-b border-border/40"
                )}
              >
                <span className="text-2xl font-serif text-foreground shrink-0">{word.word}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{word.meaning}</p>
                  <p className="text-xs text-muted-foreground truncate">{word.pinyin}</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 shrink-0">
                  Due
                </span>
              </div>
            ))}
            {dueCount > 4 && (
              <button
                onClick={() => navigate("/review")}
                className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 py-2.5 text-center transition-colors"
              >
                + {dueCount - 4} more — review all →
              </button>
            )}
          </div>
        </motion.section>
      )}

      {/* ── New user empty state ────────────────────────────── */}
      {isNew && (
        <motion.section
          variants={cardAnim}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-card rounded-2xl border border-dashed border-border/60 p-8 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">Start your first session</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Study your first HSK 1 words and save them for spaced-repetition review.
          </p>
          <button
            onClick={() => navigate("/flashcards/1")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
          >
            <BookOpen className="w-4 h-4" />
            Study HSK 1 — Free
          </button>
        </motion.section>
      )}
    </div>
  );
}
