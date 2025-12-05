import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import SkeletonCard from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";
import HeroSection from "@/components/home/HeroSection";
import SmartActionPills from "@/components/home/SmartActionPills";
import UniversalRestaurantCard from "@/components/restaurant/UniversalRestaurantCard";
import ExploreDishesSection from "@/components/home/ExploreDishesSection";
import YourNextSpotSection from "@/components/home/YourNextSpotSection";

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
      <div className="px-4 pb-28">
        {/* Dev: Quick Onboarding Access */}
        {restaurants.length === 0 && !isLoading && (
          <div className="bg-secondary/30 border border-border rounded-xl p-4 mt-4">
            <p className="text-sm text-foreground mb-2">👋 No spots yet!</p>
            <Button 
              onClick={() => navigate("/restaurant/onboarding")}
              className="w-full bg-purple text-primary-foreground hover:bg-purple-hover"
              size="sm"
            >
              <Rocket className="mr-2 h-4 w-4" />
              Add Your First Spot
            </Button>
          </div>
        )}

        {/* Hero Section */}
        <HeroSection />

        {/* AI Smart Actions */}
        <div className="mt-6">
          <p className="text-[11px] text-muted-foreground/60 mb-2 flex items-center gap-1 tracking-tight">
            <span className="text-purple/80">✨</span> Outa suggests
          </p>
          <SmartActionPills />
        </div>

        {/* Discover Section */}
        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2 tracking-tight">
              🥢 Discover
            </h2>
            <p className="text-[11px] text-muted-foreground/50 mt-1">Trending around you</p>
          </div>
          
          {isLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} type="vertical" className="flex-shrink-0 w-40" />
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
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {restaurants.map((restaurant) => (
                <UniversalRestaurantCard 
                  key={restaurant.id} 
                  restaurant={{
                    id: restaurant.id,
                    name: restaurant.name,
                    cuisine: restaurant.cuisine_type,
                    description: restaurant.description || undefined,
                    logoUrl: restaurant.logo_url || undefined,
                    isOpen: restaurant.is_open,
                  }}
                  size="compact"
                />
              ))}
            </div>
          )}
        </div>

        {/* Your Next Spot Section */}
        <div className="mt-8">
          <YourNextSpotSection />
        </div>

        {/* Explore Dishes Section */}
        <div className="mt-8">
          <ExploreDishesSection />
        </div>
      </div>
    </div>
  );
};

export default Index;
