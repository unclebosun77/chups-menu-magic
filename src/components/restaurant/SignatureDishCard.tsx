import { Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoMenuItem } from "@/data/demoRestaurantMenus";

interface SignatureDishCardProps {
  item: DemoMenuItem;
  onAddToOrder: (item: DemoMenuItem) => void;
}

const SignatureDishCard = ({ item, onAddToOrder }: SignatureDishCardProps) => {
  return (
    <div 
      className="flex-shrink-0 w-52 rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
      onClick={() => onAddToOrder(item)}
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <Star className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Signature Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-purple/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-medium">
          <Star className="h-3 w-3 fill-white" />
          Signature
        </div>
        
        {/* Quick Add Button */}
        <Button
          size="icon"
          className="absolute bottom-2.5 right-2.5 h-8 w-8 rounded-full bg-white shadow-lg hover:bg-white/90 text-purple opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onAddToOrder(item);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Content */}
      <div className="p-3.5">
        <h3 className="font-semibold text-[14px] text-foreground mb-0.5 line-clamp-1">
          {item.name}
        </h3>
        <p className="text-[11px] text-muted-foreground/60 line-clamp-1 mb-2">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-purple text-[15px]">£{item.price}</span>
          <span className="text-[10px] text-muted-foreground/50">Tap to add</span>
        </div>
      </div>
    </div>
  );
};

export default SignatureDishCard;
