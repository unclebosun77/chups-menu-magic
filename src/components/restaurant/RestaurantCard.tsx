import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { vibrate } from "@/utils/haptics";
import QuickActionsSheet from "@/components/restaurant/QuickActionsSheet";

export type RestaurantCardData = {
  id: string;
  name: string;
  rating?: number;
  cuisine: string;
  price_level?: string;
  description?: string | null;
  images?: string[];
  // Legacy support
  imageUrl?: string;
  logo_url?: string;
  logoUrl?: string;
  cuisine_type?: string;
  priceLevel?: string;
};

interface RestaurantCardProps {
  restaurant: RestaurantCardData;
}

const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  const navigate = useNavigate();
  const { addRestaurantVisit } = useUserBehavior();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Normalize data from different sources
  const cuisineType = restaurant.cuisine || restaurant.cuisine_type || "Restaurant";
  const priceLevel = restaurant.price_level || restaurant.priceLevel || "££";
  const rating = restaurant.rating ?? 4.5;
  const thumbnail = restaurant.images?.[0] || restaurant.imageUrl || restaurant.logo_url || restaurant.logoUrl || "/placeholder.svg";
  const description = restaurant.description || "";

  // Generate vibe tags from description
  const getVibeTags = () => {
    const tags: string[] = [];
    const descLower = description.toLowerCase();
    
    if (descLower.includes("romantic") || descLower.includes("intimate") || descLower.includes("elegant")) tags.push("Date Night");
    if (descLower.includes("modern") || descLower.includes("contemporary")) tags.push("Contemporary");
    if (descLower.includes("cozy") || descLower.includes("warm")) tags.push("Cozy");
    if (descLower.includes("premium") || descLower.includes("refined")) tags.push("Premium");
    if (descLower.includes("cultural") || descLower.includes("authentic")) tags.push("Authentic");
    if (descLower.includes("vibrant") || descLower.includes("lively")) tags.push("Vibrant");
    
    return tags.slice(0, 3);
  };

  const vibeTags = getVibeTags();

  const handleClick = useCallback(() => {
    addRestaurantVisit({ 
      id: restaurant.id, 
      name: restaurant.name, 
      cuisine: cuisineType 
    });
    navigate(`/restaurant/${restaurant.id}`);
  }, [navigate, restaurant.id, restaurant.name, cuisineType, addRestaurantVisit]);

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
        className="flex-shrink-0 w-[200px] min-w-[160px] max-w-full overflow-hidden transition-all cursor-pointer group rounded-2xl border-0 shadow-lg hover:shadow-xl active:scale-[0.98] bg-gradient-to-br from-card via-card to-purple/5"
        onClick={handleClick}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
      >
        {/* Large Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
          <img
            src={thumbnail}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        <CardContent className="p-3 space-y-2">
          {/* Restaurant Name */}
          <h3 className="font-bold text-base text-foreground tracking-tight line-clamp-1">
            {restaurant.name}
          </h3>

          {/* Quick Info Row */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-0.5">
              <Star className="h-3.5 w-3.5 fill-purple text-purple" />
              <span className="font-semibold text-foreground">{rating}</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <span className="truncate">{cuisineType}</span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-purple font-medium">{priceLevel}</span>
          </div>

          {/* Vibe Tags */}
          {vibeTags.length > 0 && (
            <p className="text-[11px] text-muted-foreground/70 line-clamp-1">
              {vibeTags.join(" • ")}
            </p>
          )}
        </CardContent>
      </Card>

      <QuickActionsSheet
        restaurant={{
          id: restaurant.id,
          name: restaurant.name,
          cuisine: cuisineType,
        }}
        open={showQuickActions}
        onOpenChange={setShowQuickActions}
      />
    </>
  );
};

export default RestaurantCard;
