
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Landlords from "./pages/Landlords";
import About from "./pages/About";
import Auth from "./pages/Auth";
import HostelDetail from "./pages/HostelDetail";
import StudentDashboard from "./pages/StudentDashboard";
import LandlordDashboard from "./pages/LandlordDashboard";
import Messages from "./pages/Messages";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import NotFound from "./pages/NotFound";
import PersonalityQuiz from "./pages/PersonalityQuiz";
import BuddySystem from "./pages/BuddySystem";
import HorrorStories from "./pages/HorrorStories";
import AdminAnalyticsPage from "./pages/AdminAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/dashboard" element={
              <ProtectedRoute requireAuth={true}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/landlord-dashboard" element={
              <ProtectedRoute requireAuth={true}>
                <LandlordDashboard />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute requireAuth={true}>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/hostel/:id" element={<HostelDetail />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />
            <Route path="/landlords" element={<Landlords />} />
            <Route path="/about" element={<About />} />
            <Route path="/personality-quiz" element={<PersonalityQuiz />} />
            <Route path="/buddy-system" element={
              <ProtectedRoute requireAuth={true}>
                <BuddySystem />
              </ProtectedRoute>
            } />
            <Route path="/horror-stories" element={<HorrorStories />} />
            <Route path="/admin-analytics" element={
              <ProtectedRoute requireAuth={true}>
                <AdminAnalyticsPage />
              </ProtectedRoute>
            } />
            <Route path="/auth" element={
              <ProtectedRoute requireAuth={false}>
                <Auth />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
