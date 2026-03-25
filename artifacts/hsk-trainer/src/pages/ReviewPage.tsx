import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Star, Sparkles, CheckCircle2 } from "lucide-react";
import { hskData } from "@/data/hskData";
import { useStore } from "@/hooks/use-store";
import { DecorativeBackground } from "@/components/Decorations";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Flashcard } from "@/components/Flashcard";
import { motion, AnimatePresence } from "framer-motion";

export default function ReviewPage() {
  const [, setLocation] = useLocation();
  const { savedCards, updateCardReview } = useStore();
  
  const [isFlipped, setIsFlipped] = useState(false);

  // Compute due cards ONCE on mount or when returning to page, so list doesn't vanish instantly upon rating
  const reviewQueue = useMemo(() => {
    const now = Date.now();
    const dueIds = Object.keys(savedCards).filter(id => savedCards[id].nextReview <= now);
    return hskData.filter(w => dueIds.includes(w.id));
    // We purposefully omit savedCards from dependency array to lock the queue 
    // for this session. It updates if we leave and come back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const handleRating = (difficulty: "hard" | "good" | "easy") => {
    const wordId = reviewQueue[currentIndex].id;
    updateCardReview(wordId, difficulty);
    
    // Move to next card
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 400); // short delay to show button press
  };

  const isComplete = currentIndex >= reviewQueue.length;

  return (
    <div className="min-h-screen flex flex-col relative">
      <DecorativeBackground />
      
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLocation("/levels")}
            className="p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Exit Review</span>
          </button>
        </div>
        <div className="flex items-center gap-3 text-gold font-bold">
          <Star className="w-5 h-5 fill-gold" />
          <span>Review Mode</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 w-full max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div 
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border/50 p-12 rounded-3xl shadow-xl text-center max-w-md"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">All Caught Up!</h2>
              <p className="text-muted-foreground mb-8">
                You've reviewed all your due cards for now. Great job sticking to your habit.
              </p>
              <button
                onClick={() => setLocation("/levels")}
                className="w-full py-4 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
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
              <div className="w-full max-w-sm mb-6 text-center">
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

              <div className="w-full max-w-sm mt-8 h-20">
                {isFlipped ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-3 gap-3"
                  >
                    <button
                      onClick={() => handleRating("hard")}
                      className="py-3 px-2 rounded-xl font-bold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors flex flex-col items-center"
                    >
                      <span>Hard</span>
                      <span className="text-[10px] opacity-70 mt-1">1 Day</span>
                    </button>
                    <button
                      onClick={() => handleRating("good")}
                      className="py-3 px-2 rounded-xl font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex flex-col items-center"
                    >
                      <span>Good</span>
                      <span className="text-[10px] opacity-70 mt-1">3 Days</span>
                    </button>
                    <button
                      onClick={() => handleRating("easy")}
                      className="py-3 px-2 rounded-xl font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors flex flex-col items-center"
                    >
                      <span>Easy</span>
                      <span className="text-[10px] opacity-70 mt-1">7 Days</span>
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground font-medium bg-card rounded-xl border border-border shadow-sm">
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
