import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Rocket, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import SkeletonCard from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";
import HeroSection from "@/components/home/HeroSection";
import SmartActionPills from "@/components/home/SmartActionPills";
import PremiumRestaurantCard from "@/components/home/PremiumRestaurantCard";
import ExploreDishesSection from "@/components/home/ExploreDishesSection";
import YourNextSpotSection from "@/components/home/YourNextSpotSection";
import NearbyRestaurantsRow from "@/components/NearbyRestaurantsRow";
import FloatingAIButton from "@/components/FloatingAIButton";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";
import { useLocation } from "@/context/LocationContext";

type Restaurant = {
  id: string;
  name: string;
  cuisine_type: string;
  description: string | null;
  logo_url: string | null;
  is_open: boolean;
  latitude: number | null;
  longitude: number | null;
};

const Index = () => {
  const navigate = useNavigate();
  const { currentRegion } = useLocation();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRestaurants = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("restaurants")
      .select("id, name, cuisine_type, description, logo_url, is_open, latitude, longitude")
      .order("created_at", { ascending: false })
      .limit(6);

    if (!error && data) {
      setRestaurants(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  const handleRefresh = useCallback(async () => {
    await loadRestaurants();
    await new Promise(resolve => setTimeout(resolve, 300));
  }, [loadRestaurants]);

  const { pullDistance, isRefreshing, handlers } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  return (
    <div 
      className="relative min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/30" 
      {...handlers}
    >
      <PullToRefreshIndicator 
        pullDistance={pullDistance} 
        isRefreshing={isRefreshing} 
      />
      
      {/* Main Content with Premium Animations */}
      <div 
        className="px-4 pb-28 transition-transform duration-100"
        style={{ transform: pullDistance > 0 ? `translateY(${pullDistance * 0.3}px)` : undefined }}
      >
        {/* Empty State with Premium Styling */}
        {restaurants.length === 0 && !isLoading && (
          <div className="bg-gradient-to-br from-purple/5 to-neon-pink/5 border border-purple/20 rounded-2xl p-5 mt-4 shadow-premium animate-slide-up">
            <p className="text-sm text-foreground mb-3 font-medium">👋 No spots yet!</p>
            <Button 
              onClick={() => navigate("/restaurant/onboarding")}
              className="w-full bg-gradient-neon text-primary-foreground hover:opacity-90 rounded-xl h-11 shadow-glow transition-all duration-300 active:scale-[0.97]"
              size="sm"
            >
              <Rocket className="mr-2 h-4 w-4" />
              Add Your First Spot
            </Button>
          </div>
        )}

        {/* Hero Section - Premium Entrance */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <HeroSection />
        </div>

        {/* AI Smart Actions - Staggered Reveal */}
        <section className="mt-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple/15 to-neon-pink/10 flex items-center justify-center shadow-sm border border-purple/10">
              <Sparkles className="h-3.5 w-3.5 text-purple animate-glow-pulse" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground tracking-tight">Outa suggests</p>
              <p className="text-[10px] text-muted-foreground/60">Personalized for you</p>
            </div>
          </div>
          <SmartActionPills />
        </section>

        {/* Nearby Restaurants Section - NEW */}
        <section className="mt-10 animate-slide-up" style={{ animationDelay: '250ms' }}>
          <NearbyRestaurantsRow restaurants={restaurants} />
        </section>

        {/* Discover Section - Premium Cards */}
        <section className="mt-10 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple/10 to-purple/5 flex items-center justify-center border border-purple/10">
                <TrendingUp className="h-4 w-4 text-purple" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground tracking-tight">Discover</h2>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">Trending in {currentRegion}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-purple hover:text-purple-hover hover:bg-purple/5 rounded-full px-3"
              onClick={() => navigate('/discover')}
            >
              See all
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-[160px] h-[180px] rounded-2xl bg-secondary/50 shimmer-loading" />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="animate-slide-up">
              <EmptyState
                icon={MapPin}
                title="Mapping your vibe zone 🗺️"
                description="Hang tight while we scout amazing spots near you!"
                compact
              />
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
              {restaurants.map((restaurant, index) => (
                <div
                  key={restaurant.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${400 + index * 100}ms` }}
                >
                  <PremiumRestaurantCard restaurant={restaurant} variant="compact" index={index} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Your Next Spot Section */}
        <section className="mt-12 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <YourNextSpotSection />
        </section>

        {/* Explore Dishes Section */}
        <section className="mt-12 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <ExploreDishesSection />
        </section>
      </div>

      {/* Floating AI Chat Button */}
      <FloatingAIButton />
    </div>
  );
};

export default Index;