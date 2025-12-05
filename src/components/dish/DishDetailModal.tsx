import { useNavigate } from "react-router-dom";
import { X, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { seedDishes } from "@/data/dishes";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";
import UniversalRestaurantCard from "@/components/restaurant/UniversalRestaurantCard";

export type DishDetail = {
  id: string;
  name: string;
  image: string;
  category: string;
  description?: string;
  price?: string;
  restaurants: { id: string; name: string }[];
  aiSuggested?: boolean;
  tags?: string[];
};

interface DishDetailModalProps {
  dish: DishDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DishDetailModal = ({ dish, open, onOpenChange }: DishDetailModalProps) => {
  const navigate = useNavigate();
  const { addDishView } = useUserBehavior();

  if (!dish) return null;

  // Find similar dishes
  const similarDishes = seedDishes
    .filter(d => d.category === dish.category && d.id !== dish.id)
    .slice(0, 3);

  // Get full restaurant data for restaurants that serve this dish
  const getRestaurantData = (restaurantId: string) => {
    return personalizedRestaurants.find(r => r.id === restaurantId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Hero Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img 
            src={dish.image} 
            alt={dish.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Close button */}
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Title on image */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white mb-1">{dish.name}</h2>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                {dish.category}
              </Badge>
              {dish.aiSuggested && (
                <Badge className="bg-purple/80 text-white border-0 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  For your taste
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Description */}
          <p className="text-sm text-muted-foreground mb-5">
            {dish.description || `A delicious ${dish.category} dish prepared with the finest ingredients and traditional techniques.`}
          </p>

          {/* Restaurants that serve this dish - Universal Cards */}
          {dish.restaurants.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="text-purple">📍</span>
                Available at
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                {dish.restaurants.map((restaurant) => {
                  const restaurantData = getRestaurantData(restaurant.id);
                  if (restaurantData) {
                    return (
                      <UniversalRestaurantCard
                        key={restaurant.id}
                        restaurant={{
                          id: restaurantData.id,
                          name: restaurantData.name,
                          cuisine: restaurantData.cuisine,
                          description: restaurantData.description,
                          ambience: restaurantData.ambience,
                          priceLevel: restaurantData.priceLevel,
                          matchScore: restaurantData.matchScore,
                          aiReason: restaurantData.aiReason,
                          isOpen: restaurantData.isOpen,
                          distance: restaurantData.distance,
                          rating: restaurantData.rating,
                          logoUrl: restaurantData.logoUrl,
                          imageUrl: restaurantData.imageUrl,
                        }}
                        size="compact"
                      />
                    );
                  }
                  // Fallback for non-demo restaurants
                  return (
                    <UniversalRestaurantCard
                      key={restaurant.id}
                      restaurant={{
                        id: restaurant.id,
                        name: restaurant.name,
                        cuisine: "Restaurant",
                      }}
                      size="compact"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Similar dishes */}
          {similarDishes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple" />
                Outa suggests similar
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {similarDishes.map((similar) => (
                  <div 
                    key={similar.id}
                    className="flex-shrink-0 w-20 cursor-pointer group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-1 ring-1 ring-border/30 group-hover:ring-purple/40 transition-all">
                      <img 
                        src={similar.image}
                        alt={similar.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground truncate">{similar.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ask Outa button */}
          <Button 
            className="w-full bg-purple hover:bg-purple-hover text-white rounded-xl"
            onClick={() => {
              onOpenChange(false);
              navigate("/ai-assistant");
            }}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Ask Outa for alternatives
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DishDetailModal;
