import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ChefHat } from "lucide-react";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { useTasteProfile } from "@/context/TasteProfileContext";
import { vibrate } from "@/utils/haptics";
import QuickActionsSheet from "@/components/restaurant/QuickActionsSheet";

// Universal restaurant type that works across all sections
export type UniversalRestaurant = {
  id: string;
  name: string;
  cuisine: string;
  description?: string;
  address?: string;
  ambience?: string[];
  priceLevel?: string;
  matchScore?: number;
  aiReason?: string;
  isOpen?: boolean;
  distance?: string;
  rating?: number;
  logoUrl?: string;
  imageUrl?: string;
};

interface UniversalRestaurantCardProps {
  restaurant: UniversalRestaurant;
  size?: "default" | "compact";
  showPersonalization?: boolean;
}

// Generate personalization reason based on taste profile
const generateAiReason = (cuisine: string, matchScore?: number): string => {
  const cuisineLower = cuisine.toLowerCase();
  
  if (cuisineLower.includes('afro') || cuisineLower.includes('nigerian') || cuisineLower.includes('african')) {
    return "Picked because you browse Afro restaurants often";
  }
  if (cuisineLower.includes('italian')) {
    return "Recommended based on your Italian dining preferences";
  }
  if (cuisineLower.includes('thai') || cuisineLower.includes('asian')) {
    return "Suggested for your love of Asian cuisine";
  }
  if (matchScore && matchScore > 85) {
    return "High match based on your taste profile";
  }
  return "Popular with people similar to you";
};

// Calculate match score based on taste profile
const calculateMatchScore = (cuisine: string, tasteProfile: any): number => {
  if (!tasteProfile?.preferredCuisines?.length) return Math.floor(Math.random() * 15) + 75;
  
  const cuisineLower = cuisine.toLowerCase();
  const preferred = tasteProfile.preferredCuisines.map((c: string) => c.toLowerCase());
  
  if (preferred.some((p: string) => cuisineLower.includes(p) || p.includes(cuisineLower))) {
    return Math.floor(Math.random() * 8) + 88; // 88-95
  }
  return Math.floor(Math.random() * 15) + 72; // 72-86
};

const UniversalRestaurantCard = ({ 
  restaurant, 
  size = "default",
  showPersonalization = true 
}: UniversalRestaurantCardProps) => {
  const navigate = useNavigate();
  const { addRestaurantVisit } = useUserBehavior();
  const { profile } = useTasteProfile();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Calculate or use provided values
  const matchScore = restaurant.matchScore ?? calculateMatchScore(restaurant.cuisine, profile);
  const aiReason = restaurant.aiReason ?? generateAiReason(restaurant.cuisine, matchScore);
  const distance = restaurant.distance ?? "1.2 km";
  const rating = restaurant.rating ?? 4.7;
  const priceLevel = restaurant.priceLevel ?? "££";
  const isOpen = restaurant.isOpen ?? true;
  const ambience = restaurant.ambience ?? ["Cozy", "Modern"];

  const handleClick = useCallback(() => {
    addRestaurantVisit({ 
      id: restaurant.id, 
      name: restaurant.name, 
      cuisine: restaurant.cuisine 
    });
    
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

  const cardWidth = size === "compact" ? "w-[180px]" : "w-[260px]";
  const imageAspect = size === "compact" ? "aspect-[4/3]" : "aspect-[16/10]";

  return (
    <>
      <Card
        className={`flex-shrink-0 ${cardWidth} overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group bg-card rounded-xl border border-border/30 shadow-sm active:scale-[0.98]`}
        onClick={handleClick}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
      >
        {/* Image Section */}
        <div className={`relative ${imageAspect} overflow-hidden`}>
          {restaurant.imageUrl ? (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : restaurant.logoUrl ? (
            <img
              src={restaurant.logoUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <ChefHat className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Match Score Badge */}
          {showPersonalization && (
            <div className="absolute top-2 right-2 bg-purple/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-lg">
              <span className="text-[9px]">✨</span>
              <span>{matchScore}% match</span>
            </div>
          )}

          {/* Open Status */}
          {isOpen && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-card/95 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-foreground font-medium">Open</span>
            </div>
          )}

          {/* Logo Overlay */}
          {restaurant.logoUrl && (
            <div className="absolute bottom-2 left-2 w-9 h-9 rounded-lg overflow-hidden border-2 border-card shadow-md bg-card">
              <img
                src={restaurant.logoUrl}
                alt={`${restaurant.name} logo`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <CardContent className="p-3 space-y-2">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[14px] text-foreground tracking-tight truncate">
                {restaurant.name}
              </h3>
              {showPersonalization && (
                <p className="text-[9px] text-purple/70 mt-0.5 line-clamp-1">
                  {aiReason}
                </p>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground/60 font-medium flex-shrink-0">
              {priceLevel}
            </span>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/80">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-purple/70" />
              <span>{distance}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">{rating}</span>
            </div>
            <Badge 
              variant="secondary" 
              className="text-[9px] px-1.5 py-0 rounded-full bg-secondary/50 text-muted-foreground border-0 font-normal"
            >
              {restaurant.cuisine}
            </Badge>
          </div>

          {/* Ambience Tags */}
          {size === "default" && ambience.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {ambience.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-[8px] text-muted-foreground/60 bg-secondary/40 px-1.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <QuickActionsSheet
        restaurant={{
          id: restaurant.id,
          name: restaurant.name,
          cuisine: restaurant.cuisine,
        }}
        open={showQuickActions}
        onOpenChange={setShowQuickActions}
      />
    </>
  );
};

export default UniversalRestaurantCard;
