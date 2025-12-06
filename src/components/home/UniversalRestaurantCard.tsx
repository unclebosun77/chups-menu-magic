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
    navigate(`/restaurant/${restaurant.id}`);
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
        className="flex-shrink-0 w-[150px] overflow-hidden cursor-pointer group bg-card rounded-2xl border border-border/40 shadow-card hover:shadow-hover hover:border-purple/20 transition-all duration-300 active:scale-[0.97]"
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
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center">
              <ChefHat className="h-8 w-8 text-muted-foreground/20" strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          
          {/* Open indicator - Premium style */}
          {restaurant.is_open && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/90 backdrop-blur-md px-2 py-1 rounded-full text-[9px] shadow-sm border border-border/30">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-foreground font-medium">Open</span>
            </div>
          )}
          
          {/* Rating overlay */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-background/90 backdrop-blur-md px-2 py-1 rounded-full shadow-sm border border-border/30">
            <Star className="h-3 w-3 fill-purple text-purple" strokeWidth={1.5} />
            <span className="text-[10px] font-bold text-foreground">4.8</span>
          </div>
        </div>
        
        <CardContent className="p-3">
          <h3 className="font-bold text-[14px] mb-1 line-clamp-1 text-foreground tracking-tight group-hover:text-purple transition-colors">{restaurant.name}</h3>
          
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
            <div className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3 text-purple/60" strokeWidth={1.5} />
              <span>2.4 km</span>
            </div>
            <span className="text-muted-foreground/30">•</span>
            <span className="text-purple/70 font-medium">££</span>
          </div>
          
          <Badge className="text-[9px] bg-purple/10 text-purple border-purple/20 rounded-full px-2 py-0.5 font-medium">
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
