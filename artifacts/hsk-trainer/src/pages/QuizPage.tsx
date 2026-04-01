import { useState, useCallback, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { ChevronLeft, RotateCcw, CheckCircle2, XCircle, Trophy, Lock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { hskData, VocabWord } from "@/data/hskData";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type QuestionType = "char-to-meaning" | "meaning-to-char" | "pinyin-to-char";

interface Question {
  type: QuestionType;
  word: VocabWord;
  prompt: string;
  choices: string[];
  correctAnswer: string;
}

const QUIZ_SIZE = 10;
const PASS_THRESHOLD = 0.9;

const QUESTION_LABELS: Record<QuestionType, string> = {
  "char-to-meaning": "What does this character mean?",
  "meaning-to-char": "Which character matches this meaning?",
  "pinyin-to-char": "Which character matches this pronunciation?",
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
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

export default function QuizPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const level = parseInt(params.level || "1");

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

  const [questions, setQuestions] = useState<Question[]>(() =>
    generateQuiz(level === 1 ? hskData.filter((w) => w.hskLevel === 1) : [])
  );

  // Once API words load for premium levels, generate questions
  useEffect(() => {
    if (level > 1 && apiLevel && apiLevel.length > 0) {
      setQuestions(generateQuiz(apiLevel));
    }
  }, [apiLevel, level]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");

  const currentQuestion = questions[currentIndex];
  const isAnswered = selected !== null;
  const isCorrect = selected === currentQuestion?.correctAnswer;
  const isPassing = score / questions.length >= PASS_THRESHOLD;

  const handleSelect = useCallback(
    (choice: string) => {
      if (isAnswered) return;
      setSelected(choice);
      if (choice === currentQuestion.correctAnswer) {
        setScore((s) => s + 1);
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
    setQuestions(generateQuiz(levelWords));
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setPhase("quiz");
  }, [levelWords]);

  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Loading state for premium levels
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

  // Paywall / error state for premium levels
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
          <button onClick={() => setLocation("/levels")} className="text-sm text-muted-foreground hover:underline">
            Back to levels
          </button>
        </div>
      </div>
    );
  }

  if (levelWords.length < 4) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Not enough words for a quiz</h2>
          <button onClick={() => setLocation("/levels")} className="text-primary hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">

      {/* Sticky header */}
      <header className="sticky top-[52px] md:top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50 h-[52px] flex items-center justify-between px-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <button
          onClick={() => setLocation("/levels")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg py-1.5 px-2 -ml-2 hover:bg-muted"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">Levels</span>
        </button>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-gold" />
          <span className="font-bold font-serif text-base">HSK {level} Quiz</span>
        </div>
        <div className="w-16" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 w-full max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {phase === "quiz" ? (
            <motion.div
              key={`q-${currentIndex}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22 }}
              className="w-full"
            >
              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
                  <span>{QUESTION_LABELS[currentQuestion.type]}</span>
                  <span className="tabular-nums">{currentIndex + 1} / {questions.length}</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
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
                  let choiceStyle =
                    "bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/5";
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
                      {isAnswered && isThisCorrect && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
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
                      {isCorrect ? "✓ Correct!" : `✗ Correct answer: ${currentQuestion.correctAnswer}`}
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
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-10 shadow-xl text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />

                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5",
                  isPassing ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-muted text-muted-foreground"
                )}>
                  {isPassing ? <CheckCircle2 className="w-8 h-8" /> : <Trophy className="w-8 h-8" />}
                </div>

                <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Quiz Complete!</h2>

                <p className="text-6xl font-bold text-foreground my-5 tabular-nums">
                  {score}
                  <span className="text-3xl text-muted-foreground font-normal">/{questions.length}</span>
                </p>

                {isPassing && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold text-sm mb-5 border border-green-200 dark:border-green-800"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Passed ✓
                  </motion.div>
                )}
                {!isPassing && (
                  <p className="text-sm text-muted-foreground mb-5">Score 90% or above to pass. Keep practicing!</p>
                )}

                <div className="w-full bg-muted rounded-full h-2.5 mb-7 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(score / questions.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className={cn("h-full rounded-full", isPassing ? "bg-green-500" : "bg-primary")}
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={handleReplay}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Replay Quiz
                  </button>
                  <button
                    onClick={() => setLocation(`/flashcards/${level}`)}
                    className="w-full py-3.5 rounded-xl font-semibold bg-card border-2 border-border text-foreground hover:bg-muted transition-colors"
                  >
                    Study Flashcards
                  </button>
                  <button
                    onClick={() => setLocation("/levels")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    ← Back to Level Select
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
