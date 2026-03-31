import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import MarketingPage  from "@/pages/MarketingPage";
import LandingPage    from "@/pages/LandingPage";
import LevelSelection from "@/pages/LevelSelection";
import FlashcardPage  from "@/pages/FlashcardPage";
import ReviewPage     from "@/pages/ReviewPage";
import QuizPage       from "@/pages/QuizPage";
import PhrasesPage    from "@/pages/PhrasesPage";
import StrokesPage    from "@/pages/StrokesPage";
import ProgressPage   from "@/pages/ProgressPage";
import SettingsPage   from "@/pages/SettingsPage";
import { AppShell }   from "@/components/AppShell";

const queryClient = new QueryClient();

// Pages wrapped in the sidebar shell
function AppPages() {
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

// Top-level router: decides whether to show the sidebar shell
function Router() {
  const [location] = useLocation();
  const isPublicRoute = location === "/" || location === "/app";

  if (isPublicRoute) {
    return (
      <Switch>
        <Route path="/"    component={MarketingPage} />
        <Route path="/app" component={LandingPage} />
      </Switch>
    );
  }

  return <AppPages />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
