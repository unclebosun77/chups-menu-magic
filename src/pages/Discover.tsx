import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Star, Clock, User, Sparkles, X, TrendingUp, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTasteProfile } from "@/context/TasteProfileContext";
import { useLocation } from "@/context/LocationContext";
import TasteProfileDialog from "@/components/taste-profile/TasteProfileDialog";
import PremiumRestaurantCard from "@/components/home/PremiumRestaurantCard";
import RegionFilter from "@/components/RegionFilter";
import { enrichWithLocation } from "@/utils/mockLocations";
import { rankNearbyOptions } from "@/utils/nearbyEngine";

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
  latitude?: number;
  longitude?: number;
  region?: string;
  distanceText?: string;
};

const filterChips = [
  { id: "all", label: "All", icon: null },
  { id: "open", label: "Open Now", icon: Clock },
  { id: "nearby", label: "Near Me", icon: Navigation },
  { id: "top-rated", label: "Top Rated", icon: Star },
  { id: "trending", label: "Trending", icon: TrendingUp },
];

const Discover = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { profile, isComplete } = useTasteProfile();
  const { userLocation, sortByDistance, filterByRegion, getDistanceText, currentRegion } = useLocation();
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeFilter, setActiveFilter] = useState(searchParams.get("open") === "true" ? "open" : "all");
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(searchParams.get("cuisine"));
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTasteDialog, setShowTasteDialog] = useState(false);

  // Sync URL params with state
  useEffect(() => {
    const q = searchParams.get("q");
    const cuisine = searchParams.get("cuisine");
    const open = searchParams.get("open");
    
    if (q) setSearchQuery(q);
    if (cuisine) setCuisineFilter(cuisine);
    if (open === "true") setActiveFilter("open");
  }, [searchParams]);

  useEffect(() => {
    loadRestaurants();
  }, []);

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

          // Enrich with location data
          const enriched = enrichWithLocation(restaurant);

          return {
            ...enriched,
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

  // Filter and sort restaurants
  const filteredRestaurants = useMemo(() => {
    let filtered = [...restaurants];

    // Apply region filter
    if (selectedRegion) {
      filtered = filterByRegion(filtered, selectedRegion);
    }

    // Calculate match scores using nearby engine for better ranking
    if (profile || activeFilter === "nearby") {
      const ranked = rankNearbyOptions(filtered, userLocation, profile, {
        tasteWeight: activeFilter === "nearby" ? 0.3 : 0.7,
        distanceWeight: activeFilter === "nearby" ? 0.7 : 0.3,
      });
      
      filtered = ranked.map(r => {
        const original = filtered.find(o => o.id === r.id);
        return {
          ...original!,
          matchScore: r.combinedScore,
          distanceText: r.distanceText,
        };
      });
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.cuisine_type.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          r.city?.toLowerCase().includes(query) ||
          r.region?.toLowerCase().includes(query)
      );
    }

    // Active filter
    if (activeFilter === "open") {
      filtered = filtered.filter((r) => r.is_open);
    } else if (activeFilter === "top-rated") {
      filtered = filtered.filter((r) => (r.average_rating || 0) >= 4);
      filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    } else if (activeFilter === "nearby") {
      filtered = sortByDistance(filtered);
    }

    // Cuisine filter
    if (cuisineFilter) {
      filtered = filtered.filter((r) => r.cuisine_type === cuisineFilter);
    }

    return filtered;
  }, [restaurants, searchQuery, activeFilter, cuisineFilter, selectedRegion, profile, userLocation, sortByDistance, filterByRegion]);

  const cuisineTypes = Array.from(new Set(restaurants.map((r) => r.cuisine_type)));

  // Count restaurants per region
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = { All: restaurants.length };
    restaurants.forEach(r => {
      const enriched = enrichWithLocation(r);
      if (enriched.region) {
        counts[enriched.region] = (counts[enriched.region] || 0) + 1;
      }
    });
    return counts;
  }, [restaurants]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/30 pb-24">
      {/* Premium Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="animate-slide-up">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Discover</h1>
              <p className="text-xs text-muted-foreground/70 mt-0.5 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {currentRegion}
              </p>
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
              placeholder="Search restaurants, cuisines, areas..."
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

          {/* Region Filter - NEW */}
          <div className="mt-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <RegionFilter
              selectedRegion={selectedRegion || "All"}
              onRegionChange={setSelectedRegion}
              showCounts
              counts={regionCounts}
            />
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide -mx-4 px-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
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
              {cuisineTypes.map((cuisine) => (
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
                <p className="text-xs text-muted-foreground/70">
                  {filteredRestaurants.length} spots {selectedRegion ? `in ${selectedRegion}` : `near ${currentRegion}`}
                </p>
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
            <p className="text-sm text-muted-foreground/60">
              {selectedRegion ? `No spots in ${selectedRegion} yet` : 'Try adjusting your filters'}
            </p>
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
