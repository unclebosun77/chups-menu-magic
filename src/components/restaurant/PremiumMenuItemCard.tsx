import { useState } from "react";
import { Plus, Flame, Leaf, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoMenuItem, getTagEmoji, getTagLabel } from "@/data/demoRestaurantMenus";
import DishDetailModal from "@/components/restaurant/DishDetailModal";

interface PremiumMenuItemCardProps {
  item: DemoMenuItem;
  onAddToOrder: (item: DemoMenuItem, quantity?: number) => void;
}

const tagIcons: Record<string, React.ReactNode> = {
  spicy: <Flame className="h-3 w-3 text-orange-500" />,
  vegan: <Leaf className="h-3 w-3 text-green-500" />,
  popular: <Star className="h-3 w-3 text-purple" />,
  signature: <Award className="h-3 w-3 text-amber-500" />,
};

const PremiumMenuItemCard = ({ item, onAddToOrder }: PremiumMenuItemCardProps) => {
  const [showQuickView, setShowQuickView] = useState(false);

  return (
    <>
      <div 
        className="bg-card rounded-2xl border border-border/40 shadow-sm hover:shadow-lg hover:border-purple/20 transition-all duration-300 overflow-hidden group cursor-pointer"
        onClick={() => setShowQuickView(true)}
      >
        <div className="flex p-4 gap-4">
          {/* Left: Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              {/* Name */}
              <h3 className="font-bold text-[15px] text-foreground leading-tight mb-1.5 group-hover:text-purple transition-colors">
                {item.name}
              </h3>
              
              {/* Description */}
              <p className="text-[13px] text-muted-foreground/70 leading-relaxed line-clamp-2 mb-3">
                {item.description}
              </p>
            </div>
            
            {/* Tags & Price Row */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 flex-wrap">
                {item.tags.slice(0, 3).map((tag) => (
                  <span 
                    key={tag} 
                    className="text-[10px] bg-secondary/80 text-muted-foreground px-2 py-1 rounded-full flex items-center gap-1 border border-border/30"
                    title={getTagLabel(tag)}
                  >
                    {tagIcons[tag] || <span>{getTagEmoji(tag)}</span>}
                    <span className="font-medium">{getTagLabel(tag)}</span>
                  </span>
                ))}
              </div>
              
              <span className="font-bold text-purple text-base">
                £{item.price.toFixed(2)}
              </span>
            </div>
          </div>
          
          {/* Right: Image with Add Button */}
          <div className="relative w-24 h-24 shrink-0">
            {item.image ? (
              <div className="w-full h-full rounded-xl overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ) : (
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple/10 to-purple/5 flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
            )}
            
            {/* Floating Add Button */}
            <Button
              size="icon"
              className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full bg-purple hover:bg-purple-hover text-white shadow-lg shadow-purple/30 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
              onClick={(e) => { 
                e.stopPropagation(); 
                onAddToOrder(item); 
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <DishDetailModal
        item={item}
        open={showQuickView}
        onOpenChange={setShowQuickView}
        onAddToOrder={onAddToOrder}
      />
    </>
  );
};

export default PremiumMenuItemCard;
