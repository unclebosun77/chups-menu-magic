import { Plus } from "lucide-react";
import { DemoMenuItem } from "@/data/demoRestaurantMenus";
import { Badge } from "@/components/ui/badge";

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
  const isUnavailable = dish.available === false;
  const isSoldOut = dish.sold_out_today === true && !isUnavailable;
  const isDisabled = isUnavailable || isSoldOut;

  return (
    <div
      className={`bg-white rounded-2xl shadow-card border-0 transition-all duration-200 overflow-hidden group ${
        isUnavailable ? "opacity-40" : isSoldOut ? "opacity-60" : "hover:shadow-hover cursor-pointer"
      }`}
      onClick={() => !isDisabled && onSelect(dish)}
    >
      <div className="flex gap-3 p-3">
        {/* Image */}
        {dish.image && (
          <div className={`w-20 h-20 aspect-square rounded-xl overflow-hidden flex-shrink-0 ${isUnavailable ? "grayscale" : ""}`}>
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h3 className={`text-[14px] font-semibold leading-tight truncate ${
              isDisabled ? "text-muted-foreground" : "text-foreground"
            }`}>
              {dish.name}
            </h3>
            <span className={`text-[15px] font-bold flex-shrink-0 ${isDisabled ? "text-muted-foreground" : "text-foreground"}`}>
              £{Number(dish.price).toFixed(2)}
            </span>
          </div>

          {(isUnavailable || isSoldOut) && (
            <div className="flex gap-1 mb-1">
              {isUnavailable && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Unavailable</Badge>}
              {isSoldOut && <Badge className="text-[10px] px-1.5 py-0 bg-amber-500/15 text-amber-700 border-amber-500/30 hover:bg-amber-500/20">Sold out</Badge>}
            </div>
          )}

          {dish.description && (
            <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">
              {dish.description}
            </p>
          )}

          <div className="flex items-end justify-between gap-2 mt-auto pt-2">
            {dish.tags && dish.tags.length > 0 ? (
              <div className="flex gap-1 flex-wrap">
                {dish.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full"
                  >
                    <span>{getTagEmoji(tag)}</span>
                  </span>
                ))}
              </div>
            ) : <span />}

            {!isDisabled && (
              <button
                className="w-8 h-8 rounded-full bg-purple text-white flex items-center justify-center hover:bg-purple/90 active:scale-95 transition-all flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(dish);
                }}
                aria-label={`Add ${dish.name}`}
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
