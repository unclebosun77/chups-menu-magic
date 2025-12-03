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

  const handleNavigate = () => {
    // Check if it's a demo restaurant
    if (restaurant.id.includes("-demo")) {
      navigate(`/restaurant/demo/${restaurant.id}`);
    } else {
      navigate(`/restaurant/${restaurant.id}`);
    }
  };

  return (
    <Card
      className="flex-shrink-0 w-64 overflow-hidden hover:shadow-md transition-all cursor-pointer group bg-card rounded-xl border border-border shadow-sm"
      onClick={handleNavigate}
    >
      {/* Image Section */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
        
        {/* Match Score Badge */}
        <div className="absolute top-1.5 right-1.5 bg-purple text-primary-foreground px-1.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-0.5">
          <span>✨</span>
          <span>{restaurant.matchScore}%</span>
        </div>

        {/* Open Status */}
        {restaurant.isOpen && (
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-card/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-[9px]">
            <span className="w-1 h-1 bg-green-500 rounded-full" />
            <span className="text-foreground font-medium">Open</span>
          </div>
        )}

        {/* Logo */}
        <div className="absolute bottom-1.5 left-1.5 w-8 h-8 rounded-lg overflow-hidden border border-card shadow-sm bg-card">
          <img
            src={restaurant.logoUrl}
            alt={`${restaurant.name} logo`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <CardContent className="p-3 space-y-2">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="font-medium text-sm text-foreground">{restaurant.name}</h3>
            <span className="text-[10px] text-muted-foreground">{restaurant.priceLevel}</span>
          </div>
          <p className="text-[10px] text-muted-foreground line-clamp-2">{restaurant.description}</p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-0.5">
            <MapPin className="h-2.5 w-2.5 text-purple" />
            <span>{restaurant.distance}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Star className="h-2.5 w-2.5 fill-purple text-purple" />
            <span className="font-medium text-foreground">{restaurant.rating}</span>
          </div>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 rounded-full bg-secondary/50">
            {restaurant.cuisine}
          </Badge>
        </div>

        {/* Ambience Tags */}
        <div className="flex flex-wrap gap-1">
          {restaurant.ambience.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-[9px] text-muted-foreground/70 bg-secondary/30 px-1.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* AI Reason */}
        <p className="text-[9px] text-purple/70 italic">
          "{restaurant.aiReason}"
        </p>

        {/* Quick Actions */}
        <div className="flex gap-1.5 pt-0.5">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[9px] h-6 rounded-full border-border text-foreground hover:bg-secondary/30"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
          >
            <UtensilsCrossed className="h-2.5 w-2.5 mr-0.5" />
            Menu
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[9px] h-6 rounded-full border-border text-foreground hover:bg-secondary/30"
            onClick={(e) => e.stopPropagation()}
          >
            <Clock className="h-2.5 w-2.5 mr-0.5" />
            Time
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[9px] h-6 rounded-full border-border text-foreground hover:bg-secondary/30"
            onClick={(e) => e.stopPropagation()}
          >
            <CalendarCheck className="h-2.5 w-2.5 mr-0.5" />
            Book
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalizedRestaurantCard;
