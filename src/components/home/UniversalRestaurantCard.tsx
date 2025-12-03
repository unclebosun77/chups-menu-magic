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
      className={`flex-shrink-0 w-40 overflow-hidden hover:shadow-md transition-all cursor-pointer group bg-card rounded-xl border border-border shadow-sm`}
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
    >
      <div className="relative h-24 overflow-hidden">
        {restaurant.logo_url ? (
          <img
            src={restaurant.logo_url}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <ChefHat className="h-6 w-6 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
        
        {/* Open indicator */}
        {restaurant.is_open && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-card/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-[9px]">
            <span className="w-1 h-1 bg-green-500 rounded-full" />
            <span className="text-foreground font-medium">Open</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-2.5">
        <h3 className="font-medium text-sm mb-1 line-clamp-1 text-foreground">{restaurant.name}</h3>
        
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
          <div className="flex items-center gap-0.5">
            <MapPin className="h-2.5 w-2.5 text-purple" />
            <span>2.4 km</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Star className="h-2.5 w-2.5 fill-purple text-purple" />
            <span className="font-medium text-foreground">4.8</span>
          </div>
        </div>
        
        <Badge className="text-[9px] bg-secondary/50 text-muted-foreground border-0 rounded-full px-1.5 py-0">
          {getCuisineTag(restaurant.cuisine_type)}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default UniversalRestaurantCard;
