import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Star, Sparkles, CheckCircle2, Volume2 } from "lucide-react";
import { hskData } from "@/data/hskData";
import { useStore } from "@/hooks/use-store";
import { Flashcard } from "@/components/Flashcard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { speakChinese } from "@/lib/speech";

export default function ReviewPage() {
  const [, setLocation] = useLocation();
  const { savedCards, updateCardReview } = useStore();

  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const reviewQueue = useMemo(() => {
    const now = Date.now();
    const dueIds = Object.keys(savedCards).filter((id) => savedCards[id].nextReview <= now);
    return hskData.filter((w) => dueIds.includes(w.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const handleSpeak = useCallback(() => {
    const entry = reviewQueue[currentIndex];
    if (!entry) return;
    const didSpeak = speakChinese(entry.word);
    if (didSpeak) {
      setIsSpeaking(true);
      const ms = 400 + entry.word.length * 120 + 200;
      setTimeout(() => setIsSpeaking(false), ms);
    }
  }, [reviewQueue, currentIndex]);

  const handleRating = (difficulty: "hard" | "good" | "easy") => {
    const wordId = reviewQueue[currentIndex].id;
    updateCardReview(wordId, difficulty);
    setTimeout(() => setCurrentIndex((prev) => prev + 1), 400);
  };

  const isComplete = currentIndex >= reviewQueue.length;

  return (
    <div className="min-h-full flex flex-col">

      {/* Sticky header */}
      <header className="sticky top-[52px] md:top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50 h-[52px] flex items-center justify-between px-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <button
          onClick={() => setLocation("/levels")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg py-1.5 px-2 -ml-2 hover:bg-muted"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">Exit Review</span>
        </button>
        <div className="flex items-center gap-2 text-gold font-bold">
          <Star className="w-4 h-4 fill-gold" />
          <span className="font-serif text-base">Review Mode</span>
        </div>
        <div className="w-16" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 w-full max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border/50 p-10 rounded-2xl shadow-xl text-center max-w-md w-full"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-3">All Caught Up!</h2>
              <p className="text-muted-foreground mb-7 text-sm leading-relaxed">
                You've reviewed all your due cards for now. Great job sticking to your habit.
              </p>
              <button
                onClick={() => setLocation("/levels")}
                className="w-full py-3.5 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
              >
                Back to Levels
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="studying"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col items-center"
            >
              <div className="w-full max-w-sm mb-5 text-center">
                <p className="text-sm font-bold text-primary flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {reviewQueue.length - currentIndex} cards remaining
                </p>
              </div>

              <Flashcard
                word={reviewQueue[currentIndex]}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(!isFlipped)}
              />

              {/* Listen */}
              <div className="w-full max-w-sm mt-4">
                <button
                  onClick={handleSpeak}
                  disabled={!speechSupported}
                  className={cn(
                    "w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 border text-sm",
                    speechSupported
                      ? isSpeaking
                        ? "bg-blue-500/15 border-blue-400/50 text-blue-600 dark:text-blue-400"
                        : "bg-card border-border text-foreground hover:bg-blue-500/10 hover:border-blue-400/40 hover:text-blue-600"
                      : "bg-muted border-border text-muted-foreground cursor-not-allowed opacity-50"
                  )}
                >
                  <Volume2 className={cn("w-4 h-4", isSpeaking && "animate-pulse")} />
                  {isSpeaking ? "Playing…" : "Listen"}
                </button>
              </div>

              {/* Rating / flip prompt */}
              <div className="w-full max-w-sm mt-4 h-[80px]">
                {isFlipped ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-3 gap-3"
                  >
                    <button
                      onClick={() => handleRating("hard")}
                      className="py-3 rounded-xl font-bold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors flex flex-col items-center gap-0.5"
                    >
                      <span className="text-sm">Hard</span>
                      <span className="text-[10px] opacity-60">1 Day</span>
                    </button>
                    <button
                      onClick={() => handleRating("good")}
                      className="py-3 rounded-xl font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex flex-col items-center gap-0.5"
                    >
                      <span className="text-sm">Good</span>
                      <span className="text-[10px] opacity-60">3 Days</span>
                    </button>
                    <button
                      onClick={() => handleRating("easy")}
                      className="py-3 rounded-xl font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors flex flex-col items-center gap-0.5"
                    >
                      <span className="text-sm">Easy</span>
                      <span className="text-[10px] opacity-60">7 Days</span>
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground font-medium bg-card rounded-xl border border-border shadow-sm">
                    Flip card to rate
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
