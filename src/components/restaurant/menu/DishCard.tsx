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
            <span className="font-bold text-[15px] text-purple flex-shrink-0">
              £{dish.price}
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

        {/* Image */}
        {dish.image && (
          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-border/30">
            <img 
              src={dish.image} 
              alt={dish.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DishCard;
