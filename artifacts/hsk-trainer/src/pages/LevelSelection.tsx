import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Book, Star, Lock, ExternalLink, RefreshCw,
  CheckCircle2, MessageSquare, ChevronRight,
  Sparkles, Loader2, RotateCcw, ArrowRight,
} from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { useSavedWords } from "@/hooks/use-saved-words";
import { useLevelProgress, isLevelUnlocked, type LevelProgressMap } from "@/hooks/use-level-progress";
import { apiFetch } from "@/lib/api";
import { PageShell } from "@/components/PageShell";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { cn } from "@/lib/utils";

// ─── Data ────────────────────────────────────────────────────────────────────

const LEVELS = [
  { id: 1, count: 150,  title: "Beginner" },
  { id: 2, count: 150,  title: "Elementary" },
  { id: 3, count: 300,  title: "Intermediate" },
  { id: 4, count: 600,  title: "Upper-Intermediate" },
  { id: 5, count: 1300, title: "Advanced" },
  { id: 6, count: 2500, title: "Mastery" },
];

const GUMROAD_URL =
  (import.meta.env.VITE_GUMROAD_URL as string | undefined) ?? "https://gumroad.com";

// ─── Card state ───────────────────────────────────────────────────────────────

type CardState = "locked" | "passed" | "fresh" | "in_progress";

function getCardState(
  levelId: number,
  isPremium: boolean,
  progressMap: LevelProgressMap
): CardState {
  if (!isPremium || !isLevelUnlocked(levelId, progressMap)) return "locked";
  const entry = progressMap[levelId];
  if (!entry) return "fresh";
  if (entry.exam_passed) return "passed";
  return "in_progress";
}

// ─── Animation ───────────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const cardAnim = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } },
};

// ─── Level card ───────────────────────────────────────────────────────────────

