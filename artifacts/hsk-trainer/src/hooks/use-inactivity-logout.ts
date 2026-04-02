import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

const TIMEOUT_MS = 10 * 60 * 1000;    // 10 minutes
const WARNING_MS = 9 * 60 * 1000;     // warn at 9 minutes

const EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"] as const;

export function useInactivityLogout() {
  const { signOut } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const logoutTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warned       = useRef(false);

  const clearTimers = useCallback(() => {
    if (logoutTimer.current)  clearTimeout(logoutTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
  }, []);

  const resetTimers = useCallback(() => {
    clearTimers();
    warned.current = false;

    warningTimer.current = setTimeout(() => {
      if (!warned.current) {
        warned.current = true;
        toast({
          title: "Still there?",
          description: "You will be signed out in 1 minute due to inactivity.",
          duration: 55_000,
        });
      }
    }, WARNING_MS);

    logoutTimer.current = setTimeout(async () => {
      await signOut();
      navigate("/app");
    }, TIMEOUT_MS);
  }, [clearTimers, signOut, navigate, toast]);

  useEffect(() => {
    resetTimers();

    const handleActivity = () => resetTimers();
    EVENTS.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));

    return () => {
      clearTimers();
      EVENTS.forEach((e) => window.removeEventListener(e, handleActivity));
    };
  }, [resetTimers, clearTimers]);
}
