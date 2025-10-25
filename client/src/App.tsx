import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./lib/auth";
import LoginPage from "./pages/login";
import Dashboard from "./pages/dashboard";
import LandingPage from "./pages/landing";
import AIAssistant from "@/components/ai-assistant";

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/dashboard">
          {isAuthenticated ? <Dashboard /> : <LoginPage />}
        </Route>
        <Route component={LandingPage} />
      </Switch>
      {isAuthenticated && <AIAssistant />}
    </>
  );
}

function AppContent() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
