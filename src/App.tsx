
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
import EmailConfirmation from "./pages/EmailConfirmation";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import ListProperty from "./pages/ListProperty";
import AdvancedListProperty from "./pages/AdvancedListProperty";
import AdvancedSearch from "./pages/AdvancedSearch";
import DebugSearch from "./pages/DebugSearch";
import FindHostels from "./pages/FindHostels";
import PriceAlerts from "./pages/PriceAlerts";
import HostelDetailNew from "./pages/HostelDetailNew";
import Support from "./pages/Support";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import LandlordRoute from "./components/LandlordRoute";
import ListPropertyGateway from "./pages/ListPropertyGateway";
import MyProperties from "./pages/MyProperties";
import RoomChat from "./pages/RoomChat";

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
            <Route path="/find-hostels" element={<Search />} />
            <Route path="/advanced-search" element={<AdvancedSearch />} />
            <Route path="/new-find-hostels" element={<FindHostels />} />
            <Route path="/debug-search" element={<DebugSearch />} />
            <Route path="/dashboard" element={
              <ProtectedRoute requireAuth={true}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student-dashboard" element={
              <ProtectedRoute requireAuth={true}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/landlord-dashboard" element={
              <LandlordRoute fallbackPath="/auth">
                <LandlordDashboard />
              </LandlordRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute requireAuth={true}>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/hostel-old/:id" element={<HostelDetail />} />
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
            <Route path="/room-chat/:roomId" element={
              <ProtectedRoute requireAuth={true}>
                <RoomChat />
              </ProtectedRoute>
            } />
            <Route path="/horror-stories" element={<HorrorStories />} />
            <Route path="/admin-analytics" element={
              <ProtectedRoute requireAuth={true}>
                <AdminAnalyticsPage />
              </ProtectedRoute>
            } />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/support" element={<Support />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/list-property" element={<ListPropertyGateway />} />
            <Route path="/list-property-simple" element={<ListProperty />} />
            <Route path="/list-property-advanced" element={<AdvancedListProperty />} />
            <Route path="/my-properties" element={
              <LandlordRoute fallbackPath="/list-property">
                <MyProperties />
              </LandlordRoute>
            } />
            <Route path="/price-alerts" element={<PriceAlerts />} />
            <Route path="/hostel/:id" element={<HostelDetailNew />} />
            <Route path="/auth" element={
              <ProtectedRoute requireAuth={false}>
                <Auth />
              </ProtectedRoute>
            } />
            {/* Hidden Admin Route - Not linked in navbar/footer */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
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
