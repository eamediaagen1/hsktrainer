import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  BookOpen,
  MessageSquare,
  Trophy,
  Brain,
  Zap,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { hskData } from "@/data/hskData";
import { phraseData } from "@/data/phraseData";
import { PageShell } from "@/components/PageShell";
import { cn } from "@/lib/utils";

const LEVEL_META: Record<number, { title: string; subtitle: string; wordCount: number }> = {
  1: { title: "HSK 1",  subtitle: "Beginner",          wordCount: 150 },
  2: { title: "HSK 2",  subtitle: "Elementary",        wordCount: 150 },
  3: { title: "HSK 3",  subtitle: "Intermediate",      wordCount: 300 },
  4: { title: "HSK 4",  subtitle: "Upper-Intermediate",wordCount: 600 },
  5: { title: "HSK 5",  subtitle: "Advanced",          wordCount: 1300 },
  6: { title: "HSK 6",  subtitle: "Mastery",           wordCount: 2500 },
};

const CATEGORY_EMOJI: Record<string, string> = {
  Greetings:    "👋",
  Numbers:      "🔢",
  Food:         "🍜",
  Time:         "⏰",
  Family:       "👨‍👩‍👧",
  "Daily Life": "🏠",
  Verbs:        "⚡",
  People:       "👤",
  Places:       "📍",
  School:       "📚",
  Colors:       "🎨",
  Objects:      "📦",
  Travel:       "✈️",
  "Food & Drink": "🍵",
  "Time & Dates": "📅",
};

function getEmoji(category: string): string {
  return CATEGORY_EMOJI[category] ?? "📖";
}

const container = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 28 } },
};

