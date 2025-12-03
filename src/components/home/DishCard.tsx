import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import DishDetailModal, { DishDetail } from "@/components/dish/DishDetailModal";

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
  const { addDishView } = useUserBehavior();
  const [showDetail, setShowDetail] = useState(false);
  
  const restaurantText = () => {
    if (dish.restaurants.length === 0) return "";
    if (dish.restaurants.length === 1) return dish.restaurants[0].name;
    if (dish.restaurants.length === 2) return `${dish.restaurants[0].name}, ${dish.restaurants[1].name}`;
    return `${dish.restaurants[0].name}, ${dish.restaurants[1].name}, ${dish.restaurants.length - 2} more…`;
  };

  const handleClick = () => {
    addDishView({ id: dish.id, name: dish.name, category: dish.category });
    setShowDetail(true);
  };

  const dishDetail: DishDetail = {
    ...dish,
    description: `A delicious ${dish.category} specialty prepared with authentic ingredients and traditional techniques.`,
  };

  return (
    <>
      <div 
        className="flex-shrink-0 w-[130px] cursor-pointer group"
        onClick={handleClick}
      >
        <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 transition-all duration-200 group-hover:shadow-md group-active:scale-95">
          {/* Dish Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img 
              src={dish.image} 
              alt={dish.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {/* Enhanced gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Dish name on image */}
            <div className="absolute bottom-1.5 left-2 right-2">
              <h3 className="text-white font-bold text-[11px] leading-tight drop-shadow-lg">
                {dish.name}
              </h3>
            </div>
          </div>
          
          {/* Card bottom info */}
          <div className="p-2">
            {/* Restaurant list */}
            <p className="text-[8px] text-muted-foreground/60 truncate">
              {restaurantText()}
            </p>
            
            {/* AI suggestion tag */}
            {dish.aiSuggested && (
              <div className="flex items-center gap-0.5 mt-1">
                <Sparkles className="h-2 w-2 text-purple/70" />
                <span className="text-[7px] text-purple/60">For your taste</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <DishDetailModal 
        dish={dishDetail}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </>
  );
};

export default DishCard;
