import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { useOfflineSync } from "./hooks/useOfflineSync";
import { offlineStorage } from "./utils/offlineStorage";
import { useEffect } from "react";
import { PlatformRouter } from "./components/PlatformRouter";

const queryClient = new QueryClient();

const AppRoutes = () => {
  useOfflineSync(); // Enable offline sync

  // Initialize offline storage and cleanup on mount
  useEffect(() => {
    offlineStorage.init().then(() => {
      offlineStorage.cleanupExpiredData();
    });
  }, []);

  return (
    <>
      <OfflineIndicator />
      <PlatformRouter />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
