import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Activity from "./pages/Activity";
import Account from "./pages/Account";
import Auth from "./pages/Auth";
import RestaurantOnboarding from "./pages/RestaurantOnboarding";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import RestaurantMenu from "./pages/RestaurantMenu";
import Discover from "./pages/Discover";
import AIAssistant from "./pages/AIAssistant";
import MyOrders from "./pages/MyOrders";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
          <Route path="/discover" element={<Discover />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/restaurant/onboarding" element={<RestaurantOnboarding />} />
          <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
          <Route path="/restaurant/:restaurantId" element={<RestaurantMenu />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
