import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Book, Star, LogOut } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { DecorativeBackground } from "@/components/Decorations";
import { ThemeToggle } from "@/components/ThemeToggle";

const levels = [
  { id: 1, count: 150, title: "Beginner" },
  { id: 2, count: 150, title: "Elementary" },
  { id: 3, count: 300, title: "Intermediate" },
  { id: 4, count: 600, title: "Upper-Intermediate" },
  { id: 5, count: 1300, title: "Advanced" },
  { id: 6, count: 2500, title: "Mastery" },
];

export default function LevelSelection() {
  const [, setLocation] = useLocation();
  const { email, logout, getDueCards } = useStore();
  
  const dueCardsCount = getDueCards().length;

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen relative pb-24">
      <DecorativeBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-lg">
            汉
          </div>
          <span className="font-semibold text-foreground hidden sm:inline-block">HSK Trainer</span>
        </div>
        
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground hidden md:block">Welcome, {email}</p>
          <ThemeToggle />
          <button 
            onClick={() => setLocation("/review")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/10 text-gold-foreground hover:bg-gold/20 font-medium transition-colors relative"
          >
            <Star className="w-4 h-4 text-gold fill-gold" />
            <span className="hidden sm:inline">Review Mode</span>
            {dueCardsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
                {dueCardsCount}
              </span>
            )}
          </button>
          <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pt-12 md:pt-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Choose Your Level</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select an HSK level to start practicing. Master the vocabulary step-by-step.
          </p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {levels.map((level) => (
            <motion.button
              key={level.id}
              variants={item}
              onClick={() => setLocation(`/flashcards/${level.id}`)}
              className="group relative bg-card rounded-3xl p-8 text-left border border-border hover:border-primary/50 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
            >
              {/* Decorative corner accent */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500" />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-8">
                  <h2 className="text-5xl font-serif font-bold text-foreground">
                    <span className="text-2xl text-muted-foreground block font-sans mb-1 font-medium">HSK</span>
                    {level.id}
                  </h2>
                  <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                    <Book className="w-6 h-6" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">{level.title}</h3>
                  <p className="text-muted-foreground">{level.count} words</p>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
