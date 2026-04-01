import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, Lock, Mail, Shield } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { setAdminVerified } from "./admin/adminUtils";

function friendlyError(message: string): string {
  if (message.includes("Invalid login credentials"))
    return "Incorrect email or password.";
  if (message.includes("Email not confirmed"))
    return "Please confirm your email first.";
  if (message.includes("rate limit") || message.includes("too many"))
    return "Too many attempts. Please wait and try again.";
  return message;
}

export default function AdminLoginPage() {
  const { user, loading: authLoading, signInWithPassword } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [location, navigate] = useLocation();

  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract ?next= redirect target
  const next = new URLSearchParams(location.split("?")[1] ?? "").get("next") ?? "/admin";

  // If already admin+verified, redirect immediately
  useEffect(() => {
    if (!authLoading && !profileLoading && profile?.role === "admin") {
      // User is already signed in as admin — just set verified and go
      setAdminVerified();
      navigate(next);
    }
  }, [authLoading, profileLoading, profile, navigate, next]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await signInWithPassword(email, password);
      setAdminVerified();
      navigate(next);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(friendlyError(msg));
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo/badge */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Admin Verification</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to enable admin actions.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="email"
              required
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-card border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-card border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying…
              </>
            ) : (
              "Verify & Enter Admin"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Verification expires after 60 minutes of inactivity.
        </p>

        <div className="text-center">
          <button
            onClick={() => navigate("/admin")}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            ← Back to admin panel (read-only)
          </button>
        </div>
      </div>
    </div>
  );
}
