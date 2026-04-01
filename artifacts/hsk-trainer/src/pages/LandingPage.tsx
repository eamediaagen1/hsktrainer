import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { DecorativeBackground, Lanterns } from "@/components/Decorations";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await signIn(email);
      setSent(true);
    } catch {
      setError("Something went wrong. Please check your email and try again.");
    } finally {
      setIsLoading(false);
    }
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
          {/* Top gradient bar */}
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

          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <p className="font-semibold text-foreground">Check your email!</p>
                <p className="text-sm text-muted-foreground">
                  We sent a magic link to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                  Click the link to sign in — no password needed.
                </p>
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="text-xs text-muted-foreground underline underline-offset-2 mt-2"
                >
                  Use a different email
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email to start"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-5 py-4 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive text-left px-1">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending link…
                    </>
                  ) : (
                    <>
                      Send Magic Link
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-muted-foreground pt-1">
                  No password needed. We'll email you a sign-in link.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
