import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, ArrowRight, Star, ChevronLeft, Volume2 } from "lucide-react";
import { hskData } from "@/data/hskData";
import { useStore } from "@/hooks/use-store";
import { DecorativeBackground } from "@/components/Decorations";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Flashcard } from "@/components/Flashcard";
import { cn } from "@/lib/utils";

const ALL_CATEGORIES = "All";

function getCategories(words: typeof hskData): string[] {
  const cats = words
    .map((w) => w.category)
    .filter((c): c is string => Boolean(c));
  return [ALL_CATEGORIES, ...Array.from(new Set(cats))];
}

function speakWord(word: string, pinyin: string) {
  if (!("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterWord = new SpeechSynthesisUtterance(word);
  utterWord.lang = "zh-CN";
  utterWord.rate = 0.85;
  window.speechSynthesis.speak(utterWord);
  if (pinyin) {
    const utterPinyin = new SpeechSynthesisUtterance(pinyin);
    utterPinyin.lang = "en-US";
    utterPinyin.rate = 0.85;
    utterPinyin.volume = 0.8;
    // Short pause then pinyin
    setTimeout(() => window.speechSynthesis.speak(utterPinyin), 900);
  }
  return true;
}

export default function FlashcardPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const level = parseInt(params.level || "1");

  const { toggleSaveCard, isCardSaved } = useStore();

  const allLevelWords = hskData.filter((w) => w.hskLevel === level);
  const isHsk1 = level === 1;
  const categories = isHsk1 ? getCategories(allLevelWords) : [];

  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [speechSupported] = useState(() => "speechSynthesis" in window);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const levelWords =
    isHsk1 && activeCategory !== ALL_CATEGORIES
      ? allLevelWords.filter((w) => w.category === activeCategory)
      : allLevelWords;

  // Reset card index & flip when category changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [activeCategory]);

  // Reset flip when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  // Clamp safeIndex so a stale currentIndex never exceeds the filtered word list.
  // Without this, switching to a category with fewer words causes one crash frame
  // before the reset-to-0 effect fires.
  const safeIndex = levelWords.length > 0 ? Math.min(currentIndex, levelWords.length - 1) : 0;

  const handleSpeak = useCallback(() => {
    const wordEntry = levelWords[safeIndex];
    if (!wordEntry) return;
    setIsSpeaking(true);
    speakWord(wordEntry.word, wordEntry.pinyin);
    const totalDuration = 900 + wordEntry.pinyin.length * 80 + 800;
    setTimeout(() => setIsSpeaking(false), totalDuration);
  }, [levelWords, safeIndex]);

  if (levelWords.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No words found</h2>
          <button onClick={() => setLocation("/levels")} className="text-primary hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const currentWord = levelWords[safeIndex];
  const saved = isCardSaved(currentWord.id);
  const progress = ((safeIndex + 1) / levelWords.length) * 100;

  const handleNext = () => {
    if (currentIndex < levelWords.length - 1) setCurrentIndex((p) => p + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((p) => p - 1);
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

      {/* Body: Sidebar + Main */}
      <div className="flex flex-1 w-full max-w-5xl mx-auto">
        {/* ── Category Sidebar (desktop) / Scroll bar (mobile) ── */}
        {isHsk1 && (
          <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex flex-col gap-1 w-44 shrink-0 pt-8 pr-4 pl-2 border-r border-border/40">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                Categories
              </p>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "text-left px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </aside>

            {/* Mobile horizontal scroll bar */}
            <div className="md:hidden flex gap-2 overflow-x-auto scrollbar-none px-4 pt-4 pb-0 w-full absolute top-[57px] left-0 z-40 bg-background/90 backdrop-blur border-b border-border/30">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 mb-2",
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── Flashcard Main Area ── */}
        <main
          className={cn(
            "flex-1 flex flex-col items-center justify-center p-4 md:p-8 w-full",
            isHsk1 ? "md:pt-8 pt-16" : ""
          )}
        >
          {/* Progress */}
          <div className="w-full max-w-sm mb-8">
            <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
              <span>
                {isHsk1 && activeCategory !== ALL_CATEGORIES ? (
                  <span className="text-primary font-semibold">{activeCategory}</span>
                ) : (
                  "Progress"
                )}
              </span>
              <span>
                {safeIndex + 1} / {levelWords.length}
              </span>
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
          <div className="w-full max-w-sm mt-8 flex flex-col gap-3">
            {/* Voice + Save row */}
            <div className="flex gap-3">
              {/* Listen button */}
              <button
                onClick={handleSpeak}
                disabled={!speechSupported}
                title={speechSupported ? "Listen to pronunciation" : "Speech not supported in this browser"}
                className={cn(
                  "flex-1 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 border",
                  speechSupported
                    ? isSpeaking
                      ? "bg-blue-500/15 border-blue-400/50 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "bg-card border-border text-foreground hover:bg-blue-500/10 hover:border-blue-400/40 hover:text-blue-600 dark:hover:text-blue-400"
                    : "bg-muted border-border text-muted-foreground cursor-not-allowed opacity-50"
                )}
              >
                <Volume2
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isSpeaking && "animate-pulse"
                  )}
                />
                <span className="text-sm">{isSpeaking ? "Playing…" : "Listen"}</span>
              </button>

              {/* Save for Review */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleSaveCard(currentWord.id); }}
                className={cn(
                  "flex-1 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 border-2",
                  saved
                    ? "bg-gold/20 text-gold-foreground border-gold/50 hover:bg-gold/30 shadow-[0_0_15px_rgba(253,185,19,0.2)]"
                    : "bg-card text-foreground border-border hover:border-border/80 hover:bg-muted"
                )}
              >
                <Star className={cn("w-4 h-4", saved ? "fill-gold text-gold" : "text-muted-foreground")} />
                <span className="text-sm">{saved ? "Saved" : "Save"}</span>
              </button>
            </div>

            {/* Prev / Next */}
            <div className="flex gap-3">
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
    </div>
  );
}
