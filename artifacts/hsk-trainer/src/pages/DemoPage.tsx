import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, ExternalLink,
  RotateCcw, BookOpen, ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const GUMROAD_URL =
  (import.meta.env.VITE_GUMROAD_URL as string | undefined) ?? "https://gumroad.com";

interface DemoWord {
  id: string;
  word: string;
  pinyin: string;
  meaning: string;
}

const DEMO_WORDS: DemoWord[] = [
  { id: "d1", word: "你好",   pinyin: "nǐ hǎo",    meaning: "Hello" },
  { id: "d2", word: "谢谢",   pinyin: "xiè xiè",   meaning: "Thank you" },
  { id: "d3", word: "再见",   pinyin: "zài jiàn",  meaning: "Goodbye" },
  { id: "d4", word: "好",     pinyin: "hǎo",       meaning: "Good / OK" },
  { id: "d5", word: "是",     pinyin: "shì",       meaning: "Yes / To be" },
  { id: "d6", word: "不",     pinyin: "bù",        meaning: "No / Not" },
  { id: "d7", word: "爸爸",   pinyin: "bà ba",     meaning: "Father" },
  { id: "d8", word: "妈妈",   pinyin: "mā ma",     meaning: "Mother" },
  { id: "d9", word: "水",     pinyin: "shuǐ",      meaning: "Water" },
  { id: "d10", word: "一",    pinyin: "yī",        meaning: "One" },
];

