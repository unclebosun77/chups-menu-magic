import { DemoMenuItem } from "@/data/demoRestaurantMenus";
import DishCard from "./DishCard";

interface MenuCategoryProps {
  title: string;
  dishes: DemoMenuItem[];
  onSelectDish: (dish: DemoMenuItem) => void;
}

const MenuCategory = ({ title, dishes, onSelectDish }: MenuCategoryProps) => {
  if (dishes.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Category Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground tracking-tight capitalize">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground/60">
          {dishes.length} {dishes.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {/* Dish List */}
      <div className="space-y-3">
        {dishes.map((dish) => (
          <DishCard 
            key={dish.id} 
            dish={dish} 
            onSelect={onSelectDish}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuCategory;
