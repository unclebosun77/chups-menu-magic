import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, MapPin, Star } from "lucide-react";

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

  return (
    <Card
      className={`flex-shrink-0 w-44 overflow-hidden hover:shadow-hover transition-all cursor-pointer group bg-card rounded-2xl border shadow-card ${
        variant === "personalized" ? "border-purple/20 ring-1 ring-purple/10" : "border-border"
      }`}
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
    >
      <div className="relative h-28 overflow-hidden">
        {restaurant.logo_url ? (
          <img
            src={restaurant.logo_url}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <ChefHat className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        
        {/* Open indicator */}
        {restaurant.is_open && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-card/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px]">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-foreground font-medium">Open</span>
          </div>
        )}

        {/* Personalized badge */}
        {variant === "personalized" && (
          <div className="absolute bottom-2 left-2">
            <span className="text-[10px] text-foreground/90 font-medium bg-purple/20 backdrop-blur-sm px-2 py-0.5 rounded-full">For you ✨</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-3">
        <h3 className="font-semibold text-sm mb-1.5 line-clamp-1 text-foreground">{restaurant.name}</h3>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-purple" />
            <span>2.4 km</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-purple text-purple" />
            <span className="font-medium text-foreground">4.8</span>
          </div>
        </div>
        
        <Badge className="text-[10px] bg-secondary text-foreground border-0 rounded-full px-2 py-0.5">
          {getCuisineTag(restaurant.cuisine_type)}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default UniversalRestaurantCard;
