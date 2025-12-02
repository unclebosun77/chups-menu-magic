import { useState } from "react";
import DishCard from "./DishCard";
import { seedDishes, dishCategories, type DishCategory } from "@/data/dishes";

const ExploreDishesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState<DishCategory>("All");

  const filteredDishes = selectedCategory === "All" 
    ? seedDishes 
    : seedDishes.filter(dish => dish.category === selectedCategory);

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          🍽️ Explore Dishes
        </h2>
        <p className="text-sm text-muted-foreground">Craving something specific?</p>
      </div>
      
      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
        {dishCategories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category 
                ? "bg-purple text-primary-foreground shadow-sm" 
                : "bg-card text-foreground border border-purple/20 hover:border-purple/40"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Dish Cards Grid */}
      {filteredDishes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">No dishes found in this category</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {filteredDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreDishesSection;
