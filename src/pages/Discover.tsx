import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Search, Sparkles, MapPin, Star, Utensils, Clock, DollarSign, Heart, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTasteProfile } from "@/context/TasteProfileContext";
import SkeletonCard from "@/components/SkeletonCard";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import FilterPill from "@/components/discover/FilterPill";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";

type Restaurant = {
  id: string;
  name: string;
  cuisine_type: string;
  description: string | null;
  logo_url: string | null;
  is_open: boolean;
  address: string | null;
  city: string | null;
  average_rating?: number;
};

type FilterType = "near" | "rating" | "price-1" | "price-2" | "price-3" | "open" | "date-night" | "cozy" | "trendy" | "group" | string;

const Discover = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useTasteProfile();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set());

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
            : 4.5;

          return { ...restaurant, average_rating: avgRating };
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

  const toggleFilter = (filter: FilterType) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(filter)) {
        newFilters.delete(filter);
      } else {
        newFilters.add(filter);
      }
      return newFilters;
    });
  };

  // Filter restaurants based on active filters
  const filteredRestaurants = useMemo(() => {
    let filtered = [...restaurants];

    if (activeFilters.has("rating")) {
      filtered = filtered.filter(r => (r.average_rating || 0) >= 4.5);
    }
    if (activeFilters.has("open")) {
      filtered = filtered.filter(r => r.is_open);
    }
    if (activeFilters.has("price-1")) {
      // Mock: show all for demo
    }

    return filtered;
  }, [restaurants, activeFilters]);

  // Intelligence picks - combine demo restaurants with any high-rated ones
  const intelligencePicks = useMemo(() => {
    return personalizedRestaurants.slice(0, 3).map(r => ({
      id: r.id,
      name: r.name,
      rating: r.rating,
      cuisine: r.cuisine,
      price_level: r.priceLevel,
      description: r.description,
      images: [r.imageUrl],
    }));
  }, []);

  // Transform restaurants for RestaurantCard
  const transformRestaurant = (r: Restaurant) => ({
    id: r.id,
    name: r.name,
    rating: r.average_rating || 4.5,
    cuisine: r.cuisine_type,
    price_level: "££",
    description: r.description,
    images: r.logo_url ? [r.logo_url] : [],
  });

  const filters = [
    { id: "near", label: "Near Me", icon: <MapPin className="h-3.5 w-3.5" /> },
    { id: "rating", label: "4.5+", icon: <Star className="h-3.5 w-3.5" /> },
    { id: "open", label: "Open Now", icon: <Clock className="h-3.5 w-3.5" /> },
    { id: "price-1", label: "£", icon: null },
    { id: "price-2", label: "££", icon: null },
    { id: "price-3", label: "£££", icon: null },
    { id: "date-night", label: "Date Night", icon: <Heart className="h-3.5 w-3.5" /> },
    { id: "cozy", label: "Cozy", icon: null },
    { id: "trendy", label: "Trendy", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: "group", label: "Group Friendly", icon: <Users className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-purple/5 pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Discover</h1>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </button>
        </div>
        <p className="text-sm text-muted-foreground/70">Find the perfect spot for any plan</p>

        {/* Search Shortcut */}
        <button
          onClick={() => navigate("/search")}
          className="w-full mt-4 flex items-center gap-3 px-4 py-3 bg-card border border-border/60 rounded-xl text-muted-foreground hover:border-purple/40 transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Search restaurants, cuisines, vibes...</span>
        </button>
      </div>

      {/* Filters Row */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {filters.map((filter) => (
            <FilterPill
              key={filter.id}
              label={filter.label}
              icon={filter.icon}
              isActive={activeFilters.has(filter.id)}
              onClick={() => toggleFilter(filter.id)}
            />
          ))}
        </div>
      </div>

      {/* Outa Intelligence Section */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-br from-purple/10 via-card to-purple/5 border border-purple/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-purple/20 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-purple" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Outa Intelligence</p>
              <p className="text-[11px] text-muted-foreground/70">Places you might like today</p>
            </div>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {intelligencePicks.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      </div>

      {/* Main Restaurant List */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">All Restaurants</h2>
          <span className="text-xs text-muted-foreground/60">
            {filteredRestaurants.length} spots
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} type="grid" />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border/40 rounded-2xl">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-secondary/50 flex items-center justify-center">
              <Utensils className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className="text-foreground font-medium mb-1">No matches found</p>
            <p className="text-sm text-muted-foreground/60">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="w-full">
                <RestaurantCard restaurant={transformRestaurant(restaurant)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
