import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, CalendarCheck, UtensilsCrossed } from "lucide-react";

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

  return (
    <Card
      className="flex-shrink-0 w-72 overflow-hidden hover:shadow-lg transition-all cursor-pointer group bg-card rounded-2xl border border-border shadow-card"
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
    >
      {/* Image Section */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
        
        {/* Match Score Badge */}
        <div className="absolute top-2 right-2 bg-purple text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <span>✨</span>
          <span>{restaurant.matchScore}% match</span>
        </div>

        {/* Open Status */}
        {restaurant.isOpen && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-card/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px]">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-foreground font-medium">Open</span>
          </div>
        )}

        {/* Logo */}
        <div className="absolute bottom-2 left-2 w-10 h-10 rounded-xl overflow-hidden border-2 border-card shadow-md bg-card">
          <img
            src={restaurant.logoUrl}
            alt={`${restaurant.name} logo`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-base text-foreground">{restaurant.name}</h3>
            <span className="text-xs text-muted-foreground font-medium">{restaurant.priceLevel}</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{restaurant.description}</p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-purple" />
            <span>{restaurant.distance}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-purple text-purple" />
            <span className="font-medium text-foreground">{restaurant.rating}</span>
          </div>
          <Badge variant="secondary" className="text-[10px] px-2 py-0 rounded-full">
            {restaurant.cuisine}
          </Badge>
        </div>

        {/* Ambience Tags */}
        <div className="flex flex-wrap gap-1">
          {restaurant.ambience.slice(0, 4).map((tag, index) => (
            <span
              key={index}
              className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* AI Reason */}
        <p className="text-[11px] text-purple/80 italic">
          "{restaurant.aiReason}"
        </p>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[10px] h-7 rounded-full border-purple/30 text-purple hover:bg-purple/5"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/restaurant/${restaurant.id}`);
            }}
          >
            <UtensilsCrossed className="h-3 w-3 mr-1" />
            View Menu
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[10px] h-7 rounded-full border-purple/30 text-purple hover:bg-purple/5"
            onClick={(e) => e.stopPropagation()}
          >
            <Clock className="h-3 w-3 mr-1" />
            Best Time
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[10px] h-7 rounded-full border-purple/30 text-purple hover:bg-purple/5"
            onClick={(e) => e.stopPropagation()}
          >
            <CalendarCheck className="h-3 w-3 mr-1" />
            Reserve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalizedRestaurantCard;
