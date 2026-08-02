import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SelectDates from "./pages/SelectDates";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const pages: Record<string, ReactNode> = {
  "/": <Index />,
  "/login": <Login />,
  "/select-dates": <SelectDates />,
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {pages[window.location.pathname] ?? <NotFound />}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