type QuizQuestion = {
  word: DemoWord;
  choices: string[];
  correct: string;
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildQuiz(words: DemoWord[]): QuizQuestion[] {
  const pool = shuffle(words).slice(0, 5);
  return pool.map((word) => {
    const others = shuffle(words.filter((w) => w.id !== word.id));
    const distractors = others.slice(0, 3).map((w) => w.meaning);
    const choices = shuffle([word.meaning, ...distractors]);
    return { word, choices, correct: word.meaning };
  });
}

type Mode = "flashcards" | "quiz";

// ── Flashcard section ─────────────────────────────────────────────────────────

function FlashcardSection() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const word = DEMO_WORDS[index];

  const next = () => { setIndex((i) => Math.min(i + 1, DEMO_WORDS.length - 1)); setFlipped(false); };
  const prev = () => { setIndex((i) => Math.max(i - 1, 0)); setFlipped(false); };
  const progress = ((index + 1) / DEMO_WORDS.length) * 100;

  return (
    <div className="flex flex-col gap-5 max-w-sm mx-auto">
      <div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Demo flashcards</span>
          <span className="tabular-nums font-medium">{index + 1} / {DEMO_WORDS.length}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <button
        onClick={() => setFlipped(!flipped)}
        className="relative w-full aspect-[3/2] rounded-2xl border border-border/60 bg-card shadow-lg overflow-hidden transition-all active:scale-[0.99]"
        style={{ perspective: "1200px" }}
      >
        <div
          className="absolute inset-0 transition-transform duration-500 ease-in-out"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-card"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-amber-400 to-primary" />
            <p className="text-7xl font-serif text-foreground leading-none mb-3">{word.word}</p>
            <p className="text-xs text-muted-foreground">Tap to reveal</p>
          </div>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-primary/5 border-t-4 border-primary"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-primary font-medium tracking-widest text-lg mb-1">{word.pinyin}</p>
            <p className="text-2xl font-bold text-foreground">{word.meaning}</p>
          </div>
        </div>
      </button>

      <div className="flex gap-3">
        <button
          onClick={prev}
          disabled={index === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Prev
        </button>
        <button
          onClick={next}
          disabled={index === DEMO_WORDS.length - 1}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-md shadow-primary/20"
        >
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Quiz section ──────────────────────────────────────────────────────────────

function QuizSection({ onDone }: { onDone: (score: number) => void }) {
  const [questions] = useState(() => buildQuiz(DEMO_WORDS));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const q = questions[idx];
  const isAnswered = selected !== null;
  const isCorrect = selected === q.correct;
  const progress = ((idx) / questions.length) * 100;

  const handleSelect = useCallback((choice: string) => {
    if (isAnswered) return;
    setSelected(choice);
    if (choice === q.correct) setScore((s) => s + 1);
  }, [isAnswered, q.correct]);

  const handleNext = () => {
    if (idx + 1 >= questions.length) {
      onDone(isCorrect ? score + 1 : score);
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
    }
  };

  return (
    <div className="max-w-sm mx-auto flex flex-col gap-5">
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>What does this character mean?</span>
          <span className="tabular-nums font-medium">{idx + 1} / {questions.length}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${progress + 100 / questions.length}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-8 text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-amber-400 to-primary" />
        <p className="text-8xl font-serif text-foreground leading-none">{q.word.word}</p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        <AnimatePresence>
          {q.choices.map((choice, i) => {
            const isThis = selected === choice;
            const isThisCorrect = choice === q.correct;
            let style = "bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/5";
            if (isAnswered) {
              if (isThisCorrect) style = "bg-green-500/10 border-green-500/60 text-green-700 dark:text-green-400";
              else if (isThis) style = "bg-destructive/10 border-destructive/50 text-destructive";
              else style = "bg-card border-border/40 text-muted-foreground opacity-50";
            }
            return (
              <motion.button
                key={`${idx}-${choice}`}
                whileTap={!isAnswered ? { scale: 0.97 } : {}}
                onClick={() => handleSelect(choice)}
                disabled={isAnswered}
                className={cn("flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 font-medium text-left transition-all duration-200", style, !isAnswered && "cursor-pointer")}
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 text-sm">{choice}</span>
                {isAnswered && isThisCorrect && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                {isAnswered && isThis && !isThisCorrect && <XCircle className="w-4 h-4 text-destructive shrink-0" />}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {isAnswered && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-2">
          <p className={cn("text-sm font-semibold", isCorrect ? "text-green-600 dark:text-green-400" : "text-destructive")}>
            {isCorrect ? "✓ Correct!" : `✗ Answer: ${q.correct}`}
          </p>
          <button
            onClick={handleNext}
            className="px-8 py-3 rounded-xl font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all"
          >
            {idx + 1 < questions.length ? "Next →" : "See Results"}
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ── Upgrade CTA ───────────────────────────────────────────────────────────────

function UpgradeCTA({ score, total, onRetry }: { score: number; total: number; onRetry: () => void }) {
  const [, navigate] = useLocation();
  const pct = Math.round((score / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-sm mx-auto"
    >
      <div className="bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-amber-400 to-primary" />
        <div className="p-8 text-center">
          <div className="text-5xl font-bold text-foreground mb-1 tabular-nums">
            {pct}<span className="text-2xl text-muted-foreground font-normal">%</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">{score} of {total} correct</p>
          {pct >= 70 ? (
            <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-5">Nice work! 🎉</p>
          ) : (
            <p className="text-sm text-muted-foreground mb-5">Keep practicing!</p>
          )}

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5 text-left">
            <p className="text-sm font-semibold text-foreground mb-1">This was just 10 words</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Premium unlocks all 6 HSK levels — 5,000+ words — with full quizzes,
              spaced-repetition review, and progress tracking.
            </p>
          </div>

          <a
            href={GUMROAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 mb-3"
          >
            Upgrade to Premium
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex gap-2">
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors text-muted-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </button>
            <button
              onClick={() => navigate("/app")}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors text-muted-foreground"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── DemoPage ──────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>("flashcards");
  const [quizKey, setQuizKey] = useState(0);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const handleQuizDone = (score: number) => setQuizScore(score);
  const handleRetry = () => { setQuizKey((k) => k + 1); setQuizScore(null); };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/60 h-[52px] flex items-center px-4 gap-3">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1.5 -ml-1.5 hover:bg-muted"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-2 mx-auto">
          <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-sm">
            汉
          </div>
          <span className="font-bold text-foreground text-sm">HSK Demo</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">10 words free</span>
        </div>

        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 pb-16">
        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-8">
          {(["flashcards", "quiz"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setQuizScore(null); setQuizKey((k) => k + 1); }}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all",
                mode === m
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "flashcards" ? <span className="flex items-center justify-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Flashcards</span> : "Quiz"}
            </button>
          ))}
        </div>

        {mode === "flashcards" && <FlashcardSection />}

        {mode === "quiz" && quizScore === null && (
          <QuizSection key={quizKey} onDone={handleQuizDone} />
        )}

        {mode === "quiz" && quizScore !== null && (
          <UpgradeCTA score={quizScore} total={5} onRetry={handleRetry} />
        )}

        {/* Bottom upgrade banner (flashcard mode) */}
        {mode === "flashcards" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 bg-primary/5 border border-primary/20 rounded-2xl p-5 text-center"
          >
            <p className="text-sm font-semibold text-foreground mb-1">Want all 5,000+ words?</p>
            <p className="text-xs text-muted-foreground mb-4">Upgrade for full access to HSK 1–6, quizzes, and spaced review.</p>
            <a
              href={GUMROAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
            >
              Upgrade to Premium
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        )}
      </main>
    </div>
  );
}
