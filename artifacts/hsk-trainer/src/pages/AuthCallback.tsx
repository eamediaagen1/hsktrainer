import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";

/**
 * /auth/callback
 *
 * Supabase redirects here after the user clicks the magic-link email.
 * The SDK automatically exchanges the URL hash tokens for a session.
 * We wait for the SIGNED_IN event, optionally migrate localStorage data,
 * then redirect to /levels.
 */
export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // Migrate spaced-repetition data from localStorage (fire-and-forget)
          try {
            const raw = localStorage.getItem("hsk_saved_cards");
            if (raw) {
              const cards = JSON.parse(raw) as Record<string, unknown>;
              if (Object.keys(cards).length > 0) {
                await apiFetch("/api/progress/migrate", {
                  method: "POST",
                  body: JSON.stringify({ saved_cards: cards }),
                });
                localStorage.removeItem("hsk_saved_cards");
              }
            }
          } catch {
            // Migration failure is non-fatal — user keeps studying
          } finally {
            // Always clear obsolete auth-related localStorage keys
            localStorage.removeItem("hsk_is_paid");
            localStorage.removeItem("hsk_email");
          }

          subscription.unsubscribe();
          setLocation("/levels");
        }
      }
    );

    // Fallback: if already signed in when this page loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !handled.current) {
        subscription.unsubscribe();
        setLocation("/levels");
      }
    });

    return () => subscription.unsubscribe();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  );
}
