import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Search, Star, Clock } from "lucide-react";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { useAuth } from "@/context/AuthContext";

type Restaurant = {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  cuisine_type: string;
  logo_url: string | null;
};

type RestaurantLocationSelectorProps = {
  onSelect: (restaurant: Restaurant) => void;
  onBack: () => void;
};

const RestaurantLocationSelector = ({ onSelect, onBack }: RestaurantLocationSelectorProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedRestaurants } = useSavedRestaurants();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, city, address, cuisine_type, logo_url")
        .eq("status", "live")
        .order("name");

      if (!error && data) {
        setRestaurants(data);
        
        // Get recently saved as "recently viewed" proxy
        if (savedRestaurants.length > 0) {
          const recent = data.filter(r => 
            savedRestaurants.slice(0, 3).includes(r.id)
          );
          setRecentlyViewed(recent);
        }
      }
    } catch (error) {
      console.error("Error loading restaurants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(r => {
    const query = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(query) ||
      r.city?.toLowerCase().includes(query) ||
      r.cuisine_type.toLowerCase().includes(query)
    );
  });

  const formatLocation = (restaurant: Restaurant) => {
    if (restaurant.city) {
      return `${restaurant.name} — ${restaurant.city}`;
    }
    return restaurant.name;
  };

  const RestaurantCard = ({ restaurant, isRecent = false }: { restaurant: Restaurant; isRecent?: boolean }) => (
    <button
      onClick={() => onSelect(restaurant)}
      className="w-full flex items-center gap-4 p-4 bg-card/50 border border-border/50 rounded-xl hover:bg-card/80 hover:border-primary/30 transition-all text-left group"
    >
      <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
        {restaurant.logo_url ? (
          <img 
            src={restaurant.logo_url} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-lg font-semibold text-muted-foreground">
            {restaurant.name.charAt(0)}
          </span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {formatLocation(restaurant)}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {restaurant.cuisine_type}
          {restaurant.address && ` • ${restaurant.address}`}
        </p>
      </div>

      {isRecent && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
          <Clock className="w-3 h-3" />
          <span>Recent</span>
        </div>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Select a Location</h1>
            <p className="text-sm text-muted-foreground">Choose where you dined</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border/50"
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* Recently Viewed / Saved */}
            {recentlyViewed.length > 0 && !searchQuery && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recently Saved
                </h2>
                <div className="space-y-2">
                  {recentlyViewed.map(restaurant => (
                    <RestaurantCard 
                      key={restaurant.id} 
                      restaurant={restaurant} 
                      isRecent 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Restaurants */}
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {searchQuery ? "Search Results" : "All Locations"}
              </h2>
              
              {filteredRestaurants.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No restaurants found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredRestaurants
                    .filter(r => !recentlyViewed.find(rv => rv.id === r.id) || searchQuery)
                    .map(restaurant => (
                      <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantLocationSelector;