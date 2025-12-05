import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoMenuItem, getTagEmoji, getTagLabel } from "@/data/demoRestaurantMenus";

interface PremiumMenuItemCardProps {
  item: DemoMenuItem;
  onAddToOrder: (item: DemoMenuItem) => void;
}

const PremiumMenuItemCard = ({ item, onAddToOrder }: PremiumMenuItemCardProps) => {
  return (
    <div className="bg-card rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="flex p-4 gap-4">
        {/* Left: Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Name & Price Row */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-semibold text-[15px] text-foreground leading-tight">
                {item.name}
              </h3>
              <span className="font-bold text-purple text-[15px] shrink-0">
                £{item.price}
              </span>
            </div>
            
            {/* Description */}
            <p className="text-[13px] text-muted-foreground/70 leading-relaxed line-clamp-2 mb-3">
              {item.description}
            </p>
          </div>
          
          {/* Tags & Add Button */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {item.tags.slice(0, 4).map((tag) => (
                <span 
                  key={tag} 
                  className="text-[11px] bg-secondary/60 text-muted-foreground px-2 py-0.5 rounded-full flex items-center gap-0.5"
                  title={getTagLabel(tag)}
                >
                  <span>{getTagEmoji(tag)}</span>
                  <span className="hidden sm:inline">{getTagLabel(tag)}</span>
                </span>
              ))}
            </div>
            
            <Button
              size="sm"
              className="h-8 px-3 rounded-full bg-purple hover:bg-purple-hover text-white text-xs font-medium shadow-sm"
              onClick={(e) => { 
                e.stopPropagation(); 
                onAddToOrder(item); 
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
        </div>
        
        {/* Right: Image */}
        {item.image && (
          <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumMenuItemCard;
