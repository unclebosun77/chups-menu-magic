import { useState, useMemo } from "react";
import DishCard from "./DishCard";
import { seedDishes, dishCategories, type DishCategory } from "@/data/dishes";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { useSearch } from "@/context/SearchContext";

const ExploreDishesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState<DishCategory>("All");
  const { behavior, shouldBoostCuisine } = useUserBehavior();
  const { highlightedCuisine } = useSearch();

  const filteredDishes = useMemo(() => {
    const baseDishes = selectedCategory === "All" ? [...seedDishes] : seedDishes.filter(dish => dish.category === selectedCategory);
    const withScores = baseDishes.map(dish => ({
      dish,
      boostScore: (shouldBoostCuisine(dish.category) ? 3 : 0) + (highlightedCuisine && dish.category.toLowerCase().includes(highlightedCuisine.toLowerCase()) ? 5 : 0)
    }));
    withScores.sort((a, b) => b.boostScore - a.boostScore);
    return withScores.map(item => item.dish);
  }, [selectedCategory, shouldBoostCuisine, highlightedCuisine]);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2 tracking-tight">
          🍽️ Explore Dishes
        </h2>
        <p className="text-[11px] text-muted-foreground/50 mt-1">Craving something specific?</p>
      </div>
      
      {/* Category Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        {dishCategories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              selectedCategory === category 
                ? "bg-purple text-primary-foreground" 
                : "bg-card text-foreground border border-border/60 hover:border-purple/20"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Dish Cards Grid */}
      {filteredDishes.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground/60 text-[11px]">No dishes found in this category</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {filteredDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreDishesSection;
