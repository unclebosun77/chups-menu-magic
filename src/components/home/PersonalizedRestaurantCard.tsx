import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, CalendarCheck, UtensilsCrossed } from "lucide-react";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { vibrate } from "@/utils/haptics";
import QuickActionsSheet from "@/components/restaurant/QuickActionsSheet";

type PersonalizedRestaurant = {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  description: string;
  ambience: string[];
  priceLevel: string;
  matchScore: number;
  aiReason: string;
  isOpen: boolean;
  distance: string;
  rating: number;
  logoUrl: string;
  imageUrl: string;
};

interface PersonalizedRestaurantCardProps {
  restaurant: PersonalizedRestaurant;
}

const PersonalizedRestaurantCard = ({ restaurant }: PersonalizedRestaurantCardProps) => {
  const navigate = useNavigate();
  const { addRestaurantVisit } = useUserBehavior();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleNavigate = useCallback(() => {
    addRestaurantVisit({
      id: restaurant.id,
      name: restaurant.name,
      cuisine: restaurant.cuisine,
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
        className="flex-shrink-0 w-60 overflow-hidden hover:shadow-md transition-all cursor-pointer group bg-card rounded-2xl border border-border/50 shadow-sm active:scale-[0.98]"
        onClick={handleNavigate}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
      >
        {/* Image Section */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Match Score Badge */}
          <div className="absolute top-1.5 right-1.5 bg-purple/90 text-primary-foreground px-1.5 py-0.5 rounded-full text-[9px] font-medium flex items-center gap-0.5">
            <span>✨</span>
            <span>{restaurant.matchScore}%</span>
          </div>

          {/* Open Status */}
          {restaurant.isOpen && (
            <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-card/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-[8px]">
              <span className="w-1 h-1 bg-green-500 rounded-full" />
              <span className="text-foreground font-medium">Open</span>
            </div>
          )}

          {/* Logo */}
          <div className="absolute bottom-1.5 left-1.5 w-7 h-7 rounded-lg overflow-hidden border border-card shadow-sm bg-card">
            <img
              src={restaurant.logoUrl}
              alt={`${restaurant.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <CardContent className="p-2.5 space-y-1.5">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <h3 className="font-semibold text-[13px] text-foreground tracking-tight">{restaurant.name}</h3>
              <span className="text-[9px] text-muted-foreground/60">{restaurant.priceLevel}</span>
            </div>
            <p className="text-[9px] text-muted-foreground/60 line-clamp-2 leading-relaxed">{restaurant.description}</p>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-2 text-[9px] text-muted-foreground/70">
            <div className="flex items-center gap-0.5">
              <MapPin className="h-2.5 w-2.5 text-purple/70" />
              <span>{restaurant.distance}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Star className="h-2.5 w-2.5 fill-purple/80 text-purple/80" />
              <span className="font-medium text-foreground">{restaurant.rating}</span>
            </div>
            <Badge variant="secondary" className="text-[8px] px-1.5 py-0 rounded-full bg-secondary/40">
              {restaurant.cuisine}
            </Badge>
          </div>

          {/* Ambience Tags */}
          <div className="flex flex-wrap gap-1">
            {restaurant.ambience.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-[8px] text-muted-foreground/50 bg-secondary/30 px-1.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* AI Reason */}
          <p className="text-[8px] text-purple/60 italic">
            "{restaurant.aiReason}"
          </p>

          {/* Quick Actions */}
          <div className="flex gap-1.5 pt-0.5">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-[8px] h-5 rounded-full border-border/50 text-foreground hover:bg-secondary/20"
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate();
              }}
            >
              <UtensilsCrossed className="h-2 w-2 mr-0.5" />
              Menu
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-[8px] h-5 rounded-full border-border/50 text-foreground hover:bg-secondary/20"
              onClick={(e) => e.stopPropagation()}
            >
              <Clock className="h-2 w-2 mr-0.5" />
              Time
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-[8px] h-5 rounded-full border-border/50 text-foreground hover:bg-secondary/20"
              onClick={(e) => e.stopPropagation()}
            >
              <CalendarCheck className="h-2 w-2 mr-0.5" />
              Book
            </Button>
          </div>
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

export default PersonalizedRestaurantCard;
