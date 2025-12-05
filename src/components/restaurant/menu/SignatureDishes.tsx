import { Star } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DemoMenuItem } from "@/data/demoRestaurantMenus";

interface SignatureDishesProps {
  dishes: DemoMenuItem[];
  onSelectDish: (dish: DemoMenuItem) => void;
}

const SignatureDishes = ({ dishes, onSelectDish }: SignatureDishesProps) => {
  if (dishes.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2 tracking-tight px-5">
        <Star className="h-5 w-5 text-purple fill-purple/30" />
        Signature Picks
      </h2>
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-2 px-5">
          {dishes.map((dish) => (
            <div 
              key={dish.id}
              className="flex-shrink-0 w-44 overflow-hidden rounded-2xl bg-card border border-border/40 shadow-sm hover:shadow-lg hover:border-purple/30 transition-all cursor-pointer group"
              onClick={() => onSelectDish(dish)}
            >
              <div className="relative aspect-[4/3]">
                {dish.image ? (
                  <img 
                    src={dish.image} 
                    alt={dish.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple/20 to-secondary flex items-center justify-center">
                    <span className="text-4xl">🍽️</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white font-semibold text-sm line-clamp-1">{dish.name}</p>
                  <p className="text-white/90 font-bold text-sm">£{dish.price}</p>
                </div>
                {/* Chef's pick badge */}
                <div className="absolute top-2 right-2 bg-purple/90 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                  ⭐ Signature
                </div>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default SignatureDishes;
