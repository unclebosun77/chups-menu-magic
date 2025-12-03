import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export type Dish = {
  id: string;
  name: string;
  image: string;
  category: string;
  restaurants: { id: string; name: string }[];
  aiSuggested?: boolean;
};

interface DishCardProps {
  dish: Dish;
}

const DishCard = ({ dish }: DishCardProps) => {
  const navigate = useNavigate();
  
  const restaurantText = () => {
    if (dish.restaurants.length === 0) return "";
    if (dish.restaurants.length === 1) return dish.restaurants[0].name;
    if (dish.restaurants.length === 2) return `${dish.restaurants[0].name}, ${dish.restaurants[1].name}`;
    return `${dish.restaurants[0].name}, ${dish.restaurants[1].name}, ${dish.restaurants.length - 2} more…`;
  };

  const handleClick = () => {
    // Navigate to first restaurant that serves this dish
    if (dish.restaurants.length > 0) {
      const restaurantId = dish.restaurants[0].id;
      // Check if it's a demo restaurant
      if (restaurantId.includes("-demo")) {
        navigate(`/restaurant/demo/${restaurantId}`);
      } else {
        navigate(`/restaurant/${restaurantId}`);
      }
    }
  };

  return (
    <div 
      className="flex-shrink-0 w-36 cursor-pointer group"
      onClick={handleClick}
    >
      <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border transition-all duration-200 group-hover:shadow-md">
        {/* Dish Image */}
        <div className="relative h-24 overflow-hidden">
          <img 
            src={dish.image} 
            alt={dish.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Dish name on image */}
          <div className="absolute bottom-1.5 left-2 right-2">
            <h3 className="text-white font-medium text-xs leading-tight drop-shadow-md">
              {dish.name}
            </h3>
          </div>
        </div>
        
        {/* Card bottom info */}
        <div className="p-2">
          {/* Restaurant list */}
          <p className="text-[9px] text-muted-foreground truncate">
            {restaurantText()}
          </p>
          
          {/* AI suggestion tag */}
          {dish.aiSuggested && (
            <div className="flex items-center gap-0.5 mt-1">
              <Sparkles className="h-2 w-2 text-purple" />
              <span className="text-[8px] text-purple/70">For your taste</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DishCard;