function LevelCard({
  level,
  state,
  examScore,
  onGo,
  onNextLevel,
  onPhrases,
  onExam,
}: {
  level: { id: number; count: number; title: string };
  state: CardState;
  examScore: number | null;
  onGo: () => void;
  onNextLevel: () => void;
  onPhrases: () => void;
  onExam: () => void;
}) {
  const isLocked     = state === "locked";
  const isPassed     = state === "passed";
  const isFresh      = state === "fresh";
  const isInProgress = state === "in_progress";
  const isActive     = isFresh || isInProgress;
  const isLastLevel  = level.id === 6;

  // ── Card shell styles ──────────────────────────────────────────────────────
  const cardClass = cn(
    "relative rounded-2xl border bg-card p-6 flex flex-col transition-all duration-200",
    isLocked      && "opacity-55 border-border/40 cursor-default",
    isPassed      && "border-green-200/70 dark:border-green-800/50 bg-green-50/20 dark:bg-green-950/10 cursor-pointer hover:border-green-300/70 hover:shadow-md hover:shadow-green-500/5",
    isFresh       && "border-primary/40 ring-1 ring-primary/15 cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/8",
    isInProgress  && "border-border/70 cursor-pointer hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
  );

  // ── Status badge (top-right) ───────────────────────────────────────────────
  const StatusBadge = () => {
    if (isLocked)     return <Lock className="w-4 h-4 text-muted-foreground/40" />;
    if (isPassed)     return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
        <CheckCircle2 className="w-3 h-3" />
        Passed
      </span>
    );
    if (isFresh)      return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
        <Sparkles className="w-3 h-3" />
        Unlocked
      </span>
    );
    if (isInProgress) return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
        In Progress
      </span>
    );
    return null;
  };

  // ── Sub-text under the level name ─────────────────────────────────────────
  const SubNote = () => {
    if (!isLocked) {
      if (isPassed && examScore !== null) {
        return <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 font-medium">Best score: {examScore}%</p>;
      }
      if (isFresh) {
        return <p className="text-xs text-primary/70 mt-1.5 font-medium">Ready to start</p>;
      }
      if (isInProgress) {
        return <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 font-medium">Score 70%+ on the exam to progress</p>;
      }
    }
    return null;
  };

  // ── Lock reason ───────────────────────────────────────────────────────────
  const LockNote = () => {
    if (!isLocked) return null;
    if (level.id === 1) {
      return (
        <p className="text-xs text-muted-foreground/60 mt-1.5 flex items-center gap-1">
          <Lock className="w-3 h-3" /> Premium required to access
        </p>
      );
    }
    return (
      <p className="text-xs text-muted-foreground/60 mt-1.5 flex items-center gap-1">
        <Lock className="w-3 h-3" /> Complete HSK {level.id - 1} exam to unlock
      </p>
    );
  };

  return (
    <motion.div variants={cardAnim}>
      <div className={cardClass} onClick={() => !isLocked && onGo()}>

        {/* Status badge */}
        <div className="absolute top-4 right-4">
          <StatusBadge />
        </div>

        {/* Header */}
        <div className="mb-5 pr-20">
          <div className="flex items-center gap-1.5 mb-1">
            <Book className={cn("w-3.5 h-3.5 shrink-0", isLocked ? "text-muted-foreground/40" : "text-primary")} />
            <span className={cn("text-[11px] font-bold uppercase tracking-wider", isLocked ? "text-muted-foreground/40" : "text-primary")}>
              HSK {level.id}
            </span>
          </div>
          <h3 className="text-lg font-serif text-foreground leading-snug">{level.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{level.count.toLocaleString()} words</p>
          <SubNote />
          <LockNote />
        </div>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2">

          {/* ── LOCKED ──────────────────────────────────────── */}
          {isLocked && (
            <button
              disabled
              className="w-full py-2.5 rounded-xl text-sm font-semibold bg-muted/60 text-muted-foreground/40 cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              Locked
            </button>
          )}

          {/* ── PASSED ──────────────────────────────────────── */}
          {isPassed && (
            <>
              {/* Go to next level — primary only if next exists */}
              {!isLastLevel && (
                <button
                  onClick={(e) => { e.stopPropagation(); onNextLevel(); }}
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
                >
                  Go to HSK {level.id + 1}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {/* Review current level */}
              <button
                onClick={(e) => { e.stopPropagation(); onGo(); }}
                className="w-full py-2 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
              >
                Review HSK {level.id}
              </button>
              {/* Phrases + Re-take Exam */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onPhrases(); }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  Phrases
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onExam(); }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Re-take Exam
                </button>
              </div>
            </>
          )}

          {/* ── FRESH (newly unlocked) ──────────────────────── */}
          {isFresh && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onGo(); }}
                className="w-full py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
              >
                Start HSK {level.id}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onPhrases(); }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  Phrases
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onExam(); }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                  Take Exam
                </button>
              </div>
            </>
          )}

          {/* ── IN PROGRESS ─────────────────────────────────── */}
          {isInProgress && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onGo(); }}
                className="w-full py-2.5 rounded-xl text-sm font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-1.5"
              >
                Continue HSK {level.id}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onPhrases(); }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  Phrases
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onExam(); }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                  Take Exam
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LevelSelection() {
  const [, setLocation] = useLocation();
  const { data: profile, refetch: refetchProfile } = useProfile();
  const { getDueCards } = useSavedWords();
  const { query: lpQuery, progressMap } = useLevelProgress();
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

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-2 leading-tight">
            Your Levels
          </h1>
          <p className="text-muted-foreground text-base max-w-md">
            Pass each level's exam to unlock the next. Progress is saved automatically.
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

      {/* Non-premium upgrade banner */}
      {!isPremium && (
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-gold/5 border border-gold/20">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Unlock all HSK levels — 1 through 6</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Already purchased? Click Sync to activate your access instantly.
            </p>
            {syncResult && <p className="text-xs mt-1 text-foreground/70">{syncResult}</p>}
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

      {/* Premium status bar */}
      {isPremium && (
        <div className="mb-8 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/8 border border-green-500/20 text-green-700 dark:text-green-400 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Premium active — pass each exam to unlock the next level
        </div>
      )}

      {/* Level grid */}
      {lpQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {LEVELS.map((level) => {
            const state     = getCardState(level.id, isPremium, progressMap);
            const examScore = progressMap[level.id]?.exam_score ?? null;

            return (
              <LevelCard
                key={level.id}
                level={level}
                state={state}
                examScore={examScore}
                onGo={() => setLocation(`/flashcards/${level.id}`)}
                onNextLevel={() => setLocation(`/flashcards/${level.id + 1}`)}
                onPhrases={() => setLocation(`/phrases?level=${level.id}`)}
                onExam={() => setLocation(`/quiz/${level.id}`)}
              />
            );
          })}
        </motion.div>
      )}
    </PageShell>
  );
}
