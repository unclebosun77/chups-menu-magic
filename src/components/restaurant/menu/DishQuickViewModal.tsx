import { useState } from "react";
import { X, Minus, Plus, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoMenuItem } from "@/data/demoRestaurantMenus";

interface DishQuickViewModalProps {
  dish: DemoMenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToOrder: (dish: DemoMenuItem, quantity: number) => void;
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

const getTagLabel = (tag: string): string => {
  const labels: Record<string, string> = {
    spicy: "Spicy",
    veg: "Vegetarian",
    vegan: "Vegan",
    "gluten-free": "Gluten-Free",
    popular: "Popular",
    "chef-pick": "Chef's Pick",
    sharing: "Great for Sharing"
  };
  return labels[tag] || tag;
};

const DishQuickViewModal = ({ dish, open, onOpenChange, onAddToOrder }: DishQuickViewModalProps) => {
  const [quantity, setQuantity] = useState(1);

  if (!dish) return null;

  const handleAddToOrder = () => {
    onAddToOrder(dish, quantity);
    setQuantity(1);
    onOpenChange(false);
  };

  const handleClose = () => {
    setQuantity(1);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 gap-0 rounded-3xl overflow-hidden border-0 bg-card">
        {/* Hero Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {dish.image ? (
            <img 
              src={dish.image} 
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple/20 to-secondary flex items-center justify-center">
              <span className="text-6xl">🍽️</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Close button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Title on image */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white mb-1">{dish.name}</h2>
            <p className="text-xl font-bold text-white/90">£{dish.price}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Tags */}
          {dish.tags && dish.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dish.tags.map((tag) => (
                <Badge 
                  key={tag}
                  variant="secondary" 
                  className="text-xs bg-secondary/60 text-muted-foreground border-0 rounded-full px-3 py-1"
                >
                  {getTagEmoji(tag)} {getTagLabel(tag)}
                </Badge>
              ))}
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {dish.description || "A delicious dish prepared with the finest ingredients."}
          </p>

          {/* AI Recommendation */}
          <div className="bg-purple/10 border border-purple/20 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-purple">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">Recommended for you based on your taste profile</span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between py-3 border-y border-border/50">
            <span className="font-medium text-sm text-foreground">Quantity</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full border-border/50"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-bold w-8 text-center text-foreground">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full border-border/50"
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add to Order Button */}
          <Button
            className="w-full h-14 bg-purple hover:bg-purple/90 text-white rounded-2xl text-[15px] font-semibold shadow-lg"
            onClick={handleAddToOrder}
          >
            Add {quantity} to Order · £{(dish.price * quantity).toFixed(2)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DishQuickViewModal;
