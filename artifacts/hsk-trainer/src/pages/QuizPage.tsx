import { useState, useCallback, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { ChevronLeft, RotateCcw, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { hskData, VocabWord } from "@/data/hskData";
import { DecorativeBackground } from "@/components/Decorations";
import { ThemeToggle } from "@/components/ThemeToggle";
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

  const levelWords = hskData.filter((w) => w.hskLevel === level);

  const [questions, setQuestions] = useState<Question[]>(() => generateQuiz(levelWords));
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

  if (levelWords.length < 4) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Not enough words for a quiz</h2>
          <button onClick={() => setLocation("/levels")} className="text-primary hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <DecorativeBackground />

      {/* Header */}
      <header className="bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <button
          onClick={() => setLocation("/levels")}
          className="p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">Levels</span>
        </button>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gold" />
          <span className="font-bold font-serif text-lg">HSK {level} Quiz</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 w-full max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {phase === "quiz" ? (
            <motion.div
              key={`q-${currentIndex}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
                  <span>{QUESTION_LABELS[currentQuestion.type]}</span>
                  <span className="tabular-nums">
                    {currentIndex + 1} / {questions.length}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Prompt card */}
              <div className="bg-card border border-border/50 rounded-3xl p-10 shadow-lg mb-6 text-center relative overflow-hidden">
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
                      choiceStyle =
                        "bg-green-500/10 border-green-500/60 text-green-700 dark:text-green-400 shadow-sm shadow-green-500/10";
                    } else if (isThisSelected) {
                      choiceStyle =
                        "bg-destructive/10 border-destructive/50 text-destructive";
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
                        "relative flex items-center gap-3 px-5 py-4 rounded-2xl border-2 font-medium text-left transition-all duration-200",
                        choiceStyle,
                        !isAnswered && "cursor-pointer"
                      )}
                    >
                      <span className="shrink-0 w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className={cn("flex-1", currentQuestion.type === "meaning-to-char" && "text-2xl font-serif")}>
                        {choice}
                      </span>
                      {isAnswered && isThisCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      )}
                      {isAnswered && isThisSelected && !isThisCorrect && (
                        <XCircle className="w-5 h-5 text-destructive shrink-0" />
                      )}
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
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isCorrect ? "text-green-600 dark:text-green-400" : "text-destructive"
                      )}
                    >
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
            /* Result screen */
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="bg-card border border-border/50 rounded-3xl p-10 shadow-xl text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />

                {/* Icon */}
                <div
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
                    isPassing
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isPassing ? (
                    <CheckCircle2 className="w-10 h-10" />
                  ) : (
                    <Trophy className="w-10 h-10" />
                  )}
                </div>

                <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
                  Quiz Complete!
                </h2>

                {/* Score */}
                <p className="text-6xl font-bold text-foreground my-6 tabular-nums">
                  {score}
                  <span className="text-3xl text-muted-foreground font-normal">
                    /{questions.length}
                  </span>
                </p>

                {/* Passed badge */}
                {isPassing && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold text-sm mb-6 border border-green-200 dark:border-green-800"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Passed ✓
                  </motion.div>
                )}
                {!isPassing && (
                  <p className="text-sm text-muted-foreground mb-6">
                    Score 90% or above to pass. Keep practicing!
                  </p>
                )}

                {/* Percentage bar */}
                <div className="w-full bg-muted rounded-full h-3 mb-8 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(score / questions.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className={cn(
                      "h-full rounded-full",
                      isPassing ? "bg-green-500" : "bg-primary"
                    )}
                  />
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleReplay}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Replay Quiz
                  </button>
                  <button
                    onClick={() => setLocation(`/flashcards/${level}`)}
                    className="w-full py-4 rounded-xl font-semibold bg-card border-2 border-border text-foreground hover:bg-muted transition-colors"
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
