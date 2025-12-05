import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, MapPin, Star } from "lucide-react";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { vibrate } from "@/utils/haptics";
import QuickActionsSheet from "@/components/restaurant/QuickActionsSheet";

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

interface UniversalRestaurantCardProps {
  restaurant: Restaurant;
  variant?: "default" | "personalized";
}

const getCuisineTag = (cuisineType: string) => {
  if (cuisineType.toLowerCase().includes('afro') || cuisineType.toLowerCase().includes('nigerian')) {
    return 'Afro';
  }
  return cuisineType;
};

const UniversalRestaurantCard = ({ restaurant, variant = "default" }: UniversalRestaurantCardProps) => {
  const navigate = useNavigate();
  const { addRestaurantVisit } = useUserBehavior();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleClick = useCallback(() => {
    addRestaurantVisit({ 
      id: restaurant.id, 
      name: restaurant.name, 
      cuisine: restaurant.cuisine_type 
    });
    // Route to unified RestaurantProfile
    if (restaurant.id.includes("-demo")) {
      navigate(`/restaurant/demo/${restaurant.id}`);
    } else {
      navigate(`/restaurant/${restaurant.id}`);
    }
  }, [navigate, restaurant, addRestaurantVisit]);

  const handleLongPressStart = useCallback(() => {
    const timer = setTimeout(() => {
      vibrate(30);
      setShowQuickActions(true);
    }, 500);
    setLongPressTimer(timer);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  return (
    <>
      <Card
        className="flex-shrink-0 w-[140px] overflow-hidden hover:shadow-md transition-all cursor-pointer group bg-card rounded-2xl border border-border/50 shadow-sm active:scale-95"
        onClick={handleClick}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {restaurant.logo_url ? (
            <img
              src={restaurant.logo_url}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <ChefHat className="h-5 w-5 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          {/* Open indicator */}
          {restaurant.is_open && (
            <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-card/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-[8px]">
              <span className="w-1 h-1 bg-green-500 rounded-full" />
              <span className="text-foreground font-medium">Open</span>
            </div>
          )}
        </div>
        
        <CardContent className="p-2">
          <h3 className="font-semibold text-[13px] mb-1 line-clamp-1 text-foreground tracking-tight">{restaurant.name}</h3>
          
          <div className="flex items-center justify-between text-[9px] text-muted-foreground/70 mb-1.5">
            <div className="flex items-center gap-0.5">
              <MapPin className="h-2.5 w-2.5 text-purple/70" />
              <span>2.4 km</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Star className="h-2.5 w-2.5 fill-purple/80 text-purple/80" />
              <span className="font-medium text-foreground">4.8</span>
            </div>
          </div>
          
          <Badge className="text-[8px] bg-secondary/40 text-muted-foreground/70 border-0 rounded-full px-1.5 py-0">
            {getCuisineTag(restaurant.cuisine_type)}
          </Badge>
        </CardContent>
      </Card>

      <QuickActionsSheet
        restaurant={{
          id: restaurant.id,
          name: restaurant.name,
          cuisine: restaurant.cuisine_type,
        }}
        open={showQuickActions}
        onOpenChange={setShowQuickActions}
      />
    </>
  );
};

export default UniversalRestaurantCard;
