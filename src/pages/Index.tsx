import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Sparkles, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import SkeletonCard from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import HeroSection from "@/components/home/HeroSection";
import SmartActionPills from "@/components/home/SmartActionPills";
import UniversalRestaurantCard from "@/components/home/UniversalRestaurantCard";
import ExploreDishesSection from "@/components/home/ExploreDishesSection";

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
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRestaurants = async () => {
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
    };

    loadRestaurants();
  }, []);

  return (
    <div className="relative min-h-screen bg-background">
      <div className="space-y-6 p-5 pb-24">
        {/* Dev: Quick Onboarding Access */}
        {restaurants.length === 0 && !isLoading && (
          <div className="bg-purple/5 border border-purple/20 rounded-2xl p-4 shadow-soft">
            <p className="text-sm text-foreground mb-2">👋 No spots yet!</p>
            <Button 
              onClick={() => navigate("/restaurant/onboarding")}
              className="w-full bg-purple text-primary-foreground hover:bg-purple-hover shadow-soft"
              size="sm"
            >
              <Rocket className="mr-2 h-4 w-4" />
              Add Your First Spot
            </Button>
          </div>
        )}

        {/* Hero Section */}
        <HeroSection />

        {/* AI Smart Actions - Dual Row */}
        <div>
          <div className="mb-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-purple">✨</span> Outa suggests
            </p>
          </div>
          <SmartActionPills />
        </div>

        {/* Discover Section */}
        <div>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              🥢 Discover
            </h2>
            <p className="text-sm text-muted-foreground">Trending around you</p>
          </div>
          
          {isLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} type="vertical" className="flex-shrink-0 w-44" />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="Mapping your vibe zone 🗺️"
              description="Hang tight while we scout amazing spots near you!"
              compact
            />
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
              {restaurants.map((restaurant) => (
                <UniversalRestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>

        {/* Your Next Spot Section */}
        <div>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              🌙 Your Next Spot
            </h2>
            <p className="text-sm text-muted-foreground">Picked for you ✨</p>
          </div>
          
          {isLoading ? (
            <LoadingState message="Outa's got you... ✨" />
          ) : restaurants.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No vibes matched yet 😎"
              description="Check back soon or ask Outa for personalized picks!"
              compact
            />
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
              {restaurants.map((restaurant) => (
                <UniversalRestaurantCard 
                  key={restaurant.id} 
                  restaurant={restaurant} 
                  variant="personalized"
                />
              ))}
            </div>
          )}
        </div>

        {/* Explore Dishes Section */}
        <ExploreDishesSection />
      </div>
    </div>
  );
};

export default Index;
