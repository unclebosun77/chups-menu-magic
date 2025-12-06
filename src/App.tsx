import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TasteProfileProvider } from "@/context/TasteProfileContext";
import { UserBehaviorProvider } from "@/context/UserBehaviorContext";
import { SearchProvider } from "@/context/SearchContext";
import { LocationProvider } from "@/context/LocationContext";
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
      <TasteProfileProvider>
        <UserBehaviorProvider>
          <SearchProvider>
            <LocationProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Main app routes with bottom nav */}
                  <Route path="/" element={<Layout><Index /></Layout>} />
                  <Route path="/services" element={<Layout><Services /></Layout>} />
                  <Route path="/bookings" element={<MyBookings />} />
                  <Route path="/activity" element={<Layout><Activity /></Layout>} />
                  <Route path="/account" element={<Layout><Account /></Layout>} />
                  
                  {/* Full screen routes without bottom nav */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/catering" element={<Catering />} />
                  <Route path="/rewards" element={<Rewards />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/ai-assistant" element={<AIAssistant />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/order-summary" element={<OrderSummary />} />
                  <Route path="/ai-chat" element={<AIOrderChat />} />
                  <Route path="/outa-intelligence" element={<OutaIntelligence />} />
                  <Route path="/curated-experiences" element={<CuratedExperiences />} />
                  
                  {/* Restaurant Onboarding Pro Suite */}
                  <Route path="/restaurant/onboarding" element={<OnboardingHome />} />
                  <Route path="/restaurant/onboarding/branding" element={<BrandingStep />} />
                  <Route path="/restaurant/onboarding/details" element={<RestaurantDetailsForm />} />
                  <Route path="/restaurant/onboarding/menu" element={<MenuCategoryList />} />
                  <Route path="/restaurant/onboarding/menu/:categoryId" element={<MenuItemEditor />} />
                  <Route path="/restaurant/onboarding/gallery" element={<GalleryUploader />} />
                  <Route path="/restaurant/onboarding/hours" element={<OpeningHoursEditor />} />
                  <Route path="/restaurant/onboarding/review" element={<ReviewAndSubmit />} />
                  
                  <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
                  <Route path="/restaurant/:restaurantId" element={<RestaurantProfile />} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </LocationProvider>
          </SearchProvider>
        </UserBehaviorProvider>
      </TasteProfileProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
