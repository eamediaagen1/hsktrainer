import { useState, useCallback, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import {
  ChevronLeft, RotateCcw, CheckCircle2, XCircle, Trophy,
  Lock, Loader2, LayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { hskData, VocabWord } from "@/data/hskData";
import { apiFetch } from "@/lib/api";
import { useStudyPrefs } from "@/hooks/use-study-prefs";
import { cn } from "@/lib/utils";

type QuestionType = "char-to-meaning" | "meaning-to-char" | "pinyin-to-char";

interface Question {
  type: QuestionType;
  word: VocabWord;
  prompt: string;
  choices: string[];
  correctAnswer: string;
}

const QUIZ_SIZE = 20;
const PASS_THRESHOLD = 0.7; // 70% to pass

const QUESTION_LABELS: Record<QuestionType, string> = {
  "char-to-meaning": "What does this character mean?",
  "meaning-to-char": "Which character matches this meaning?",
  "pinyin-to-char":  "Which character matches this pronunciation?",
};

const SESSION_KEY = (level: number) => `hsk_quiz_state_${level}`;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function generateQuiz(words: VocabWord[]): Question[] {
  const pool = shuffle(words).slice(0, Math.min(QUIZ_SIZE, words.length));
  return pool.map((word) => {
    const types: QuestionType[] = ["char-to-meaning", "meaning-to-char", "pinyin-to-char"];
    const type = types[Math.floor(Math.random() * types.length)];
    const others = shuffle(words.filter((w) => w.id !== word.id));

    let prompt: string;
    let correctAnswer: string;
    let distractors: string[];

    if (type === "char-to-meaning") {
      prompt = word.word;
      correctAnswer = word.meaning;
      distractors = others.slice(0, 3).map((w) => w.meaning);
    } else if (type === "meaning-to-char") {
      prompt = word.meaning;
      correctAnswer = word.word;
      distractors = others.slice(0, 3).map((w) => w.word);
    } else {
      prompt = word.pinyin;
      correctAnswer = word.word;
      distractors = others.slice(0, 3).map((w) => w.word);
    }

    const choices = shuffle([correctAnswer, ...distractors]);
    return { type, word, prompt, choices, correctAnswer };
  });
}

interface PersistedState {
  level: number;
  questions: Question[];
  currentIndex: number;
  score: number;
  phase: "quiz" | "result";
  /** words answered wrong (word IDs) */
  wrongIds: string[];
}

function saveState(state: PersistedState) {
  try {
    sessionStorage.setItem(SESSION_KEY(state.level), JSON.stringify(state));
  } catch { /* storage quota */ }
}

function loadState(level: number): PersistedState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY(level));
    if (!raw) return null;
    const s = JSON.parse(raw) as PersistedState;
    // Validate it's for the same level and still has valid structure
    if (s.level !== level || !Array.isArray(s.questions) || s.questions.length === 0) return null;
    return s;
  } catch {
    return null;
  }
}

function clearState(level: number) {
  try { sessionStorage.removeItem(SESSION_KEY(level)); } catch { /* ignore */ }
}

