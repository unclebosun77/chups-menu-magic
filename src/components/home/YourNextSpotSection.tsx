import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { useSearch } from "@/context/SearchContext";

const YourNextSpotSection = () => {
  const { shouldBoostCuisine, behavior } = useUserBehavior();
  const { highlightedCuisine } = useSearch();

  // Sort restaurants based on user behavior
  const sortedRestaurants = useMemo(() => {
    return [...personalizedRestaurants]
      .map(restaurant => ({
        ...restaurant,
        boostScore: (
          (shouldBoostCuisine(restaurant.cuisine) ? 5 : 0) +
          (behavior.visitedRestaurants.some(r => r.cuisine === restaurant.cuisine) ? 3 : 0) +
          (highlightedCuisine && restaurant.cuisine.toLowerCase().includes(highlightedCuisine.toLowerCase()) ? 10 : 0) +
          restaurant.matchScore / 10
        )
      }))
      .sort((a, b) => (b.boostScore || 0) - (a.boostScore || 0));
  }, [shouldBoostCuisine, behavior.visitedRestaurants, highlightedCuisine]);

  // Transform to RestaurantCard format
  const transformedRestaurants = sortedRestaurants.map(r => ({
    id: r.id,
    name: r.name,
    rating: r.rating,
    cuisine: r.cuisine,
    price_level: r.priceLevel,
    description: r.description,
    images: [r.imageUrl],
  }));

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2 tracking-tight">
          🌙 Your Next Spot
        </h2>
        <p className="text-[11px] text-muted-foreground/50 flex items-center gap-1 mt-1">
          Picked for you <Sparkles className="h-2.5 w-2.5 text-purple/60" />
        </p>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {transformedRestaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
};

export default YourNextSpotSection;
