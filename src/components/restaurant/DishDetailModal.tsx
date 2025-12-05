import { useState } from "react";
import { X, Plus, Minus, Sparkles, Flame, Leaf, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DemoMenuItem, getTagLabel } from "@/data/demoRestaurantMenus";

interface DishDetailModalProps {
  item: DemoMenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToOrder: (item: DemoMenuItem, quantity: number) => void;
}

const tagConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  spicy: { icon: <Flame className="h-3.5 w-3.5" />, color: "bg-orange-100 text-orange-600 border-orange-200" },
  vegan: { icon: <Leaf className="h-3.5 w-3.5" />, color: "bg-green-100 text-green-600 border-green-200" },
  popular: { icon: <Star className="h-3.5 w-3.5" />, color: "bg-purple/10 text-purple border-purple/20" },
  signature: { icon: <Award className="h-3.5 w-3.5" />, color: "bg-amber-100 text-amber-600 border-amber-200" },
  vegetarian: { icon: <Leaf className="h-3.5 w-3.5" />, color: "bg-green-100 text-green-600 border-green-200" },
  "gluten-free": { icon: <Sparkles className="h-3.5 w-3.5" />, color: "bg-blue-100 text-blue-600 border-blue-200" },
};

const DishDetailModal = ({ item, open, onOpenChange, onAddToOrder }: DishDetailModalProps) => {
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    onAddToOrder(item, quantity);
    setQuantity(1);
    onOpenChange(false);
  };

  const incrementQuantity = () => setQuantity(q => q + 1);
  const decrementQuantity = () => setQuantity(q => Math.max(1, q - 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden bg-background border-border/50">
        <DialogTitle className="sr-only">{item.name}</DialogTitle>
        
        {/* Image Section */}
        <div className="relative h-56 bg-secondary">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple/10 to-purple/5">
              <span className="text-6xl">🍽️</span>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 p-2 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card transition-colors"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
          
          {/* Price Badge */}
          <div className="absolute bottom-3 right-3 px-4 py-2 rounded-full bg-purple text-white font-bold text-lg shadow-lg">
            £{item.price.toFixed(2)}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-4">
          {/* Name & Category */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">{item.name}</h2>
            <p className="text-sm text-muted-foreground/70 capitalize">{item.category}</p>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => {
                const config = tagConfig[tag] || { icon: <Sparkles className="h-3.5 w-3.5" />, color: "bg-secondary text-foreground border-border" };
                return (
                  <span 
                    key={tag}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config.color}`}
                  >
                    {config.icon}
                    {getTagLabel(tag)}
                  </span>
                );
              })}
            </div>
          )}

          {/* Outa Recommendation */}
          <div className="bg-gradient-to-br from-purple/10 via-purple/5 to-transparent border border-purple/20 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-purple" />
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Outa recommends:</span> This dish is a popular choice and pairs well with our signature drinks.
            </p>
          </div>

          {/* Quantity & Add Section */}
          <div className="flex items-center justify-between pt-2">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3 bg-secondary/50 rounded-full p-1">
              <button
                onClick={decrementQuantity}
                className="w-9 h-9 rounded-full bg-card flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-bold text-lg">{quantity}</span>
              <button
                onClick={incrementQuantity}
                className="w-9 h-9 rounded-full bg-card flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add Button */}
            <Button
              onClick={handleAdd}
              className="h-12 px-6 rounded-full bg-purple hover:bg-purple-hover text-white font-semibold shadow-lg shadow-purple/30"
            >
              Add · £{(item.price * quantity).toFixed(2)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DishDetailModal;
