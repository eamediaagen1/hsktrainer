import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  BookOpen,
  Layers,
  Zap,
  CheckCircle2,
  ChevronRight,
  Star,
  ArrowRight,
  Brain,
  BarChart3,
  Shuffle,
} from "lucide-react";

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── Reusable components ──────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-4">
      <span className="w-5 h-px bg-primary" />
      {children}
      <span className="w-5 h-px bg-primary" />
    </p>
  );
}

function Divider() {
  return (
    <div className="flex items-center justify-center gap-3 my-20">
      <span className="text-gold text-xl">✦</span>
      <span className="w-16 h-px bg-border" />
      <span className="text-gold text-lg">✦</span>
      <span className="w-16 h-px bg-border" />
      <span className="text-gold text-xl">✦</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MarketingPage() {
  const [, setLocation] = useLocation();
  const go = () => setLocation("/app");
  const goDemo = () => setLocation("/demo");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      {/* Ambient decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-80 h-80 rounded-full bg-gold/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-primary/4 blur-3xl" />
      </div>

      {/* ─── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="relative z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-serif text-primary">汉</span>
            <span className="font-bold text-foreground tracking-tight">HSK Trainer</span>
          </div>
          <button
            onClick={go}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Sign in
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-20 pb-12 md:pt-28 md:pb-16 px-5">
        <div className="max-w-3xl mx-auto text-center">

          {/* Eyebrow */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/40 bg-gold/10 text-gold text-sm font-semibold mb-8"
          >
            <Star className="w-3.5 h-3.5 fill-gold" />
            All 6 HSK Levels — Lifetime Access
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-6"
          >
            Learn Chinese Vocabulary.
            <br />
            <span className="text-primary font-serif">Actually Remember It.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10"
          >
            Master HSK exam vocabulary step by step — with focused flashcards
            and quizzes built for real progress. No randomness. No overwhelm.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={go}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={goDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base bg-card border-2 border-border text-foreground hover:bg-muted hover:border-primary/30 transition-all duration-200"
            >
              Try Free Demo
            </button>
          </motion.div>

          {/* Trust line */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={4}
            className="mt-5 text-sm text-muted-foreground"
          >
            Try the free demo — no account needed. Upgrade for full access.
          </motion.p>

          {/* Hero visual — decorative character display */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={5}
            className="mt-14 relative"
          >
            <div className="bg-card border border-border/60 rounded-3xl p-8 shadow-2xl shadow-primary/5 max-w-sm mx-auto relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />
              <p className="text-8xl font-serif text-foreground mb-4 leading-none">你好</p>
              <p className="text-primary font-medium tracking-widest text-sm mb-1">nǐ hǎo</p>
              <p className="text-muted-foreground font-medium">Hello / Hi</p>
              <div className="mt-5 flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full bg-muted"
                    style={{ width: i === 1 ? 24 : 8 }}
                  >
                    {i === 1 && <div className="h-full w-full rounded-full bg-primary" />}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Preview — HSK 1 · 150 words</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ─── PROBLEM ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-5 pb-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            viewport={{ once: true }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionLabel>The Problem</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Learning Chinese is hard.<br />
              <span className="text-muted-foreground font-medium">Most apps make it harder.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: "😵‍💫",
                title: "Too many apps,\nzero structure",
                body: "Most tools dump thousands of words on you at once. Without a clear path, nothing sticks.",
              },
              {
                icon: "🔁",
                title: "You review.\nYou forget.",
                body: "Random word lists don't build memory. You repeat the same words and still blank on the exam.",
              },
              {
                icon: "📉",
                title: "HSK prep feels\nimpossible",
                body: "Without a level-by-level plan, progress is invisible. It's easy to quit before you begin.",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                viewport={{ once: true }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="bg-card border border-border/50 rounded-2xl p-7"
              >
                <p className="text-3xl mb-4">{card.icon}</p>
                <h3 className="font-bold text-foreground text-base whitespace-pre-line leading-snug mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ─── SOLUTION ────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-5 pb-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            viewport={{ once: true }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionLabel>The Solution</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              One level at a time.<br />
              <span className="text-primary">Real vocabulary. Real progress.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                Icon: Layers,
                color: "bg-primary/10 text-primary",
                title: "Structured HSK Levels",
                body: "Start from HSK 1. Build solid foundations before moving up. Every word in its right place.",
              },
              {
                Icon: BookOpen,
                color: "bg-gold/15 text-gold",
                title: "Flashcards That Work",
                body: "3D flip cards with the character, pinyin, and meaning together. Built for your brain to hold onto.",
              },
              {
                Icon: Brain,
                color: "bg-green-500/10 text-green-600 dark:text-green-400",
                title: "Quizzes That Test You",
                body: "Randomized every session. Instant feedback. Know exactly where you're weak — and fix it.",
              },
            ].map(({ Icon, color, title, body }, i) => (
              <motion.div
                key={i}
                viewport={{ once: true }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="bg-card border border-border/50 rounded-2xl p-7"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} mb-5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ─── PRODUCT PREVIEW ─────────────────────────────────────────────── */}
      <section className="relative z-10 px-5 pb-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            viewport={{ once: true }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionLabel>The Product</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Clean. Focused. Built for learners.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              No dashboards. No points systems. Just the tools you need to master vocabulary — fast.
            </p>
          </motion.div>

          {/* UI mockup blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Level selector card */}
            <motion.div
              viewport={{ once: true }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-card border border-border/60 rounded-2xl p-7 shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">
                Level Selection
              </p>
              <div className="space-y-3">
                {[
                  { level: "HSK 1", words: "150 words" },
                  { level: "HSK 2", words: "300 words" },
                  { level: "HSK 3", words: "600 words" },
                ].map(({ level, words }) => (
                  <div
                    key={level}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/40 bg-muted/40"
                  >
                    <div>
                      <p className="font-bold text-sm text-foreground">{level}</p>
                      <p className="text-xs text-muted-foreground">{words}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                      Premium
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-5">
                All 6 levels unlocked with a single purchase.
              </p>
            </motion.div>

            {/* Flashcard preview */}
            <motion.div
              viewport={{ once: true }}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-card border border-border/60 rounded-2xl p-7 shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">
                Flashcard Study
              </p>
              <div className="bg-background border border-border/40 rounded-2xl p-7 text-center mb-4 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />
                <p className="text-6xl font-serif text-foreground mb-3">学习</p>
                <p className="text-primary text-sm tracking-widest font-medium mb-1">xué xí</p>
                <p className="text-muted-foreground text-sm font-medium">Study / Learn</p>
              </div>
              <div className="flex gap-2 justify-center">
                <div className="flex-1 h-10 rounded-xl bg-red-500/10 border border-red-200 dark:border-red-900/40 flex items-center justify-center text-xs font-semibold text-red-600 dark:text-red-400">
                  Again
                </div>
                <div className="flex-1 h-10 rounded-xl bg-green-500/10 border border-green-200 dark:border-green-900/40 flex items-center justify-center text-xs font-semibold text-green-600 dark:text-green-400">
                  Got it
                </div>
              </div>
            </motion.div>

            {/* Quiz preview */}
            <motion.div
              viewport={{ once: true }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card border border-border/60 rounded-2xl p-7 shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">
                Quiz Mode
              </p>
              <p className="text-sm font-semibold text-foreground mb-4">What does this character mean?</p>
              <p className="text-5xl font-serif text-center text-foreground mb-5">水</p>
              <div className="grid grid-cols-2 gap-2">
                {["Fire", "Water", "Earth", "Wind"].map((opt, i) => (
                  <div
                    key={opt}
                    className={`px-3 py-2.5 rounded-xl border text-sm font-medium text-center ${
                      i === 1
                        ? "border-green-500/60 bg-green-500/10 text-green-700 dark:text-green-400"
                        : "border-border bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Stats / review preview */}
            <motion.div
              viewport={{ once: true }}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card border border-border/60 rounded-2xl p-7 shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">
                Spaced Review
              </p>
              <div className="space-y-3">
                {[
                  { label: "Words Studied", value: "48", icon: BookOpen },
                  { label: "Quiz Score", value: "90%", icon: BarChart3 },
                  { label: "Cards in Review", value: "12", icon: Shuffle },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{label}</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ─── BENEFITS ────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-5 pb-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-10"
            viewport={{ once: true }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionLabel>Why It Works</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Everything you need.<br />
              <span className="text-muted-foreground font-medium">Nothing you don't.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "150 HSK 1 words — fully organized and ready",
              "Flashcards with character, pinyin, and meaning",
              "Quizzes randomized every session",
              "Spaced repetition review built in",
              "Progress saved automatically — no account needed",
              "Voice pronunciation for every word",
              "Dark mode for late-night study sessions",
              "Built specifically for HSK exam success",
            ].map((benefit, i) => (
              <motion.div
                key={i}
                viewport={{ once: true }}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground leading-snug">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ─── FINAL CTA ───────────────────────────────────────────────────── */}
      <section className="relative z-10 px-5 pb-24">
        <motion.div
          viewport={{ once: true }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto bg-card border border-border/60 rounded-3xl p-10 md:p-14 text-center shadow-xl shadow-primary/5 relative overflow-hidden"
        >
          {/* Gold bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />

          {/* Decorative character */}
          <p className="text-5xl font-serif text-primary/20 mb-4 leading-none select-none">加油</p>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
            Ready to start?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Try the free demo with 10 words and a 5-question quiz.
            Upgrade once for lifetime access to all 6 HSK levels.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={go}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={goDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base bg-card border-2 border-border text-foreground hover:bg-muted hover:border-primary/30 transition-all duration-200"
            >
              Try Free Demo
            </button>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Demo needs no account. Full access with a one-time purchase.
          </p>

          {/* 加油 = "Keep going!" subtle footnote */}
          <p className="mt-8 text-xs text-muted-foreground/50 font-serif">
            加油 — Keep going
          </p>
        </motion.div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border/40 px-5 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-xl font-serif text-primary">汉</span>
            <span className="font-semibold text-foreground">HSK Trainer</span>
            <span>— Learn Chinese, one level at a time.</span>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={goDemo} className="hover:text-foreground transition-colors">
              Try Demo
            </button>
            <span>·</span>
            <button onClick={go} className="hover:text-foreground transition-colors">
              Sign in
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
