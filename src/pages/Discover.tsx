import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTasteProfile } from "@/context/TasteProfileContext";
import TasteProfileDialog from "@/components/taste-profile/TasteProfileDialog";
import SkeletonCard from "@/components/SkeletonCard";
import UniversalRestaurantCard from "@/components/restaurant/UniversalRestaurantCard";

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

const Discover = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, isComplete } = useTasteProfile();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showTasteDialog, setShowTasteDialog] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [searchQuery, cuisineFilter, statusFilter, restaurants]);

  const loadRestaurants = async () => {
    try {
      const { data: restaurantsData, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch reviews for each restaurant
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
        let score = 0;
        
        // Cuisine match
        if (profile.cuisines.includes(r.cuisine_type)) {
          score += 3;
        }
        
        // Boost for open restaurants
        if (r.is_open) {
          score += 1;
        }
        
        return { ...r, matchScore: score };
      });
      
      // Sort by match score descending
      filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    // Search filter - search across multiple fields
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.cuisine_type.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          r.city?.toLowerCase().includes(query) ||
          r.address?.toLowerCase().includes(query)
      );
    }

    // Cuisine filter
    if (cuisineFilter !== "all") {
      filtered = filtered.filter((r) => r.cuisine_type === cuisineFilter);
    }

    // Status filter
    if (statusFilter === "open") {
      filtered = filtered.filter((r) => r.is_open);
    } else if (statusFilter === "closed") {
      filtered = filtered.filter((r) => !r.is_open);
    }

    setFilteredRestaurants(filtered);
  };

  const cuisineTypes = Array.from(new Set(restaurants.map((r) => r.cuisine_type)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Discover Restaurants</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant={isComplete ? "outline" : "default"} 
                size="sm"
                onClick={() => setShowTasteDialog(true)}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                {isComplete ? "Taste profile active" : "Set your taste"}
              </Button>
              <Button variant="ghost" onClick={() => navigate("/")}>
                Home
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, cuisine, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="flex gap-3 mt-4 flex-wrap">
              <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Cuisines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cuisines</SelectItem>
                  {cuisineTypes.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open Now</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Restaurant Grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} type="grid" />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No restaurants found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <UniversalRestaurantCard
                key={restaurant.id}
                restaurant={{
                  id: restaurant.id,
                  name: restaurant.name,
                  cuisine: restaurant.cuisine_type,
                  description: restaurant.description || undefined,
                  address: restaurant.address || undefined,
                  logoUrl: restaurant.logo_url || undefined,
                  isOpen: restaurant.is_open,
                  rating: restaurant.average_rating,
                  matchScore: restaurant.matchScore ? Math.min(restaurant.matchScore * 20 + 70, 95) : undefined,
                }}
                showPersonalization={isComplete}
              />
            ))}
          </div>
        )}
      </div>

      <TasteProfileDialog open={showTasteDialog} onOpenChange={setShowTasteDialog} />
    </div>
  );
};

export default Discover;