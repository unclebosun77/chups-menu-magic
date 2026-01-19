import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TasteProfileProvider } from "@/context/TasteProfileContext";
import { UserBehaviorProvider } from "@/context/UserBehaviorContext";
import { SearchProvider } from "@/context/SearchContext";
import { LocationProvider } from "@/context/LocationContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Catering from "./pages/Catering";
import Rewards from "./pages/Rewards";
import Activity from "./pages/Activity";
import Account from "./pages/Account";
import Auth from "./pages/Auth";
import RestaurantOnboarding from "./pages/RestaurantOnboarding";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import RestaurantProfile from "./pages/RestaurantProfile";
import Discover from "./pages/Discover";
import AIAssistant from "./pages/AIAssistant";
import MyOrders from "./pages/MyOrders";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";
import OrderSuccess from "./pages/OrderSuccess";
import OrderSummary from "./pages/OrderSummary";
import AIOrderChat from "./pages/AIOrderChat";
import OutaIntelligence from "./pages/OutaIntelligence";
import CuratedExperiences from "./pages/CuratedExperiences";
import OutaChat from "./pages/OutaChat";
import OnboardingHome from "./pages/onboarding/OnboardingHome";
import BrandingStep from "./pages/onboarding/BrandingStep";
import RestaurantDetailsForm from "./pages/onboarding/RestaurantDetailsForm";
import MenuCategoryList from "./pages/onboarding/MenuCategoryList";
import MenuItemEditor from "./pages/onboarding/MenuItemEditor";
import GalleryUploader from "./pages/onboarding/GalleryUploader";
import OpeningHoursEditor from "./pages/onboarding/OpeningHoursEditor";
import ReviewAndSubmit from "./pages/onboarding/ReviewAndSubmit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <TasteProfileProvider>
          <UserBehaviorProvider>
            <SearchProvider>
              <LocationProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Layout><Index /></Layout>} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/discover" element={<Discover />} />
                    <Route path="/restaurant/:restaurantId" element={<RestaurantProfile />} />
                    
                    {/* Main app routes with bottom nav */}
                    <Route path="/services" element={<Layout><Services /></Layout>} />
                    <Route path="/activity" element={<Layout><Activity /></Layout>} />
                    <Route path="/account" element={<Layout><Account /></Layout>} />
                    
                    {/* Protected routes - require authentication */}
                    <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                    <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                    <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
                    <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                    <Route path="/order-summary" element={<ProtectedRoute><OrderSummary /></ProtectedRoute>} />
                    
                    {/* Full screen routes without bottom nav */}
                    <Route path="/catering" element={<Catering />} />
                    <Route path="/ai-assistant" element={<AIAssistant />} />
                    <Route path="/ai-chat" element={<AIOrderChat />} />
                    <Route path="/outa-intelligence" element={<OutaIntelligence />} />
                    <Route path="/curated-experiences" element={<CuratedExperiences />} />
                    <Route path="/chat" element={<OutaChat />} />
                    
                    {/* Restaurant Onboarding Pro Suite - Protected */}
                    <Route path="/restaurant/onboarding" element={<ProtectedRoute><OnboardingHome /></ProtectedRoute>} />
                    <Route path="/restaurant/onboarding/branding" element={<ProtectedRoute><BrandingStep /></ProtectedRoute>} />
                    <Route path="/restaurant/onboarding/details" element={<ProtectedRoute><RestaurantDetailsForm /></ProtectedRoute>} />
                    <Route path="/restaurant/onboarding/menu" element={<ProtectedRoute><MenuCategoryList /></ProtectedRoute>} />
                    <Route path="/restaurant/onboarding/menu/:categoryId" element={<ProtectedRoute><MenuItemEditor /></ProtectedRoute>} />
                    <Route path="/restaurant/onboarding/gallery" element={<ProtectedRoute><GalleryUploader /></ProtectedRoute>} />
                    <Route path="/restaurant/onboarding/hours" element={<ProtectedRoute><OpeningHoursEditor /></ProtectedRoute>} />
                    <Route path="/restaurant/onboarding/review" element={<ProtectedRoute><ReviewAndSubmit /></ProtectedRoute>} />
                    <Route path="/restaurant/dashboard" element={<ProtectedRoute><RestaurantDashboard /></ProtectedRoute>} />
                    
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </LocationProvider>
            </SearchProvider>
          </UserBehaviorProvider>
        </TasteProfileProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
