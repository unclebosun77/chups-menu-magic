import { Sparkles } from "lucide-react";
import PersonalizedRestaurantCard from "./PersonalizedRestaurantCard";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";

const YourNextSpotSection = () => {
  return (
    <div>
      <div className="mb-2">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          🌙 Your Next Spot
        </h2>
        <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
          Picked for you <Sparkles className="h-2.5 w-2.5 text-purple" />
        </p>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
        {personalizedRestaurants.map((restaurant) => (
          <PersonalizedRestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
};

export default YourNextSpotSection;
