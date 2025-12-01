import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus } from "lucide-react";
import { getMenuImage } from "@/utils/menuImageMapper";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  available: boolean;
};

interface DishQuickViewProps {
  dish: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToOrder: (dish: MenuItem, quantity: number) => void;
}

const DishQuickView = ({ dish, isOpen, onClose, onAddToOrder }: DishQuickViewProps) => {
  const [quantity, setQuantity] = useState(1);

  if (!dish) return null;

  const handleAddToOrder = () => {
    onAddToOrder(dish, quantity);
    setQuantity(1);
    onClose();
  };

  const imageUrl = dish.image_url ? getMenuImage(dish.image_url) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{dish.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dish Image */}
          {imageUrl && (
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt={dish.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Dish Details */}
          <div className="space-y-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">{dish.name}</h2>
              <p className="text-2xl font-bold text-primary">
                ${dish.price.toFixed(2)}
              </p>
            </div>

            {/* Category Tag */}
            <div className="flex gap-2">
              <Badge variant="secondary" className="capitalize">
                {dish.category}
              </Badge>
              {!dish.available && (
                <Badge variant="destructive">Unavailable</Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {dish.description || "A popular choice loved for its bold flavours."}
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between py-4 border-y">
              <span className="font-medium">Quantity</span>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-semibold w-8 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Order Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleAddToOrder}
              disabled={!dish.available}
            >
              Add {quantity} to Order - ${(dish.price * quantity).toFixed(2)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DishQuickView;
