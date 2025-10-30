import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const queryClient = new QueryClient();

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