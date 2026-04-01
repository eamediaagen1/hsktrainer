import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, Mail, Lock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { DecorativeBackground, Lanterns } from "@/components/Decorations";

type Mode = "magic" | "login" | "signup";

function friendlyError(message: string): string {
  if (message.includes("Invalid login credentials"))
    return "Incorrect email or password. Please try again.";
  if (message.includes("Email not confirmed"))
    return "Please confirm your email before logging in. Check your inbox.";
  if (message.includes("User already registered"))
    return "An account with this email already exists. Try logging in instead.";
  if (message.includes("Password should be at least"))
    return "Password must be at least 6 characters.";
  if (message.includes("Unable to validate email address"))
    return "Please enter a valid email address.";
  if (message.includes("rate limit") || message.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  return message;
}

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { signIn, signInWithPassword, signUpWithPassword } = useAuth();

  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);           // magic link sent
  const [needsConfirm, setNeedsConfirm] = useState(false); // signup confirmation
  const [error, setError] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setSent(false);
    setNeedsConfirm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      if (mode === "magic") {
        await signIn(email);
        setSent(true);
      } else if (mode === "login") {
        await signInWithPassword(email, password);
        setLocation("/levels");
      } else {
        const { needsConfirmation } = await signUpWithPassword(email, password);
        if (needsConfirmation) {
          setNeedsConfirm(true);
        } else {
          setLocation("/levels");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(friendlyError(msg));
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccess = sent || needsConfirm;

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

          <p className="text-muted-foreground mb-6 text-sm md:text-base">
            Learn Chinese characters beautifully with smart, spaced-repetition flashcards.
          </p>

          {/* Mode toggle */}
          {!showSuccess && (
            <div className="flex rounded-xl bg-muted p-1 mb-6 gap-1">
              {(["magic", "login", "signup"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    mode === m
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "magic" ? "Magic Link" : m === "login" ? "Password Login" : "Sign Up"}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ── Magic link sent ── */}
            {sent && (
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
            )}

            {/* ── Signup: email confirmation required ── */}
            {needsConfirm && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <p className="font-semibold text-foreground">Confirm your email</p>
                <p className="text-sm text-muted-foreground">
                  We sent a confirmation link to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                  Click the link to activate your account.
                </p>
                <button
                  onClick={() => { setNeedsConfirm(false); setEmail(""); setPassword(""); }}
                  className="text-xs text-muted-foreground underline underline-offset-2 mt-2"
                >
                  Use a different email
                </button>
              </motion.div>
            )}

            {/* ── Forms ── */}
            {!showSuccess && (
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleSubmit}
                className="space-y-3"
              >
                {/* Email field — all modes */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-5 py-4 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>

                {/* Password field — login + signup */}
                {(mode === "login" || mode === "signup") && (
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="password"
                      required
                      minLength={mode === "signup" ? 6 : undefined}
                      placeholder={mode === "signup" ? "Password (min. 6 characters)" : "Password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-5 py-4 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                    />
                  </div>
                )}

                {error && (
                  <p className="text-sm text-destructive text-left px-1">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email || ((mode === "login" || mode === "signup") && !password)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {mode === "magic" ? "Sending link…" : mode === "login" ? "Logging in…" : "Creating account…"}
                    </>
                  ) : (
                    <>
                      {mode === "magic" ? "Send Magic Link" : mode === "login" ? "Login" : "Create Account"}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-muted-foreground pt-1">
                  {mode === "magic"
                    ? "No password needed. We'll email you a sign-in link."
                    : mode === "login"
                    ? "Don't have an account? Switch to Sign Up above."
                    : "Already have an account? Switch to Password Login above."}
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
