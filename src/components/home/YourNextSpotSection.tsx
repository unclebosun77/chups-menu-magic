import { Sparkles } from "lucide-react";
import PersonalizedRestaurantCard from "./PersonalizedRestaurantCard";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";

const YourNextSpotSection = () => {
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
        {personalizedRestaurants.map((restaurant) => (
          <PersonalizedRestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
};

export default YourNextSpotSection;
