import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Book, Star, Lock, Trophy, ExternalLink } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { PageShell } from "@/components/PageShell";
import { cn } from "@/lib/utils";

const levels = [
  { id: 1, count: 150,  title: "Beginner",          locked: false },
  { id: 2, count: 150,  title: "Elementary",         locked: true  },
  { id: 3, count: 300,  title: "Intermediate",       locked: true  },
  { id: 4, count: 600,  title: "Upper-Intermediate", locked: true  },
  { id: 5, count: 1300, title: "Advanced",           locked: true  },
  { id: 6, count: 2500, title: "Mastery",            locked: true  },
];

const GUMROAD_URL = "https://gumroad.com";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } },
};

export default function LevelSelection() {
  const [, setLocation] = useLocation();
  const { isPaid, getDueCards } = useStore();

  const dueCardsCount = getDueCards().length;

  return (
    <PageShell maxWidth="xl">
      {/* Page intro */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-2 leading-tight">
            Choose Your Level
          </h1>
          <p className="text-muted-foreground text-base max-w-md">
            Select an HSK level to start practicing. Master the vocabulary step-by-step.
          </p>
        </div>

        {dueCardsCount > 0 && (
          <button
            onClick={() => setLocation("/review")}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold/10 border border-gold/30 text-foreground hover:bg-gold/20 font-semibold transition-colors relative self-start sm:self-auto"
          >
            <Star className="w-4 h-4 text-gold fill-gold" />
            Review Mode
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
              {dueCardsCount}
            </span>
          </button>
        )}
      </div>

      {/* Level grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {levels.map((level) => {
          const isLocked = level.locked && !isPaid;
          return (
            <motion.div key={level.id} variants={item}>
              {isLocked ? (
                <div
                  className={cn(
                    "group relative bg-card/60 rounded-2xl p-7 text-left border border-border/40 shadow-sm overflow-hidden",
                    "opacity-60 select-none"
                  )}
                >
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.02)_10px,rgba(0,0,0,0.02)_11px)] rounded-2xl" />

                  <div className="relative z-10 flex flex-col justify-between gap-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-muted-foreground/50 font-medium uppercase tracking-widest">HSK</span>
                        <h2 className="text-5xl font-serif font-bold text-muted-foreground/60">{level.id}</h2>
                      </div>
                      <div className="p-2.5 bg-muted/50 rounded-xl mt-1">
                        <Lock className="w-4 h-4 text-muted-foreground/50" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-muted-foreground/60">{level.title}</h3>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted/80 text-muted-foreground/60 border border-border/40">
                          Locked
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground/40">{level.count.toLocaleString()} words</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setLocation(`/quiz/${level.id}`)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border/50 bg-muted/40 text-muted-foreground/70 text-sm font-medium hover:bg-muted/70 transition-colors"
                      >
                        <Trophy className="w-4 h-4" />
                        Take Quiz
                      </button>
                      <a
                        href={GUMROAD_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Unlock Premium
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="group relative bg-card rounded-2xl p-7 text-left border border-border hover:border-primary/40 shadow-sm hover:shadow-xl hover:shadow-primary/8 transition-all duration-300 overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-28 h-28 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/15 transition-colors duration-500" />

                  <div className="relative z-10 flex flex-col justify-between gap-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">HSK</span>
                        <h2 className="text-5xl font-serif font-bold text-foreground">{level.id}</h2>
                      </div>
                      <div className="p-2.5 bg-muted rounded-xl mt-1 group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                        <Book className="w-5 h-5" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-foreground">{level.title}</h3>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                          Available
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{level.count.toLocaleString()} words</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setLocation(`/quiz/${level.id}`)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-muted/50 text-foreground text-sm font-semibold hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        <Trophy className="w-4 h-4" />
                        Take Quiz
                      </button>
                      <button
                        onClick={() => setLocation(`/flashcards/${level.id}`)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-md shadow-primary/20 hover:-translate-y-0.5 hover:shadow-lg transition-all"
                      >
                        <Book className="w-4 h-4" />
                        Study Flashcards
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </PageShell>
  );
}
