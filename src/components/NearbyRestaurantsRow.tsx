import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/context/LocationContext";
import { useTasteProfile } from "@/context/TasteProfileContext";
import { useLiveRecommendations } from "@/hooks/useLiveRecommendations";
import PremiumRestaurantCard from "@/components/home/PremiumRestaurantCard";
import { cn } from "@/lib/utils";

interface NearbyRestaurantsRowProps {
  restaurants?: any[];
  className?: string;
}

const NearbyRestaurantsRow = ({ restaurants, className }: NearbyRestaurantsRowProps) => {
  const navigate = useNavigate();
  const { currentRegion } = useLocation();
  const { recommendations, isRefreshing, nearbyCount, refresh } = useLiveRecommendations(restaurants, {
    limit: 6,
  });

  // Map recommendations to restaurant card format
  const nearbyRestaurants = useMemo(() => {
    return recommendations.map(rec => ({
      id: rec.id,
      name: rec.name,
      cuisine_type: rec.cuisine,
      description: rec.reasonForRecommendation,
      logo_url: null,
      is_open: true,
      latitude: rec.latitude,
      longitude: rec.longitude,
      matchScore: rec.combinedScore,
      aiReason: rec.nearbyReason,
    }));
  }, [recommendations]);

  if (nearbyRestaurants.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-500/10 flex items-center justify-center border border-blue-500/10">
            <MapPin className="h-4 w-4 text-blue-400" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              Near You
            </h2>
            <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1.5">
              {nearbyCount} spots in {currentRegion}
              <Sparkles className="h-2.5 w-2.5 text-purple/60" />
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={isRefreshing}
          className="text-xs text-purple hover:text-purple-hover hover:bg-purple/5 rounded-full"
        >
          <RefreshCw className={cn("h-3.5 w-3.5 mr-1", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Cards Carousel */}
      <div className={cn(
        "flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide transition-opacity duration-300",
        isRefreshing && "opacity-50"
      )}>
        {isRefreshing ? (
          // Shimmer loading state
          [1, 2, 3].map(i => (
            <div
              key={i}
              className="flex-shrink-0 w-[160px] h-[180px] rounded-2xl bg-secondary/50 shimmer-loading animate-pulse"
            />
          ))
        ) : (
          nearbyRestaurants.map((restaurant, index) => (
            <div
              key={restaurant.id}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <PremiumRestaurantCard
                restaurant={restaurant}
                variant="compact"
                index={index}
                showAiTags={false}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NearbyRestaurantsRow;
