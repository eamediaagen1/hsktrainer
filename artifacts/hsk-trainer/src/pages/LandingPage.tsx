import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { DecorativeBackground, Lanterns } from "@/components/Decorations";

/**
 * After login, call the API to check whether this email has a paid Gumroad
 * purchase. If so, unlock premium levels immediately.
 *
 * When Supabase Auth is configured, replace this fetch with a Supabase
 * session lookup and profile `is_paid` column check.
 */
async function checkPaymentStatus(email: string): Promise<boolean> {
  try {
    const apiBase = import.meta.env["VITE_API_BASE_URL"] ?? "/api-server";
    const res = await fetch(
      `${apiBase}/api/check-access?email=${encodeURIComponent(email)}`
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { isPaid?: boolean };
    return data.isPaid === true;
  } catch {
    // API unreachable (local dev without the server, or network error)
    return false;
  }
}

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { login, unlockPremium } = useStore();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const [isPaid] = await Promise.all([
      checkPaymentStatus(email),
      // Minimum 1.2s delay so the "Verifying…" state is visible
      new Promise<void>((r) => setTimeout(r, 1200)),
    ]);

    login(email);
    if (isPaid) unlockPremium();
    setIsLoading(false);
    setLocation("/levels");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <DecorativeBackground />
      <Lanterns />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-border/50 text-center relative overflow-hidden">
          {/* Subtle top red bar */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary via-gold to-primary" />

          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center p-2">
            <img
              src={`${import.meta.env.BASE_URL}images/panda-mascot.png`}
              alt="Panda mascot"
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-3 leading-tight">
            Master HSK Vocabulary <span className="text-primary block mt-1">Faster</span>
          </h1>

          <p className="text-muted-foreground mb-8 text-sm md:text-base">
            Learn Chinese characters beautifully with smart, spaced-repetition flashcards.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                required
                placeholder="Enter your email to start"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Access
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
