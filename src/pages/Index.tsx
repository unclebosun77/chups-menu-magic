import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import SkeletonCard from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";
import HeroSection from "@/components/home/HeroSection";
import SmartActionPills from "@/components/home/SmartActionPills";
import UniversalRestaurantCard from "@/components/home/UniversalRestaurantCard";
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
      <div className="space-y-8 p-5 pb-24">
        {/* Dev: Quick Onboarding Access */}
        {restaurants.length === 0 && !isLoading && (
          <div className="bg-secondary/30 border border-border rounded-xl p-4">
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
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <span className="text-purple">✨</span> Outa suggests
          </p>
          <SmartActionPills />
        </div>

        {/* Discover Section */}
        <div className="pt-4">
          <div className="mb-2">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              🥢 Discover
            </h2>
            <p className="text-xs text-muted-foreground/70">Trending around you</p>
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
        <div className="pt-4">
          <YourNextSpotSection />
        </div>

        {/* Explore Dishes Section */}
        <div className="pt-4">
          <ExploreDishesSection />
        </div>
      </div>
    </div>
  );
};

export default Index;
