import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import MarketingPage from "@/pages/MarketingPage";
import LandingPage from "@/pages/LandingPage";
import LevelSelection from "@/pages/LevelSelection";
import FlashcardPage from "@/pages/FlashcardPage";
import ReviewPage from "@/pages/ReviewPage";
import QuizPage from "@/pages/QuizPage";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={MarketingPage} />
      <Route path="/app" component={LandingPage} />
      <Route path="/levels" component={LevelSelection} />
      <Route path="/flashcards/:level" component={FlashcardPage} />
      <Route path="/quiz/:level" component={QuizPage} />
      <Route path="/review" component={ReviewPage} />
      <Route component={NotFound} />
    </Switch>
  );
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
