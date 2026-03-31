import { motion } from "framer-motion";
import { BarChart3, Brain, Star, Trophy, Flame, BookOpen } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { hskData } from "@/data/hskData";
import { PageShell } from "@/components/PageShell";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sublabel?: string;
  color: string;
}

function StatCard({ icon: Icon, label, value, sublabel, color }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-card rounded-2xl border border-border/60 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-sm font-medium text-foreground/80 leading-tight">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
    </motion.div>
  );
}

export default function ProgressPage() {
  const { savedCards, getDueCards } = useStore();

  const savedCount = Object.keys(savedCards).length;
  const dueCount = getDueCards().length;

  const levelStats = [1, 2, 3, 4, 5, 6].map((lvl) => {
    const total = hskData.filter((w) => w.hskLevel === lvl).length;
    const saved = Object.keys(savedCards).filter((id) => {
      const word = hskData.find((w) => w.id === id);
      return word?.hskLevel === lvl;
    }).length;
    const pct = total > 0 ? Math.round((saved / total) * 100) : 0;
    return { lvl, total, saved, pct };
  });

  const levelLabels = ["Beginner", "Elementary", "Intermediate", "Upper-Int.", "Advanced", "Mastery"];

  return (
    <PageShell maxWidth="lg">

      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Your Progress</h1>
          <p className="text-sm text-muted-foreground">Track your vocabulary journey</p>
        </div>
      </div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10"
      >
        <StatCard icon={BookOpen}  label="Cards Saved"    value={savedCount} sublabel="across all levels"     color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
        <StatCard icon={Star}      label="Due for Review"  value={dueCount}   sublabel="ready to review now"   color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
        <StatCard icon={Brain}     label="HSK 1 Words"     value="151"         sublabel="available to study"    color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
        <StatCard icon={Trophy}    label="Quizzes Taken"   value="—"           sublabel="start a quiz to track" color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
        <StatCard icon={Flame}     label="Study Streak"    value="—"           sublabel="log in daily"          color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" />
        <StatCard icon={BarChart3} label="Total Words"     value="5605+"       sublabel="HSK 1–6 combined"      color="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400" />
      </motion.div>

      {/* Level breakdown */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="text-lg font-bold text-foreground mb-4">Level Breakdown</h2>
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
          {levelStats.map(({ lvl, total, saved, pct }, idx) => (
            <div
              key={lvl}
              className={`flex items-center gap-4 px-5 py-4 ${idx < levelStats.length - 1 ? "border-b border-border/40" : ""}`}
            >
              <div className="w-14 shrink-0 text-center">
                <span className="text-base font-serif font-bold text-foreground/60 block">HSK</span>
                <span className="text-2xl font-serif font-bold text-foreground">{lvl}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">{levelLabels[lvl - 1]}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{saved} / {total} saved</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: 0.15 + idx * 0.07, ease: "easeOut" }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
              <div className="w-10 text-right shrink-0">
                <span className="text-sm font-semibold text-foreground/50 tabular-nums">{pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </PageShell>
  );
}
