import { Plus } from "lucide-react";
import { DemoMenuItem } from "@/data/demoRestaurantMenus";

interface DishCardProps {
  dish: DemoMenuItem;
  onSelect: (dish: DemoMenuItem) => void;
}

const getTagEmoji = (tag: string): string => {
  const emojis: Record<string, string> = {
    spicy: "🌶️",
    veg: "🥬",
    vegan: "🌱",
    "gluten-free": "🌾",
    popular: "⭐",
    "chef-pick": "👨‍🍳",
    sharing: "🍽️"
  };
  return emojis[tag] || "";
};

const DishCard = ({ dish, onSelect }: DishCardProps) => {
  return (
    <div 
      className="bg-card rounded-2xl border border-border/40 shadow-sm hover:shadow-lg hover:border-purple/30 transition-all duration-200 cursor-pointer overflow-hidden group"
      onClick={() => onSelect(dish)}
    >
      <div className="flex gap-3 p-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-[15px] text-foreground leading-tight group-hover:text-purple transition-colors">
              {dish.name}
            </h3>
            <span className="font-semibold text-base text-purple flex-shrink-0">
              £{Number(dish.price).toFixed(2)}
            </span>
          </div>

          {/* Description */}
          {dish.description && (
            <p className="text-[12px] text-muted-foreground/70 line-clamp-2 mb-2 leading-relaxed">
              {dish.description}
            </p>
          )}

          {/* Tags */}
          {dish.tags && dish.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {dish.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/80 bg-secondary/50 px-1.5 py-0.5 rounded-full"
                >
                  <span>{getTagEmoji(tag)}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Image + Add button */}
        <div className="relative flex-shrink-0">
          {dish.image && (
            <div className="w-24 h-24 rounded-xl overflow-hidden ring-1 ring-border/30">
              <img 
                src={dish.image} 
                alt={dish.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          )}
          {/* Floating Add button */}
          <button
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-purple text-white shadow-sm flex items-center justify-center hover:bg-purple/90 active:scale-95 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(dish);
            }}
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
