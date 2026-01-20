import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, MapPin, Star, Sparkles } from "lucide-react";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { useTasteProfile } from "@/context/TasteProfileContext";
import { vibrate } from "@/utils/haptics";
import QuickActionsSheet from "@/components/restaurant/QuickActionsSheet";
import { generateRestaurantTags, getHeroTag } from "@/utils/aiTagging";
import { calculateTasteMatchScore } from "@/utils/outaSuggestEngine";
import TasteMatchBadge from "@/components/TasteMatchBadge";

type Restaurant = {
  id: string;
  name: string;
  cuisine_type: string;
  description: string | null;
  logo_url: string | null;
  is_open: boolean;
  latitude?: number | null;
  longitude?: number | null;
  matchScore?: number;
  aiReason?: string;
  priceLevel?: string;
  ambience?: string[];
  signatureDishes?: string[];
};

interface PremiumRestaurantCardProps {
  restaurant: Restaurant;
  variant?: "compact" | "featured" | "grid";
  index?: number;
  showAiTags?: boolean;
  hideMatchScore?: boolean;
}

const getCuisineTag = (cuisineType: string) => {
  if (cuisineType.toLowerCase().includes('afro') || cuisineType.toLowerCase().includes('nigerian')) {
    return 'Afro';
  }
  return cuisineType;
};

const PremiumRestaurantCard = ({ restaurant, variant = "compact", index = 0, showAiTags = true, hideMatchScore = false }: PremiumRestaurantCardProps) => {
  const navigate = useNavigate();
  const { addRestaurantVisit } = useUserBehavior();
  const { profile, updateTasteFromInteraction } = useTasteProfile();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // AI-driven tags and match score
  const aiTags = useMemo(() => {
    if (!showAiTags) return [];
    return generateRestaurantTags({
      name: restaurant.name,
      cuisine: restaurant.cuisine_type,
      description: restaurant.description || undefined,
      priceLevel: restaurant.priceLevel,
      ambience: restaurant.ambience,
      signatureDishes: restaurant.signatureDishes,
      isOpen: restaurant.is_open,
    });
  }, [restaurant, showAiTags]);

  const heroTag = useMemo(() => getHeroTag({
    name: restaurant.name,
    cuisine: restaurant.cuisine_type,
    description: restaurant.description || undefined,
    priceLevel: restaurant.priceLevel,
    ambience: restaurant.ambience,
  }), [restaurant]);

  const dynamicMatchScore = useMemo(() => {
    if (restaurant.matchScore) return restaurant.matchScore;
    return calculateTasteMatchScore({
      id: restaurant.id,
      name: restaurant.name,
      cuisine: restaurant.cuisine_type,
      priceLevel: restaurant.priceLevel,
      ambience: restaurant.ambience,
    }, profile);
  }, [restaurant, profile]);

  const handleClick = useCallback(() => {
    addRestaurantVisit({ 
      id: restaurant.id, 
      name: restaurant.name, 
      cuisine: restaurant.cuisine_type 
    });
    // Update taste profile from interaction
    updateTasteFromInteraction({
      id: restaurant.id,
      name: restaurant.name,
      cuisine: restaurant.cuisine_type,
      priceLevel: restaurant.priceLevel,
      ambience: restaurant.ambience,
    }, 'view');
    navigate(`/restaurant/${restaurant.id}`);
  }, [navigate, restaurant, addRestaurantVisit, updateTasteFromInteraction]);

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

  const cardSizes = {
    compact: "w-[160px]",
    featured: "w-[280px]",
    grid: "w-full"
  };

  const imageSizes = {
    compact: "aspect-[4/3]",
    featured: "aspect-[16/10]",
    grid: "h-48"
  };

  return (
    <>
      <Card
        className={`flex-shrink-0 ${cardSizes[variant]} overflow-hidden card-hover-lift cursor-pointer group bg-card rounded-2xl border border-border/40 shadow-card active:scale-[0.97] transition-all duration-300`}
        onClick={handleClick}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        style={{
          animationDelay: `${index * 80}ms`
        }}
      >
        <div className={`relative ${imageSizes[variant]} overflow-hidden`}>
          {restaurant.logo_url ? (
            <>
              <div className={`w-full h-full bg-secondary/50 ${!imageLoaded ? 'shimmer-loading' : ''}`} />
              <img
                src={restaurant.logo_url}
                alt={restaurant.name}
                className={`absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${imageLoaded ? 'img-fade-in' : 'opacity-0'}`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center">
              <ChefHat className="h-8 w-8 text-muted-foreground/30" strokeWidth={1.5} />
            </div>
          )}
          
          {/* Premium gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Match score badge - hidden on Discover for neutral browsing */}
          {!hideMatchScore && dynamicMatchScore > 70 && (
            <TasteMatchBadge 
              score={dynamicMatchScore} 
              variant="compact" 
              className="absolute top-2 right-2 shadow-lg"
            />
          )}
          
          {/* Open indicator */}
          {restaurant.is_open && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-card/95 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-foreground font-medium">Open</span>
            </div>
          )}

          {/* Restaurant name overlay for featured variant */}
          {variant === "featured" && (
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="font-bold text-white text-lg tracking-tight drop-shadow-lg">{restaurant.name}</h3>
              {restaurant.aiReason && (
                <p className="text-white/80 text-xs mt-0.5 italic">"{restaurant.aiReason}"</p>
              )}
            </div>
          )}
        </div>
        
        <CardContent className={`${variant === "featured" ? "p-3" : "p-2.5"}`}>
          {variant !== "featured" && (
            <h3 className="font-semibold text-sm mb-1.5 line-clamp-1 text-foreground tracking-tight">
              {restaurant.name}
            </h3>
          )}
          
          <div className="flex items-center justify-between text-[11px] text-muted-foreground/70 mb-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-purple/70" strokeWidth={1.5} />
              <span>2.4 km</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-purple/80 text-purple/80" strokeWidth={1.5} />
              <span className="font-medium text-foreground">4.8</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge className="text-[10px] bg-secondary/60 text-muted-foreground border-0 rounded-full px-2.5 py-0.5 chip-animate">
              {getCuisineTag(restaurant.cuisine_type)}
            </Badge>
            {/* AI Hero Tag */}
            {showAiTags && heroTag && (
              <Badge className="text-[9px] bg-purple/15 text-purple border-purple/20 rounded-full px-2 py-0.5 chip-animate animate-fade-in">
                {heroTag.label}
              </Badge>
            )}
            {variant === "grid" && restaurant.description && (
              <p className="text-xs text-muted-foreground/60 line-clamp-1 flex-1">
                {restaurant.description}
              </p>
            )}
          </div>
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

export default PremiumRestaurantCard;
