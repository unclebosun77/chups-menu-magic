import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import UniversalRestaurantCard from "@/components/restaurant/UniversalRestaurantCard";
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
      
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {sortedRestaurants.map((restaurant) => (
          <UniversalRestaurantCard 
            key={restaurant.id} 
            restaurant={{
              id: restaurant.id,
              name: restaurant.name,
              cuisine: restaurant.cuisine,
              description: restaurant.description,
              address: restaurant.address,
              ambience: restaurant.ambience,
              priceLevel: restaurant.priceLevel,
              matchScore: restaurant.matchScore,
              aiReason: restaurant.aiReason,
              isOpen: restaurant.isOpen,
              distance: restaurant.distance,
              rating: restaurant.rating,
              logoUrl: restaurant.logoUrl,
              imageUrl: restaurant.imageUrl,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default YourNextSpotSection;
