import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, ArrowRight, Star, ChevronLeft } from "lucide-react";
import { hskData } from "@/data/hskData";
import { useStore } from "@/hooks/use-store";
import { DecorativeBackground } from "@/components/Decorations";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Flashcard } from "@/components/Flashcard";
import { cn } from "@/lib/utils";

export default function FlashcardPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const level = parseInt(params.level || "1");
  
  const { toggleSaveCard, isCardSaved } = useStore();
  
  const levelWords = hskData.filter(w => w.hskLevel === level);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  if (levelWords.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Level not found</h2>
          <button onClick={() => setLocation("/levels")} className="text-primary hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  const currentWord = levelWords[currentIndex];
  const saved = isCardSaved(currentWord.id);
  const progress = ((currentIndex + 1) / levelWords.length) * 100;

  const handleNext = () => {
    if (currentIndex < levelWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

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
            <span className="hidden sm:inline font-medium">Levels</span>
          </button>
          <div className="h-6 w-px bg-border mx-1" />
          <span className="font-bold font-serif text-lg">HSK {level}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button 
            onClick={() => setLocation("/review")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-gold/10 hover:border-gold/50 transition-colors"
          >
            <Star className="w-4 h-4 text-gold fill-gold/20" />
            <span className="hidden sm:inline text-sm font-medium">Review</span>
          </button>
        </div>
      </header>

      {/* Main Flashcard Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 w-full max-w-4xl mx-auto">
        
        {/* Progress Bar */}
        <div className="w-full max-w-sm mb-8">
          <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{currentIndex + 1} / {levelWords.length}</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Flashcard 
          word={currentWord}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
        />

        {/* Controls */}
        <div className="w-full max-w-sm mt-8 flex flex-col gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); toggleSaveCard(currentWord.id); }}
            className={cn(
              "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300",
              saved 
                ? "bg-gold/20 text-gold-foreground border-2 border-gold/50 hover:bg-gold/30 shadow-[0_0_15px_rgba(253,185,19,0.2)]" 
                : "bg-card text-foreground border-2 border-border hover:border-border/80 hover:bg-muted"
            )}
          >
            <Star className={cn("w-5 h-5", saved ? "fill-gold text-gold" : "text-muted-foreground")} />
            {saved ? "Saved for Review" : "Save for Review"}
          </button>

          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex-1 py-4 rounded-xl font-semibold bg-card border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Prev
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === levelWords.length - 1}
              className="flex-1 py-4 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all flex items-center justify-center gap-2"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
