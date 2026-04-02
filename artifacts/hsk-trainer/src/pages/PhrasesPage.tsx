import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Volume2,
} from "lucide-react";
import { phraseData, type Phrase } from "@/data/phraseData";
import { PageShell } from "@/components/PageShell";
import { speakChinese } from "@/lib/speech";
import { cn } from "@/lib/utils";

const HSK_LEVELS = [1] as const; // Expand as more levels get phrase data

function getPhraseCategoriesForLevel(level: number) {
  const phrases = phraseData.filter((p) => p.hskLevel === level);
  const map = new Map<string, Phrase[]>();
  for (const p of phrases) {
    if (!map.has(p.category)) map.set(p.category, []);
    map.get(p.category)!.push(p);
  }
  return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
}

const CATEGORY_EMOJI: Record<string, string> = {
  Greetings:      "👋",
  "Food & Drink": "🍵",
  "Time & Dates": "📅",
  Family:         "👨‍👩‍👧",
  "Daily Life":   "🏠",
  Travel:         "✈️",
};

function getEmoji(cat: string) { return CATEGORY_EMOJI[cat] ?? "💬"; }

// ─── Phrase Card (browse mode) ────────────────────────────────────────────────

function PhraseCard({ phrase }: { phrase: Phrase }) {
  const [revealed, setRevealed] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = speakChinese(phrase.phrase);
    if (ok) {
      setSpeaking(true);
      setTimeout(() => setSpeaking(false), 1200);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setRevealed((r) => !r)}
      onKeyDown={(e) => e.key === "Enter" && setRevealed((r) => !r)}
      className={cn(
        "w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 cursor-pointer select-none",
        revealed
          ? "bg-primary/5 border-primary/30"
          : "bg-card border-border/60 hover:border-primary/30 hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-serif text-foreground mb-1">{phrase.phrase}</p>
          <AnimatePresence initial={false}>
            {revealed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-sm text-primary font-medium mb-0.5">{phrase.pinyin}</p>
                <p className="text-sm text-muted-foreground">{phrase.meaning}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!revealed && (
            <p className="text-xs text-muted-foreground/60 italic">Tap to reveal</p>
          )}
        </div>
        <button
          onClick={handleSpeak}
          className={cn(
            "shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
            speaking
              ? "bg-blue-100 dark:bg-blue-900/40 text-blue-500"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Volume2 className={cn("w-4 h-4", speaking && "animate-pulse")} />
        </button>
      </div>
    </div>
  );
}

// ─── Category Browser ─────────────────────────────────────────────────────────

function CategoryBrowser({
  categories,
  activeCategory,
  setActiveCategory,
}: {
  categories: { name: string; items: Phrase[] }[];
  activeCategory: string;
  setActiveCategory: (name: string) => void;
}) {
  const activePhrases = categories.find((c) => c.name === activeCategory)?.items ?? [];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Category list sidebar */}
      <aside className="lg:w-52 shrink-0 flex lg:flex-col gap-2 overflow-x-auto scrollbar-none">
        {categories.map(({ name, items }) => (
          <button
            key={name}
            onClick={() => setActiveCategory(name)}
            className={cn(
              "shrink-0 lg:w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150 text-sm font-medium",
              activeCategory === name
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span className="text-base leading-none">{getEmoji(name)}</span>
            <span className="flex-1 truncate">{name}</span>
            <span className={cn(
              "text-xs shrink-0",
              activeCategory === name ? "text-primary-foreground/70" : "text-muted-foreground/60"
            )}>
              {items.length}
            </span>
          </button>
        ))}
      </aside>

      {/* Phrases list */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{getEmoji(activeCategory)}</span>
          <h3 className="font-serif text-xl font-bold text-foreground">{activeCategory}</h3>
          <span className="text-sm text-muted-foreground ml-1">({activePhrases.length} phrases)</span>
        </div>
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-3"
        >
          {activePhrases.map((phrase) => (
            <PhraseCard key={phrase.id} phrase={phrase} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PhrasesPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const initialCategory = searchParams.get("category") ?? "";

  const [activeLevel] = useState<number>(1);
  const categories = getPhraseCategoriesForLevel(activeLevel);

  const firstCat = categories[0]?.name ?? "";
  const [activeCategory, setActiveCategory] = useState(
    initialCategory && categories.some((c) => c.name === initialCategory)
      ? initialCategory
      : firstCat
  );

  // Sync if query param changes
  useEffect(() => {
    const cat = searchParams.get("category") ?? "";
    if (cat && categories.some((c) => c.name === cat)) {
      setActiveCategory(cat);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <PageShell maxWidth="xl">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Common Phrases</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-foreground leading-tight mb-2">
          Everyday Phrases
        </h1>
        <p className="text-muted-foreground max-w-lg">
          Learn real-world conversational phrases organized by topic. Tap any phrase card to reveal
          the pronunciation and meaning.
        </p>
      </div>

      {/* Level tabs (for future expansion) */}
      <div className="flex items-center gap-2 mb-8">
        {HSK_LEVELS.map((lvl) => (
          <button
            key={lvl}
            className="px-4 py-1.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground shadow-sm"
          >
            HSK {lvl}
          </button>
        ))}
        {[2, 3, 4, 5, 6].map((lvl) => (
          <span
            key={lvl}
            className="px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground/60 border border-border/40 cursor-default"
          >
            HSK {lvl}
          </span>
        ))}
      </div>

      {/* Level overview link */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setLocation(`/levels/hsk/${activeLevel}`)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to HSK {activeLevel} overview
        </button>
      </div>

      {/* Category browser */}
      {categories.length > 0 ? (
        <CategoryBrowser
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      ) : (
        <div className="p-12 text-center">
          <p className="text-muted-foreground">No phrase data for this level yet.</p>
        </div>
      )}

    </PageShell>
  );
}