export default function LevelOverviewPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ level: string }>();
  const level = parseInt(params.level || "1");
  const meta = LEVEL_META[level] ?? LEVEL_META[1];

  // Build category list from vocab data
  const levelWords = hskData.filter((w) => w.hskLevel === level);
  const flashcardCategoryMap = new Map<string, number>();
  for (const w of levelWords) {
    if (w.category) {
      flashcardCategoryMap.set(w.category, (flashcardCategoryMap.get(w.category) ?? 0) + 1);
    }
  }
  const flashcardCategories = Array.from(flashcardCategoryMap.entries()).map(([name, count]) => ({
    name,
    count,
  }));

  // Build phrase category list
  const levelPhrases = phraseData.filter((p) => p.hskLevel === level);
  const phraseCategoryMap = new Map<string, number>();
  for (const p of levelPhrases) {
    phraseCategoryMap.set(p.category, (phraseCategoryMap.get(p.category) ?? 0) + 1);
  }
  const phraseCategories = Array.from(phraseCategoryMap.entries()).map(([name, count]) => ({
    name,
    count,
  }));

  const backHref = "/levels";

  return (
    <PageShell maxWidth="xl">

      {/* Back + breadcrumb */}
      <button
        onClick={() => setLocation(backHref)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg py-1 px-1.5 -ml-1.5 mb-8 hover:bg-muted text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        All levels
      </button>

      {/* Page header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">{meta.subtitle}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-foreground leading-tight mb-1">
          {meta.title}
        </h1>
        <p className="text-muted-foreground">
          {levelWords.length} vocabulary words · {levelPhrases.length} phrases
        </p>
      </div>

      {/* ── SECTION 1: Flashcards ────────────────────────────────────────────── */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-foreground leading-none">Flashcards</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Study vocabulary by category</p>
            </div>
          </div>
          <button
            onClick={() => setLocation(`/flashcards/${level}`)}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {flashcardCategories.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
          >
            {flashcardCategories.map(({ name, count }) => (
              <motion.div key={name} variants={item}>
                <CategoryCard
                  emoji={getEmoji(name)}
                  name={name}
                  countLabel={`${count} words`}
                  onStudy={() => setLocation(`/flashcards/${level}/${encodeURIComponent(name)}`)}
                  onQuiz={() => setLocation(`/quiz/${level}/${encodeURIComponent(name)}`)}
                  onTest={() => setLocation(`/quiz/${level}/${encodeURIComponent(name)}?test=1`)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-muted-foreground text-sm">No flashcard data for this level yet.</p>
        )}
      </section>

      {/* ── SECTION 2: Phrases ───────────────────────────────────────────────── */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-foreground leading-none">Common Phrases</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Real-world conversational phrases</p>
            </div>
          </div>
          <button
            onClick={() => setLocation("/phrases")}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {phraseCategories.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {phraseCategories.map(({ name, count }) => (
              <motion.div key={name} variants={item}>
                <PhraseCard
                  emoji={getEmoji(name)}
                  name={name}
                  countLabel={`${count} phrases`}
                  onStudy={() => setLocation(`/phrases?category=${encodeURIComponent(name)}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="p-6 rounded-2xl bg-muted/40 border border-border/50 text-center">
            <p className="text-muted-foreground text-sm">Phrases coming soon for this level.</p>
          </div>
        )}
      </section>

      {/* ── SECTION 3: Level Exam ────────────────────────────────────────────── */}
      <section className="mb-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-foreground leading-none">Pass {meta.title} Exam</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Full assessment across all categories</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-800/40 overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
          <div className="p-7 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  Final Exam
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground mb-1">
                {meta.title} Comprehensive Exam
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Test yourself on all {levelWords.length} {meta.title} vocabulary words. 20 questions covering
                every category — the final challenge before moving on.
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5" />
                  20 questions
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  70% to pass
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  All {flashcardCategories.length} categories
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => setLocation(`/quiz/${level}`)}
                className={cn(
                  "flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-200",
                  "bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-600/25 hover:-translate-y-0.5"
                )}
              >
                <Trophy className="w-4 h-4" />
                Start Exam
              </button>
              <button
                onClick={() => setLocation(`/flashcards/${level}`)}
                className="px-7 py-2.5 rounded-xl font-semibold text-sm border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              >
                Study First
              </button>
            </div>
          </div>
        </motion.div>
      </section>

    </PageShell>
  );
}

// ─── Category Card (Flashcards) ───────────────────────────────────────────────

function CategoryCard({
  emoji,
  name,
  countLabel,
  onStudy,
  onQuiz,
  onTest,
}: {
  emoji: string;
  name: string;
  countLabel: string;
  onStudy: () => void;
  onQuiz: () => void;
  onTest: () => void;
}) {
  return (
    <div className="group bg-card border border-border/60 rounded-2xl p-4 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl leading-none">{emoji}</span>
        <div className="min-w-0">
          <p className="font-semibold text-foreground leading-snug truncate">{name}</p>
          <p className="text-xs text-muted-foreground">{countLabel}</p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <button
          onClick={onStudy}
          className="w-full py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-150"
        >
          Study
        </button>
        <div className="flex gap-1.5">
          <button
            onClick={onTest}
            className="flex-1 py-1.5 rounded-xl text-xs font-semibold border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
          >
            Test
          </button>
          <button
            onClick={onQuiz}
            className="flex-1 py-1.5 rounded-xl text-xs font-semibold bg-muted text-foreground hover:bg-muted/80 transition-colors duration-150"
          >
            Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Phrase Card ──────────────────────────────────────────────────────────────

function PhraseCard({
  emoji,
  name,
  countLabel,
  onStudy,
}: {
  emoji: string;
  name: string;
  countLabel: string;
  onStudy: () => void;
}) {
  return (
    <div className="group bg-card border border-border/60 rounded-2xl p-4 hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-200">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl leading-none">{emoji}</span>
        <div className="min-w-0">
          <p className="font-semibold text-foreground leading-snug truncate">{name}</p>
          <p className="text-xs text-muted-foreground">{countLabel}</p>
        </div>
      </div>
      <button
        onClick={onStudy}
        className="w-full py-2 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white transition-colors duration-150"
      >
        Browse Phrases
      </button>
    </div>
  );
}
