import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, MapPin, Star, Sparkles, Trash2 } from "lucide-react";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { useToast } from "@/hooks/use-toast";
import { vibrate } from "@/utils/haptics";

type SavedRestaurant = {
  id: string;
  name: string;
  cuisine_type: string;
  address: string | null;
  city: string | null;
  logo_url: string | null;
  is_open: boolean;
};

const SavedRestaurants = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { savedRestaurants, unsaveRestaurant, isLoading: savesLoading } = useSavedRestaurants();
  const [restaurants, setRestaurants] = useState<SavedRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadRestaurants = async () => {
      if (savedRestaurants.length === 0) {
        setRestaurants([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, cuisine_type, address, city, logo_url, is_open")
        .in("id", savedRestaurants);

      if (!error && data) {
        setRestaurants(data);
      }
      setIsLoading(false);
    };

    if (!savesLoading) {
      loadRestaurants();
    }
  }, [user, savedRestaurants, savesLoading]);

  const handleUnsave = async (restaurantId: string, restaurantName: string) => {
    vibrate(20);
    const result = await unsaveRestaurant(restaurantId);
    if (!result.error) {
      setRestaurants((prev) => prev.filter((r) => r.id !== restaurantId));
      toast({ title: `Removed ${restaurantName} from favorites` });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 pb-24">
        <div className="px-4 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Saved</h1>
              <p className="text-xs text-muted-foreground">Your favorite spots</p>
            </div>
          </div>
        </div>

        <div className="px-4">
          <Card className="p-12 text-center glass-card animate-slide-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-foreground font-semibold mb-2">Sign in to view saved restaurants</p>
            <p className="text-sm text-muted-foreground mb-6">Save your favorite spots for quick access</p>
            <Button onClick={() => navigate("/auth")} className="bg-purple hover:bg-purple/90">
              Sign In
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading || savesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple/15 to-purple/25 flex items-center justify-center animate-pulse">
            <Sparkles className="h-5 w-5 text-purple" />
          </div>
          <p className="text-sm text-muted-foreground">Loading saved restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Saved Restaurants</h1>
              <p className="text-xs text-muted-foreground">{restaurants.length} favorites</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500/15 to-red-500/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant List */}
      <div className="px-4 py-4">
        {restaurants.length === 0 ? (
          <Card className="p-12 text-center glass-card animate-slide-up">
            <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">No saved restaurants yet</p>
            <p className="text-sm text-muted-foreground mb-4">Tap the heart on any restaurant to save it</p>
            <Button onClick={() => navigate("/discover")} variant="outline">
              Discover Restaurants
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {restaurants.map((restaurant, index) => (
              <Card
                key={restaurant.id}
                className="overflow-hidden glass-card hover:shadow-lg transition-all cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Logo */}
                    <div className="w-16 h-16 rounded-xl bg-secondary/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {restaurant.logo_url ? (
                        <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-muted-foreground">
                          {restaurant.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground truncate">{restaurant.name}</h3>
                          <p className="text-xs text-muted-foreground">{restaurant.cuisine_type}</p>
                        </div>
                        <Badge variant={restaurant.is_open ? "default" : "secondary"} className="text-[10px]">
                          {restaurant.is_open ? "Open" : "Closed"}
                        </Badge>
                      </div>

                      {restaurant.address && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{restaurant.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Unsave Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full text-red-500 hover:bg-red-500/10 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnsave(restaurant.id, restaurant.name);
                      }}
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedRestaurants;
