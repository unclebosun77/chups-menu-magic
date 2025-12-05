import { useNavigate } from "react-router-dom";
import { X, MapPin, ChefHat, Sparkles, DollarSign } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { seedDishes } from "@/data/dishes";

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

  const handleRestaurantClick = (restaurantId: string) => {
    addDishView({ id: dish.id, name: dish.name, category: dish.category });
    onOpenChange(false);
    navigate(`/restaurant/${restaurantId}`);
  };

  // Find similar dishes
  const similarDishes = seedDishes
    .filter(d => d.category === dish.category && d.id !== dish.id)
    .slice(0, 3);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 rounded-2xl overflow-hidden">
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
          <p className="text-sm text-muted-foreground mb-4">
            {dish.description || `A delicious ${dish.category} dish prepared with the finest ingredients and traditional techniques.`}
          </p>

          {/* Price comparison (if multiple restaurants) */}
          {dish.restaurants.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple" />
                Available at
              </h3>
              <div className="space-y-2">
                {dish.restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => handleRestaurantClick(restaurant.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center">
                        <ChefHat className="h-4 w-4 text-purple" />
                      </div>
                      <span className="font-medium text-sm">{restaurant.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span className="text-sm">View Menu</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Similar dishes */}
          {similarDishes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple" />
                Outa suggests similar
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {similarDishes.map((similar) => (
                  <div 
                    key={similar.id}
                    className="flex-shrink-0 w-20 cursor-pointer"
                    onClick={() => {
                      // Could open this dish detail
                    }}
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-1">
                      <img 
                        src={similar.image}
                        alt={similar.name}
                        className="w-full h-full object-cover"
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
            className="w-full mt-4 bg-purple hover:bg-purple-hover text-white rounded-xl"
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
