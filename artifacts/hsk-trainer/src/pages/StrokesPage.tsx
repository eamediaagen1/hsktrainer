import { motion } from "framer-motion";
import { PenLine, Sparkles, Bell } from "lucide-react";
import { DecorativeBackground } from "@/components/Decorations";

const DEMO_STROKES = [
  { char: "人", strokes: 2, meaning: "Person" },
  { char: "山", strokes: 3, meaning: "Mountain" },
  { char: "水", strokes: 4, meaning: "Water" },
  { char: "木", strokes: 4, meaning: "Tree / Wood" },
  { char: "日", strokes: 4, meaning: "Sun / Day" },
  { char: "月", strokes: 4, meaning: "Moon / Month" },
];

export default function StrokesPage() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-8">
      <DecorativeBackground />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 max-w-lg text-center w-full"
      >
        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <PenLine className="w-8 h-8 text-primary" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wide mb-4">
          <Sparkles className="w-3 h-3" />
          Coming Soon
        </div>

        <h1 className="text-3xl font-serif font-bold text-foreground mb-3">
          Stroke Learning
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Master the correct stroke order for every character. Interactive animations will guide your writing from simple radicals to complex characters.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {DEMO_STROKES.map(({ char, strokes, meaning }) => (
            <div
              key={char}
              className="flex flex-col items-center py-4 px-3 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-md transition-all cursor-not-allowed opacity-75"
            >
              <span className="font-serif text-4xl text-foreground mb-1">{char}</span>
              <span className="text-xs text-muted-foreground">{meaning}</span>
              <span className="mt-1.5 text-[10px] font-semibold text-primary/70">{strokes} strokes</span>
            </div>
          ))}
        </div>

        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-muted border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
          <Bell className="w-4 h-4" />
          Notify me when it&rsquo;s ready
        </button>
      </motion.div>
    </div>
  );
}
