import { Star, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoMenuItem } from "@/data/demoRestaurantMenus";

interface SignatureDishCardProps {
  item: DemoMenuItem;
  onAddToOrder: (item: DemoMenuItem) => void;
}

const SignatureDishCard = ({ item, onAddToOrder }: SignatureDishCardProps) => {
  return (
    <div 
      className="flex-shrink-0 w-56 rounded-2xl overflow-hidden bg-gradient-to-br from-card via-card to-purple/5 border border-border/40 shadow-md hover:shadow-xl hover:border-purple/30 transition-all duration-300 group cursor-pointer"
      onClick={() => onAddToOrder(item)}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple/10 to-purple/5 flex items-center justify-center">
            <Star className="h-10 w-10 text-purple/30" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Signature Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-purple text-white px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-lg">
          <Star className="h-3 w-3 fill-white" />
          Signature
        </div>
        
        {/* Quick Add Button */}
        <Button
          size="icon"
          className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-white shadow-xl hover:bg-white/90 text-purple opacity-0 group-hover:opacity-100 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            onAddToOrder(item);
          }}
        >
          <Plus className="h-5 w-5" />
        </Button>

        {/* Price on Image */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-card/95 backdrop-blur-sm text-foreground font-bold text-sm shadow-lg">
          £{item.price.toFixed(2)}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-[15px] text-foreground mb-1.5 line-clamp-1 group-hover:text-purple transition-colors">
          {item.name}
        </h3>
        <p className="text-[12px] text-muted-foreground/70 line-clamp-2 leading-relaxed mb-3">
          {item.description}
        </p>
        
        {/* Outa Recommendation */}
        <div className="flex items-center gap-1.5 text-[11px] text-purple/80">
          <Sparkles className="h-3 w-3" />
          <span>Chef's recommendation</span>
        </div>
      </div>
    </div>
  );
};

export default SignatureDishCard;
