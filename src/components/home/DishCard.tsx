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
      navigate(`/restaurant/${dish.restaurants[0].id}`);
    }
  };

  return (
    <div 
      className="flex-shrink-0 w-40 cursor-pointer group"
      onClick={handleClick}
    >
      <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-purple/10 transition-all duration-200 group-hover:shadow-md group-hover:border-purple/20">
        {/* Dish Image */}
        <div className="relative h-32 overflow-hidden">
          <img 
            src={dish.image} 
            alt={dish.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Dish name on image */}
          <div className="absolute bottom-2 left-2 right-2">
            <h3 className="text-white font-medium text-sm leading-tight drop-shadow-md">
              {dish.name}
            </h3>
          </div>
        </div>
        
        {/* Card bottom info */}
        <div className="p-2.5">
          {/* Restaurant list */}
          <p className="text-[10px] text-muted-foreground truncate">
            {restaurantText()}
          </p>
          
          {/* AI suggestion tag */}
          {dish.aiSuggested && (
            <div className="flex items-center gap-1 mt-1.5">
              <Sparkles className="h-2.5 w-2.5 text-purple" />
              <span className="text-[9px] text-purple/80">For your taste</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DishCard;
