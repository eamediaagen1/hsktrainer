import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import MarketingPage    from "@/pages/MarketingPage";
import LandingPage      from "@/pages/LandingPage";
import AuthCallback     from "@/pages/AuthCallback";
import DemoPage         from "@/pages/DemoPage";
import DashboardPage    from "@/pages/DashboardPage";
import LevelSelection   from "@/pages/LevelSelection";
import FlashcardPage    from "@/pages/FlashcardPage";
import ReviewPage       from "@/pages/ReviewPage";
import QuizPage         from "@/pages/QuizPage";
import PhrasesPage      from "@/pages/PhrasesPage";
import StrokesPage      from "@/pages/StrokesPage";
import ProgressPage     from "@/pages/ProgressPage";
import SettingsPage     from "@/pages/SettingsPage";
import AdminPage        from "@/pages/AdminPage";
import AdminLoginPage   from "@/pages/AdminLoginPage";
import { AppShell }     from "@/components/AppShell";
import { AuthProvider, useAuth } from "@/contexts/auth-context";

const queryClient = new QueryClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Full-page loading spinner shown while auth state is resolving. */
function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/**
 * Renders a spinner and immediately navigates to `to`.
 * Using a spinner prevents any flash of the wrong page content while the
 * one-tick useEffect runs.
 */
function Redirect({ to }: { to: string }) {
  const [, navigate] = useLocation();
  useEffect(() => { navigate(to); }, [to, navigate]);
  return <FullPageSpinner />;
}

// ─── Top-level router ────────────────────────────────────────────────────────

/**
 * Centralised route → component mapping with explicit auth guards.
 *
 * Auth guard matrix (all synchronous after loading resolves):
 *   /              → always public (marketing)
 *   /demo          → always public
 *   /auth/callback → always public (handles token exchange)
 *   /app           → signed-in  → /dashboard   |  signed-out → LandingPage
 *   /admin/*       → AdminPage / AdminLoginPage handle their own auth
 *   everything else → signed-in → AppShell     |  signed-out → /app
 */
function Router() {
  const [location] = useLocation();
  const { user, loading } = useAuth();

  // ── 1. Auth callback — render immediately regardless of auth state ─────────
  if (location.startsWith("/auth/callback")) {
    return <AuthCallback />;
  }

  // ── 2. True public pages — no auth needed, always render instantly ─────────
  if (location === "/" || location === "/demo") {
    return (
      <Switch>
        <Route path="/"    component={MarketingPage} />
        <Route path="/demo" component={DemoPage} />
      </Switch>
    );
  }

  // ── 3. All remaining routes need auth state resolved first ─────────────────
  if (loading) return <FullPageSpinner />;

  // ── 4. Admin routes — AdminPage / AdminLoginPage manage their own auth ─────
  if (location.startsWith("/admin/login")) return <AdminLoginPage />;
  if (location.startsWith("/admin"))       return <AdminPage />;

  // ── 5. Login / landing page ───────────────────────────────────────────────
  if (location === "/app") {
    // Signed-in user visiting the login page → send to dashboard immediately
    if (user) return <Redirect to="/dashboard" />;
    return <LandingPage />;
  }

  // ── 6. All other routes are protected ────────────────────────────────────
  if (!user) return <Redirect to="/app" />;

  return (
    <AppShell>
      <Switch>
        <Route path="/dashboard"         component={DashboardPage} />
        <Route path="/levels"            component={LevelSelection} />
        <Route path="/flashcards/:level" component={FlashcardPage} />
        <Route path="/quiz/:level"       component={QuizPage} />
        <Route path="/review"            component={ReviewPage} />
        <Route path="/phrases"           component={PhrasesPage} />
        <Route path="/strokes"           component={StrokesPage} />
        <Route path="/progress"          component={ProgressPage} />
        <Route path="/settings"          component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
