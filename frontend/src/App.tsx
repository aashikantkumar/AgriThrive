import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";
import SchemeNavigator from "./pages/SchemeNavigator";
import LegalToolkit from "./pages/LegalToolkit";
import MarketPrice from "./pages/MarketPrice";
import CropDiagnosis from "./pages/CropDiagnosis";
import KnowledgeBase from "./pages/KnowledgeBase";
import Chatbot from "./pages/Chatbot";
import Feedback from "./pages/Feedback";
import NotFound from "./pages/NotFound";

// Create a client with proper caching configuration to prevent refetching on tab switch
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh
      gcTime: 1000 * 60 * 60 * 24, // 24 hours cache retention
      refetchOnWindowFocus: false, // DON'T refetch when tab regains focus
      refetchOnReconnect: false, // DON'T refetch on internet reconnect
      refetchOnMount: false, // DON'T refetch when component mounts if data exists
      retry: 1, // Only retry once on failure
    },
  },
});

// Persist the React Query cache to localStorage
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'agrithrive-query-cache',
});

// Setup persistence - cached API data survives page refreshes
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours max age for persisted cache
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Profile Route - Don't require profile to access profile page */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute requireProfile={false}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Require complete profile */}
            <Route
              path="/schemes"
              element={
                <ProtectedRoute>
                  <SchemeNavigator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/legal"
              element={
                <ProtectedRoute>
                  <LegalToolkit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/market-price"
              element={
                <ProtectedRoute>
                  <MarketPrice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crop-diagnosis"
              element={
                <ProtectedRoute>
                  <CropDiagnosis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/knowledge-base"
              element={
                <ProtectedRoute>
                  <KnowledgeBase />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;