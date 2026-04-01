import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import MarketingPage    from "@/pages/MarketingPage";
import LandingPage      from "@/pages/LandingPage";
import AuthCallback     from "@/pages/AuthCallback";
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

// ─── Route guard: redirects unauthenticated users to /app ───────────────────
function ProtectedPages() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/app");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <AppShell>
      <Switch>
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

// ─── Top-level router ────────────────────────────────────────────────────────
function Router() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect already-signed-in users away from the login page
  useEffect(() => {
    if (location === "/app" && user) {
      navigate("/levels");
    }
  }, [location, user, navigate]);

  const isPublicRoute =
    location === "/" || location === "/app" || location === "/auth/callback";

  if (isPublicRoute) {
    return (
      <Switch>
        <Route path="/"              component={MarketingPage} />
        <Route path="/app"           component={LandingPage} />
        <Route path="/auth/callback" component={AuthCallback} />
      </Switch>
    );
  }

  // Admin login — standalone, no AppShell, no guard (handles its own auth)
  if (location.startsWith("/admin/login")) {
    return <AdminLoginPage />;
  }

  // All other /admin/* routes — AdminPage handles sub-routing internally
  if (location.startsWith("/admin")) {
    return <AdminPage />;
  }

  return <ProtectedPages />;
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
