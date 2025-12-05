import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Search, Sparkles, MapPin, TrendingUp, Heart, Coffee, Flame, ChevronRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import SkeletonCard from "@/components/SkeletonCard";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import ExploreDishesSection from "@/components/home/ExploreDishesSection";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";

type Restaurant = {
  id: string;
  name: string;
  cuisine_type: string;
  description: string | null;
  logo_url: string | null;
  is_open: boolean;
};

const quickCategories = [
  { id: "near", label: "Near Me", icon: <MapPin className="h-4 w-4" />, filter: "near" },
  { id: "trending", label: "Trending", icon: <TrendingUp className="h-4 w-4" />, filter: "trending" },
  { id: "date", label: "Date Night", icon: <Heart className="h-4 w-4" />, filter: "date-night" },
  { id: "cozy", label: "Cozy Spots", icon: <Coffee className="h-4 w-4" />, filter: "cozy" },
  { id: "nigerian", label: "Nigerian", icon: <Flame className="h-4 w-4" />, filter: "nigerian" },
];

const Index = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRestaurants = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, cuisine_type, description, logo_url, is_open")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error && data) {
        setRestaurants(data);
      }
      setIsLoading(false);
    };

    loadRestaurants();
  }, []);

  // Transform personalized restaurants for Featured section
  const featuredRestaurants = personalizedRestaurants.slice(0, 3).map(r => ({
    id: r.id,
    name: r.name,
    rating: r.rating,
    cuisine: r.cuisine,
    price_level: r.priceLevel,
    description: r.description,
    images: [r.imageUrl],
  }));

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-purple/5">
      <div className="px-4 pb-28">
        
        {/* Header / Welcome Section */}
        <div className="pt-6 pb-2">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Find your next spot
            </h1>
            <div className="flex items-center gap-1 px-2 py-1 bg-purple/10 rounded-full">
              <Sparkles className="h-3 w-3 text-purple" />
              <span className="text-[10px] font-medium text-purple">Outa AI</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground/70">Powered by intelligence, made for you</p>
        </div>

        {/* Search Bar */}
        <button
          onClick={() => navigate("/discover")}
          className="w-full mt-4 flex items-center gap-3 px-4 py-3.5 bg-card border border-border/60 rounded-2xl text-muted-foreground hover:border-purple/40 hover:shadow-md transition-all"
        >
          <Search className="h-5 w-5 text-purple/60" />
          <span className="text-sm">Search restaurants, cuisines, vibes…</span>
        </button>

        {/* Ask Outa Card */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/ai-assistant")}
            className="w-full relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-purple/20 via-purple/10 to-card border border-purple/30 hover:border-purple/50 transition-all group"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple/10 via-transparent to-purple/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground mb-0.5">Not sure where to go?</p>
                <p className="text-sm text-muted-foreground/70">Ask Outa for a recommendation</p>
              </div>
              <ChevronRight className="h-5 w-5 text-purple/60 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Quick Categories */}
        <div className="mt-6">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {quickCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/discover?filter=${cat.filter}`)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-card border border-border/60 rounded-xl hover:border-purple/40 hover:bg-secondary/30 transition-all"
              >
                <span className="text-purple/70">{cat.icon}</span>
                <span className="text-sm font-medium text-foreground whitespace-nowrap">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured / Top Picks Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground tracking-tight">
                Top Picks For You
              </h2>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-purple/60" />
                Curated by Outa Intelligence
              </p>
            </div>
            <button 
              onClick={() => navigate("/discover")}
              className="text-xs text-purple font-medium hover:underline"
            >
              See all
            </button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {featuredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>

        {/* Your Next Spot Preview Card */}
        <div className="mt-8">
          <button
            onClick={() => navigate("/discover")}
            className="w-full p-4 bg-gradient-to-r from-card via-card to-purple/5 border border-border/60 rounded-2xl hover:border-purple/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-purple" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground text-sm">Your Next Spot is ready</p>
                <p className="text-xs text-muted-foreground/60">Tap to see personalized picks</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-purple group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </div>

        {/* Trending Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple" />
                Trending Now
              </h2>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">Popular in your area</p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} type="vertical" className="flex-shrink-0 w-48" />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="bg-card border border-border/40 rounded-2xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">No restaurants yet</p>
              <Button 
                onClick={() => navigate("/restaurant/onboarding")}
                className="bg-purple text-primary-foreground hover:bg-purple-hover"
                size="sm"
              >
                <Rocket className="mr-2 h-4 w-4" />
                Add Your Spot
              </Button>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {restaurants.map((restaurant) => (
                <RestaurantCard 
                  key={restaurant.id} 
                  restaurant={{
                    id: restaurant.id,
                    name: restaurant.name,
                    cuisine: restaurant.cuisine_type,
                    description: restaurant.description,
                    images: restaurant.logo_url ? [restaurant.logo_url] : [],
                  }} 
                />
              ))}
            </div>
          )}
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
