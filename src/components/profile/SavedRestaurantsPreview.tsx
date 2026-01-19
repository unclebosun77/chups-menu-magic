import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ChevronRight, Sparkles } from "lucide-react";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { cn } from "@/lib/utils";

type SavedRestaurantPreview = {
  id: string;
  name: string;
  cuisine_type: string;
  logo_url: string | null;
};

interface SavedRestaurantsPreviewProps {
  className?: string;
}

const SavedRestaurantsPreview = ({ className }: SavedRestaurantsPreviewProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedRestaurants, isLoading: savesLoading } = useSavedRestaurants();
  const [restaurants, setRestaurants] = useState<SavedRestaurantPreview[]>([]);
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

      // Only fetch top 3 for preview
      const previewIds = savedRestaurants.slice(0, 3);
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, cuisine_type, logo_url")
        .in("id", previewIds);

      if (!error && data) {
        setRestaurants(data);
      }
      setIsLoading(false);
    };

    if (!savesLoading) {
      loadRestaurants();
    }
  }, [user, savedRestaurants, savesLoading]);

  if (!user) {
    return (
      <Card className={cn("glass-card", className)}>
        <CardContent className="p-5 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center">
            <Heart className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Sign in to save your favorite spots
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/auth")}
            className="text-xs"
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || savesLoading) {
    return (
      <Card className={cn("glass-card", className)}>
        <CardContent className="p-5 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple animate-pulse" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("glass-card overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Saved Restaurants
          </CardTitle>
          {savedRestaurants.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/saved")}
              className="text-xs text-purple hover:text-purple/80 p-1 h-auto"
            >
              View All
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {restaurants.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">No saved restaurants yet</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/discover")}
              className="text-xs"
            >
              Discover Restaurants
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {restaurants.map((restaurant, index) => (
              <div
                key={restaurant.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              >
                <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {restaurant.logo_url ? (
                    <img 
                      src={restaurant.logo_url} 
                      alt={restaurant.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">
                      {restaurant.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{restaurant.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{restaurant.cuisine_type}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
              </div>
            ))}
            
            {savedRestaurants.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{savedRestaurants.length - 3} more saved
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedRestaurantsPreview;