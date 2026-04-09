import { useState, useEffect, useMemo } from "react";
import { isRestaurantOpen } from "@/utils/openingHours";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Star, Clock, X, TrendingUp, Navigation, Utensils, Coffee, Flame, DollarSign, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "@/context/LocationContext";
import PremiumRestaurantCard from "@/components/home/PremiumRestaurantCard";
import RegionFilter from "@/components/RegionFilter";
import { enrichWithLocation } from "@/utils/mockLocations";

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
  latitude?: number;
  longitude?: number;
  region?: string;
  distanceText?: string;
};

// Cuisine alias mapping for broader matching
const cuisineAliases: Record<string, string[]> = {
  "afro-caribbean": ["african", "west african", "caribbean", "nigerian", "ghanaian", "jamaican"],
  "italian": ["italian", "modern italian", "pizza", "pasta"],
  "japanese": ["japanese", "sushi", "ramen", "izakaya"],
  "thai": ["thai"],
  "chinese": ["chinese", "dim sum", "cantonese", "szechuan"],
  "indian": ["indian", "curry", "tandoori", "south indian"],
  "american": ["american", "burger", "bbq", "barbecue", "diner"],
  "mediterranean": ["mediterranean", "greek", "turkish", "lebanese", "middle eastern"],
};

const matchesCuisineFilter = (cuisineType: string, filter: string): boolean => {
  const normalizedType = cuisineType.toLowerCase();
  const normalizedFilter = filter.toLowerCase();

  // Direct partial match
  if (normalizedType.includes(normalizedFilter) || normalizedFilter.includes(normalizedType)) {
    return true;
  }

  // Check aliases
  const aliases = cuisineAliases[normalizedFilter] || [];
  return aliases.some(alias => normalizedType.includes(alias) || alias.includes(normalizedType));
};

// Shuffle array (Fisher-Yates)
const shuffleArray = <T,>(arr: T[]): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const filterChips = [
  { id: "all", label: "All", icon: Utensils },
  { id: "open", label: "Open Now", icon: Clock },
  { id: "nearby", label: "Near Me", icon: Navigation },
  { id: "top-rated", label: "Top Rated", icon: Star },
  { id: "trending", label: "Trending", icon: TrendingUp },
];

const cuisineDisplayNames: Record<string, string> = {
  "afro-caribbean": "Afro-Caribbean",
  "italian": "Italian",
  "japanese": "Japanese",
  "thai": "Thai",
  "chinese": "Chinese",
  "indian": "Indian",
  "american": "American",
  "mediterranean": "Mediterranean",
};

const Discover = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { userLocation, sortByDistance, filterByRegion, getDistanceText, currentRegion } = useLocation();
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeFilter, setActiveFilter] = useState(searchParams.get("open") === "true" ? "open" : "all");
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(searchParams.get("cuisine"));
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Determine if we're in "curated cuisine" mode
  const isCuisineMode = !!cuisineFilter;
  const cuisineDisplayName = cuisineFilter
    ? cuisineDisplayNames[cuisineFilter.toLowerCase()] || cuisineFilter
    : "";

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

  const filteredRestaurants = useMemo(() => {
    let filtered = [...restaurants];

    if (selectedRegion) {
      filtered = filterByRegion(filtered, selectedRegion);
    }

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

    if (activeFilter === "open") {
      filtered = filtered.filter((r) => isRestaurantOpen((r as any).hours, (r as any).is_temporarily_closed));
    } else if (activeFilter === "top-rated") {
      filtered = filtered.filter((r) => (r.average_rating || 0) >= 4);
      filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    } else if (activeFilter === "nearby") {
      filtered = sortByDistance(filtered);
    }

    // Cuisine filter — case-insensitive partial match with aliases
    if (cuisineFilter) {
      filtered = filtered.filter((r) => matchesCuisineFilter(r.cuisine_type, cuisineFilter));
    }

    // Shuffle in cuisine mode for fresh recommendations feel
    if (isCuisineMode) {
      filtered = shuffleArray(filtered);
    }

    return filtered;
  }, [restaurants, searchQuery, activeFilter, cuisineFilter, selectedRegion, userLocation, sortByDistance, filterByRegion, isCuisineMode]);

  const cuisineTypes = Array.from(new Set(restaurants.map((r) => r.cuisine_type)));

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

  // --- Curated Cuisine Mode ---
  if (isCuisineMode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/30 pb-24">
        {/* Curated header */}
        <div className="px-4 pt-6 pb-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </button>
          <h1 className="text-3xl font-bold text-foreground tracking-tight animate-slide-up">
            {cuisineDisplayName}
          </h1>
          <p className="text-sm text-muted-foreground/70 mt-1 animate-slide-up" style={{ animationDelay: '50ms' }}>
            Restaurants picked for you tonight
          </p>
        </div>

        {/* Restaurant grid */}
        <div className="px-4 py-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[220px] rounded-2xl bg-secondary/50 shimmer-loading" />
              ))}
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-16 animate-slide-up">
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-foreground font-medium mb-1">No {cuisineDisplayName} restaurants yet</p>
              <p className="text-sm text-muted-foreground/60">Check back soon — we're always adding more</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-purple"
                onClick={() => navigate("/")}
              >
                Back to home
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredRestaurants.map((restaurant, index) => (
                <div
                  key={restaurant.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${80 + index * 60}ms` }}
                >
                  <PremiumRestaurantCard
                    restaurant={restaurant}
                    variant="grid"
                    index={index}
                    hideMatchScore
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Default Explore Mode ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/30 pb-24">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="animate-slide-up">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Explore</h1>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                Browse restaurants by cuisine, vibe, or location
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="text-xs">{currentRegion}</span>
            </div>
          </div>

          <div className="relative animate-slide-up" style={{ animationDelay: '100ms' }}>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Search by name, cuisine, or area..."
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

          <div className="mt-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <RegionFilter
              selectedRegion={selectedRegion || "All"}
              onRegionChange={setSelectedRegion}
              showCounts
              counts={regionCounts}
            />
          </div>

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

      <div className="px-4 py-6">
        {!isLoading && filteredRestaurants.length > 0 && (
          <div className="mb-4 animate-slide-up">
            <p className="text-sm text-muted-foreground">
              {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'}
              {selectedRegion && selectedRegion !== 'All' ? ` in ${selectedRegion}` : ''}
            </p>
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
              <Utensils className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-foreground font-medium mb-1">No restaurants found</p>
            <p className="text-sm text-muted-foreground/60">
              {selectedRegion ? `No spots in ${selectedRegion} yet` : 'Try adjusting your filters'}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-purple"
              onClick={() => {
                setActiveFilter("all");
                setCuisineFilter(null);
                setSelectedRegion(null);
                setSearchQuery("");
              }}
            >
              Clear all filters
            </Button>
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
                  hideMatchScore
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
