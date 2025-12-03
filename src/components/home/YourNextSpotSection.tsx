import { Sparkles } from "lucide-react";
import PersonalizedRestaurantCard from "./PersonalizedRestaurantCard";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";

const YourNextSpotSection = () => {
  return (
    <div>
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          🌙 Your Next Spot
        </h2>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          Picked for you <Sparkles className="h-3 w-3 text-purple" />
        </p>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
        {personalizedRestaurants.map((restaurant) => (
          <PersonalizedRestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
};

export default YourNextSpotSection;