export default function QuizPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const level = parseInt(params.level || "1");
  const { set: setPref } = useStudyPrefs();

  // Fetch premium-level words from the API (level 1 uses local data)
  const { data: apiLevel, isLoading: wordsLoading, error: wordsError } = useQuery({
    queryKey: ["lessons", level],
    queryFn: () =>
      apiFetch<{ level: number; words: VocabWord[] }>(`/api/lessons?level=${level}`).then(
        (r) => r.words
      ),
    enabled: level > 1,
    staleTime: 30 * 60 * 1000,
  });

  const levelWords: VocabWord[] =
    level === 1 ? hskData.filter((w) => w.hskLevel === 1) : (apiLevel ?? []);

  // ── State (try to restore from sessionStorage) ─────────────────────────────
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  const [initialized, setInitialized] = useState(false);

  // Initialise from persisted state or generate fresh questions
  useEffect(() => {
    if (initialized) return;
    if (level === 1) {
      const restored = loadState(level);
      if (restored) {
        setQuestions(restored.questions);
        setCurrentIndex(restored.currentIndex);
        setScore(restored.score);
        setWrongIds(restored.wrongIds ?? []);
        setPhase(restored.phase);
      } else {
        const qs = generateQuiz(hskData.filter((w) => w.hskLevel === 1));
        setQuestions(qs);
      }
      setInitialized(true);
    }
  }, [level, initialized]);

  useEffect(() => {
    if (initialized || level === 1) return;
    if (apiLevel && apiLevel.length > 0) {
      const restored = loadState(level);
      if (restored) {
        setQuestions(restored.questions);
        setCurrentIndex(restored.currentIndex);
        setScore(restored.score);
        setWrongIds(restored.wrongIds ?? []);
        setPhase(restored.phase);
      } else {
        setQuestions(generateQuiz(apiLevel));
      }
      setInitialized(true);
      // Remember the user's current level for dashboard
      setPref("lastLevel", level);
    }
  }, [apiLevel, level, initialized, setPref]);

  // Persist state on every relevant change (after init)
  useEffect(() => {
    if (!initialized || questions.length === 0) return;
    saveState({ level, questions, currentIndex, score, phase, wrongIds });
  }, [level, questions, currentIndex, score, phase, initialized, wrongIds]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex];
  const isAnswered = selected !== null;
  const isCorrect = selected === currentQuestion?.correctAnswer;
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;
  const correctCount = score;
  const totalAnswered = phase === "result" ? questions.length : currentIndex + (isAnswered ? 1 : 0);
  const incorrectCount = totalAnswered - correctCount;
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const isPassing = pct >= PASS_THRESHOLD * 100;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelect = useCallback(
    (choice: string) => {
      if (isAnswered || !currentQuestion) return;
      setSelected(choice);
      const correct = choice === currentQuestion.correctAnswer;
      if (correct) {
        setScore((s) => s + 1);
      } else {
        setWrongIds((ids) => [...ids, currentQuestion.word.id]);
      }
    },
    [isAnswered, currentQuestion]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setPhase("result");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    }
  }, [currentIndex, questions.length]);

  const handleReplay = useCallback(() => {
    clearState(level);
    const newQs = generateQuiz(levelWords);
    setQuestions(newQs);
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setWrongIds([]);
    setPhase("quiz");
  }, [levelWords, level]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (level > 1 && wordsLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading HSK {level} quiz…</p>
        </div>
      </div>
    );
  }

  // ── Paywall / error ─────────────────────────────────────────────────────────
  if (level > 1 && wordsError) {
    const isPremiumError = (wordsError as { status?: number })?.status === 403;
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-card border border-border rounded-2xl shadow-lg p-8 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Lock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {isPremiumError ? "Premium Required" : "Failed to Load"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isPremiumError
              ? "HSK 2–6 quizzes require a premium subscription."
              : "Could not load quiz words. Please try again."}
          </p>
          {isPremiumError && (
            <a
              href={import.meta.env.VITE_GUMROAD_URL ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Unlock Premium
            </a>
          )}
          <button onClick={() => setLocation("/dashboard")} className="text-sm text-muted-foreground hover:underline">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (levelWords.length < 4 && initialized) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Not enough words for a quiz</h2>
          <button onClick={() => setLocation("/levels")} className="text-primary hover:underline">
            Choose a level
          </button>
        </div>
      </div>
    );
  }

  // Show spinner while generating initial questions
  if (!initialized || questions.length === 0) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">

      {/* ── Sticky header ─────────────────────────────────────── */}
      <header className="sticky top-[52px] md:top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50 h-[52px] flex items-center justify-between px-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <button
          onClick={() => setLocation("/levels")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg py-1.5 px-2 -ml-2 hover:bg-muted"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">Levels</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gold" />
            <span className="font-bold font-serif text-base">HSK {level} Quiz</span>
          </div>
        </div>

        {/* Live score pill */}
        {phase === "quiz" && (
          <div className="flex items-center gap-1.5 text-sm font-semibold tabular-nums text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-foreground">{score}</span>
            <span className="text-muted-foreground/50">/ {currentIndex + (isAnswered ? 1 : 0)}</span>
          </div>
        )}
        {phase !== "quiz" && <div className="w-16" />}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 w-full max-w-2xl mx-auto">
        <AnimatePresence mode="wait">

          {/* ── Quiz phase ─────────────────────────────────────── */}
          {phase === "quiz" && currentQuestion && (
            <motion.div
              key={`q-${currentIndex}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22 }}
              className="w-full"
            >
              {/* Progress bar + counter */}
              <div className="mb-5">
                <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
                  <span className="text-xs">{QUESTION_LABELS[currentQuestion.type]}</span>
                  <span className="tabular-nums text-xs font-semibold">
                    {currentIndex + 1} <span className="text-muted-foreground/50">/ {questions.length}</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${progress + (100 / questions.length)}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Prompt card */}
              <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-10 shadow-lg mb-5 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />
                {currentQuestion.type === "char-to-meaning" ? (
                  <p className="text-8xl font-serif text-foreground leading-none">{currentQuestion.prompt}</p>
                ) : currentQuestion.type === "pinyin-to-char" ? (
                  <p className="text-3xl font-medium text-primary tracking-widest">{currentQuestion.prompt}</p>
                ) : (
                  <p className="text-3xl font-bold text-foreground">{currentQuestion.prompt}</p>
                )}
              </div>

              {/* Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuestion.choices.map((choice, i) => {
                  const isThisSelected = selected === choice;
                  const isThisCorrect = choice === currentQuestion.correctAnswer;
                  let choiceStyle = "bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/5";
                  if (isAnswered) {
                    if (isThisCorrect) {
                      choiceStyle = "bg-green-500/10 border-green-500/60 text-green-700 dark:text-green-400";
                    } else if (isThisSelected) {
                      choiceStyle = "bg-destructive/10 border-destructive/50 text-destructive";
                    } else {
                      choiceStyle = "bg-card border-border/40 text-muted-foreground opacity-60";
                    }
                  }

                  return (
                    <motion.button
                      key={choice}
                      whileTap={!isAnswered ? { scale: 0.97 } : {}}
                      onClick={() => handleSelect(choice)}
                      disabled={isAnswered}
                      className={cn(
                        "relative flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 font-medium text-left transition-all duration-200",
                        choiceStyle,
                        !isAnswered && "cursor-pointer"
                      )}
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className={cn("flex-1", currentQuestion.type === "meaning-to-char" && "text-2xl font-serif")}>
                        {choice}
                      </span>
                      {isAnswered && isThisCorrect  && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                      {isAnswered && isThisSelected && !isThisCorrect && <XCircle className="w-4 h-4 text-destructive shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback + Next */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 flex flex-col items-center gap-3"
                  >
                    <p className={cn("text-sm font-semibold", isCorrect ? "text-green-600 dark:text-green-400" : "text-destructive")}>
                      {isCorrect
                        ? "✓ Correct!"
                        : `✗ Correct answer: ${currentQuestion.correctAnswer}`}
                    </p>
                    <button
                      onClick={handleNext}
                      className="px-8 py-3 rounded-xl font-bold bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:-translate-y-0.5 hover:shadow-lg transition-all"
                    >
                      {currentIndex + 1 < questions.length ? "Next →" : "See Results"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Result phase ──────────────────────────────────── */}
          {phase === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-10 shadow-xl text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />

                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                  isPassing
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                )}>
                  {isPassing ? <CheckCircle2 className="w-8 h-8" /> : <Trophy className="w-8 h-8" />}
                </div>

                <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Quiz Complete!</h2>
                <p className="text-sm text-muted-foreground mb-5">HSK {level} · {questions.length} questions</p>

                {/* Score */}
                <p className="text-6xl font-bold text-foreground tabular-nums">
                  {pct}<span className="text-3xl text-muted-foreground font-normal">%</span>
                </p>

                {/* Pass / fail badge */}
                <div className="my-4">
                  {isPassing ? (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold text-sm border border-green-200 dark:border-green-800"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Passed ✓
                    </motion.span>
                  ) : (
                    <p className="text-sm text-muted-foreground">Score 70%+ to pass. Keep practicing!</p>
                  )}
                </div>

                {/* Correct / Incorrect breakdown */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-green-500/8 dark:bg-green-900/20 rounded-xl p-3 border border-green-200 dark:border-green-900">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums">{correctCount}</p>
                    <p className="text-xs text-green-700 dark:text-green-500 font-medium mt-0.5">Correct</p>
                  </div>
                  <div className="bg-destructive/8 rounded-xl p-3 border border-destructive/20">
                    <p className="text-2xl font-bold text-destructive tabular-nums">{incorrectCount}</p>
                    <p className="text-xs text-destructive/70 font-medium mt-0.5">Incorrect</p>
                  </div>
                </div>

                {/* Score bar */}
                <div className="w-full bg-muted rounded-full h-2 mb-7 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className={cn("h-full rounded-full", isPassing ? "bg-green-500" : "bg-primary")}
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={handleReplay}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retry Quiz
                  </button>
                  <button
                    onClick={() => setLocation(`/flashcards/${level}`)}
                    className="w-full py-3 rounded-xl font-semibold bg-card border-2 border-border text-foreground hover:bg-muted transition-colors"
                  >
                    Study Flashcards
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLocation("/dashboard")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/60"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => setLocation("/levels")}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/60"
                    >
                      Level Select
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
