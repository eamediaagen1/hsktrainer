import { motion } from "framer-motion";
import { MessageSquare, Sparkles, Bell } from "lucide-react";

export default function PhrasesPage() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md text-center"
      >
        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wide mb-4">
          <Sparkles className="w-3 h-3" />
          Coming Soon
        </div>

        <h1 className="text-3xl font-serif font-bold text-foreground mb-3">
          Common Phrases
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Learn everyday conversational phrases, sentence patterns, and real-life dialogues. We&rsquo;re building this section now.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8 text-left">
          {[
            "At the restaurant",
            "Asking for directions",
            "Shopping conversations",
            "Making introductions",
            "Talking about weather",
            "Travel phrases",
          ].map((topic) => (
            <div
              key={topic}
              className="px-3 py-2.5 rounded-xl bg-muted/60 border border-border/50 text-sm text-muted-foreground"
            >
              {topic}
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
