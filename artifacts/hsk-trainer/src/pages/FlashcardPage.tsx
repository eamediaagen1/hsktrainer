import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, ArrowRight, Star, ChevronLeft, Volume2, Lock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { hskData, type VocabWord } from "@/data/hskData";
import { useSavedWords } from "@/hooks/use-saved-words";
import { apiFetch } from "@/lib/api";
import { Flashcard } from "@/components/Flashcard";
import { cn } from "@/lib/utils";
import { speakChinese } from "@/lib/speech";

const ALL_CATEGORIES = "All";

function getCategories(words: typeof hskData): string[] {
  const cats = words
    .map((w) => w.category)
    .filter((c): c is string => Boolean(c));
  return [ALL_CATEGORIES, ...Array.from(new Set(cats))];
}

export default function FlashcardPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const level = parseInt(params.level || "1");

  const { toggleSaveCard, isCardSaved } = useSavedWords();

  // Level 1 words come from local data (free, no API needed)
  // Level 2-6 words are fetched from the authenticated API
  const { data: apiLevel, isLoading: wordsLoading, error: wordsError } = useQuery({
    queryKey: ["lessons", level],
    queryFn: () =>
      apiFetch<{ level: number; words: VocabWord[] }>(`/api/lessons?level=${level}`).then(
        (r) => r.words
      ),
    enabled: level > 1,
    staleTime: 30 * 60 * 1000,
  });

  const allLevelWords: VocabWord[] =
    level === 1 ? hskData.filter((w) => w.hskLevel === 1) : (apiLevel ?? []);

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

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [activeCategory]);

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const safeIndex = levelWords.length > 0 ? Math.min(currentIndex, levelWords.length - 1) : 0;

  const handleSpeak = useCallback(() => {
    const wordEntry = levelWords[safeIndex];
    if (!wordEntry) return;
    const didSpeak = speakChinese(wordEntry.word);
    if (didSpeak) {
      setIsSpeaking(true);
      const ms = 400 + wordEntry.word.length * 120 + 200;
      setTimeout(() => setIsSpeaking(false), ms);
    }
  }, [levelWords, safeIndex]);

  // Show loading state while fetching premium-level words
  if (level > 1 && wordsLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading HSK {level} words…</p>
        </div>
      </div>
    );
  }

  // Show error/paywall for premium levels
  if (level > 1 && wordsError) {
    const isPremiumError = (wordsError as { status?: number })?.status === 403;
    return (
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {isPremiumError ? "Premium Required" : "Unable to Load"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isPremiumError
              ? "HSK 2–6 requires a premium subscription. Upgrade to unlock all levels."
              : "Something went wrong. Please check your connection and try again."}
          </p>
          <button
            onClick={() => setLocation("/levels")}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Back to Levels
          </button>
        </div>
      </div>
    );
  }

  if (levelWords.length === 0) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">No words found</h2>
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
    <div className="min-h-full flex flex-col">

      {/* ── Sticky top zone: context bar + mobile category chips ── */}
      <div className="sticky top-[52px] md:top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">

        {/* Header row */}
        <div className="flex items-center justify-between gap-3 px-4 h-[52px]">
          <button
            onClick={() => setLocation("/levels")}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg py-1.5 px-2 -ml-2 hover:bg-muted"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-medium">Levels</span>
          </button>

          <span className="font-bold font-serif text-base">HSK {level}</span>

          <button
            onClick={() => setLocation("/review")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-gold/10 hover:border-gold/40 transition-colors text-sm font-medium"
          >
            <Star className="w-3.5 h-3.5 text-gold fill-gold/20" />
            <span className="hidden sm:inline">Review</span>
          </button>
        </div>

        {/* Mobile category chips (lg: desktop sidebar takes over) */}
        {isHsk1 && (
          <div className="flex lg:hidden gap-2 overflow-x-auto scrollbar-none px-4 pb-2.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Body: category sidebar (desktop lg+) + flashcard main ── */}
      <div className="flex flex-1 w-full max-w-5xl mx-auto">

        {/* Desktop category sidebar — only visible at lg+ */}
        {isHsk1 && (
          <aside className="hidden lg:flex flex-col gap-px w-44 shrink-0 pt-6 pr-3 pl-2 border-r border-border/40">
            <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-3 px-3">
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
        )}

        {/* Flashcard main area */}
        <main className="flex-1 flex flex-col py-6 px-4 md:px-8 overflow-y-auto">
          <div className="mx-auto w-full max-w-sm flex flex-col gap-5">

            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
                <span>
                  {isHsk1 && activeCategory !== ALL_CATEGORIES ? (
                    <span className="text-primary font-semibold">{activeCategory}</span>
                  ) : (
                    "Progress"
                  )}
                </span>
                <span className="tabular-nums">{safeIndex + 1} / {levelWords.length}</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
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
            <div className="flex flex-col gap-3 pb-6">
              {/* Voice + Save */}
              <div className="flex gap-3">
                <button
                  onClick={handleSpeak}
                  disabled={!speechSupported}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 border text-sm",
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

                <button
                  onClick={(e) => { e.stopPropagation(); toggleSaveCard(currentWord.id); }}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 border-2 text-sm",
                    saved
                      ? "bg-gold/20 text-gold-foreground border-gold/50 hover:bg-gold/30 shadow-[0_0_15px_rgba(253,185,19,0.2)]"
                      : "bg-card text-foreground border-border hover:border-border/80 hover:bg-muted"
                  )}
                >
                  <Star className={cn("w-4 h-4", saved ? "fill-gold text-gold" : "text-muted-foreground")} />
                  {saved ? "Saved" : "Save"}
                </button>
              </div>

              {/* Prev / Next */}
              <div className="flex gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="flex-1 py-3.5 rounded-xl font-semibold bg-card border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Prev
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === levelWords.length - 1}
                  className="flex-1 py-3.5 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none transition-all flex items-center justify-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
