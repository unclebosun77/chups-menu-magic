import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Clock, Filter, User, Sparkles, X, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTasteProfile } from "@/context/TasteProfileContext";
import TasteProfileDialog from "@/components/taste-profile/TasteProfileDialog";
import PremiumRestaurantCard from "@/components/home/PremiumRestaurantCard";

type Restaurant = {
  id: string;
  name: string;
  cuisine_type: string;
  description: string | null;
  logo_url: string | null;
  is_open: boolean;
  address: string | null;
  city: string | null;
  primary_color: string;
  average_rating?: number;
  review_count?: number;
  matchScore?: number;
};

const filterChips = [
  { id: "all", label: "All", icon: null },
  { id: "open", label: "Open Now", icon: Clock },
  { id: "nearby", label: "Near Me", icon: MapPin },
  { id: "top-rated", label: "Top Rated", icon: Star },
  { id: "trending", label: "Trending", icon: TrendingUp },
];

const Discover = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, isComplete } = useTasteProfile();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTasteDialog, setShowTasteDialog] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [searchQuery, activeFilter, cuisineFilter, restaurants]);

  const loadRestaurants = async () => {
    try {
      const { data: restaurantsData, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const restaurantsWithRatings = await Promise.all(
        (restaurantsData || []).map(async (restaurant) => {
          const { data: reviews } = await supabase
            .from("reviews")
            .select("rating")
            .eq("restaurant_id", restaurant.id);

          const avgRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

          return {
            ...restaurant,
            average_rating: avgRating,
            review_count: reviews?.length || 0,
          };
        })
      );

      setRestaurants(restaurantsWithRatings);
    } catch (error: any) {
      toast({
        title: "Error loading restaurants",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = [...restaurants];

    // Calculate match scores if profile exists
    if (profile) {
      filtered = filtered.map((r) => {
        let score = 50; // Base score
        if (profile.cuisines.includes(r.cuisine_type)) score += 30;
        if (r.is_open) score += 10;
        if (r.average_rating && r.average_rating >= 4) score += 10;
        return { ...r, matchScore: Math.min(score, 100) };
      });
      filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.cuisine_type.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          r.city?.toLowerCase().includes(query)
      );
    }

    // Active filter
    if (activeFilter === "open") {
      filtered = filtered.filter((r) => r.is_open);
    } else if (activeFilter === "top-rated") {
      filtered = filtered.filter((r) => (r.average_rating || 0) >= 4);
      filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    }

    // Cuisine filter
    if (cuisineFilter) {
      filtered = filtered.filter((r) => r.cuisine_type === cuisineFilter);
    }

    setFilteredRestaurants(filtered);
  };

  const cuisineTypes = Array.from(new Set(restaurants.map((r) => r.cuisine_type)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/30 pb-24">
      {/* Premium Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="animate-slide-up">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Discover</h1>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Find your perfect spot</p>
            </div>
            <Button 
              variant={isComplete ? "outline" : "default"} 
              size="sm"
              onClick={() => setShowTasteDialog(true)}
              className={`gap-2 rounded-full ${isComplete ? 'border-purple/30 text-purple hover:bg-purple/5' : 'bg-gradient-neon shadow-glow'}`}
            >
              {isComplete ? <Sparkles className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              <span className="text-xs">{isComplete ? "Profile active" : "Set taste"}</span>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative animate-slide-up" style={{ animationDelay: '100ms' }}>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Search restaurants, cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-10 h-12 rounded-2xl border-border/50 bg-secondary/30 focus:bg-card focus:border-purple/30 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide -mx-4 px-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            {filterChips.map((chip, index) => {
              const Icon = chip.icon;
              const isActive = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setActiveFilter(chip.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all chip-animate ${
                    isActive 
                      ? 'bg-purple text-primary-foreground shadow-neon' 
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                  }`}
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Cuisine Chips */}
          {cuisineTypes.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide -mx-4 px-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
              {cuisineTypes.map((cuisine, index) => (
                <button
                  key={cuisine}
                  onClick={() => setCuisineFilter(cuisineFilter === cuisine ? null : cuisine)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all chip-animate ${
                    cuisineFilter === cuisine 
                      ? 'bg-purple/20 text-purple border border-purple/30' 
                      : 'bg-secondary/30 text-muted-foreground/70 hover:bg-secondary/50'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Restaurant Grid */}
      <div className="px-4 py-6">
        {/* AI Recommendation Banner */}
        {isComplete && filteredRestaurants.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-purple/10 to-neon-pink/5 border border-purple/20 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-neon flex items-center justify-center shadow-glow">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Outa's picks for you</p>
                <p className="text-xs text-muted-foreground/70">Based on your taste profile</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[220px] rounded-2xl bg-secondary/50 shimmer-loading" />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-16 animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-foreground font-medium mb-1">No restaurants found</p>
            <p className="text-sm text-muted-foreground/60">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredRestaurants.map((restaurant, index) => (
              <div 
                key={restaurant.id}
                className="animate-scale-in"
                style={{ animationDelay: `${100 + index * 50}ms` }}
              >
                <PremiumRestaurantCard 
                  restaurant={restaurant} 
                  variant="grid" 
                  index={index}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <TasteProfileDialog open={showTasteDialog} onOpenChange={setShowTasteDialog} />
    </div>
  );
};

export default Discover;
