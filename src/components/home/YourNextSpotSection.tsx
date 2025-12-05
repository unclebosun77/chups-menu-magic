import { useMemo } from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PersonalizedRestaurantCard from "./PersonalizedRestaurantCard";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { useSearch } from "@/context/SearchContext";

const YourNextSpotSection = () => {
  const navigate = useNavigate();
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
      {/* Premium Section Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple/12 via-purple/8 to-neon-pink/6 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_3px_10px_-3px_rgba(139,92,246,0.15)] animate-[iconFloat_0.4s_ease-out_forwards]"
            style={{ opacity: 0 }}
          >
            <span className="text-lg">🌙</span>
          </div>
          <div>
            <h2 
              className="text-[17px] font-bold text-foreground tracking-tight animate-[titleSlide_0.4s_ease-out_forwards]"
              style={{ opacity: 0, animationDelay: '80ms' }}
            >
              Your Next Spot
            </h2>
            <p 
              className="text-[11px] text-muted-foreground/50 flex items-center gap-1.5 mt-0.5 font-light animate-[subtitleFade_0.45s_ease-out_forwards]"
              style={{ opacity: 0, animationDelay: '150ms' }}
            >
              AI picks based on your taste
              <Sparkles className="h-2.5 w-2.5 text-purple/60 animate-[sparkle_2s_ease-in-out_infinite]" />
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/your-next-spot')}
          className="flex items-center gap-1 text-[11px] font-medium text-purple/70 hover:text-purple transition-colors animate-[fadeIn_0.4s_ease-out_forwards]"
          style={{ opacity: 0, animationDelay: '200ms' }}
        >
          See all
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
      
      {/* Premium Card Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        {sortedRestaurants.map((restaurant, index) => (
          <div
            key={restaurant.id}
            className="animate-[cardSlideIn_0.45s_ease-out_forwards]"
            style={{ 
              opacity: 0, 
              animationDelay: `${250 + index * 100}ms` 
            }}
          >
            <PersonalizedRestaurantCard restaurant={restaurant} />
          </div>
        ))}
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes iconFloat {
          from {
            opacity: 0;
            transform: scale(0.85) translateY(4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes titleSlide {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes subtitleFade {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes cardSlideIn {
          from {
            opacity: 0;
            transform: translateX(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 1;
            transform: rotate(0deg);
          }
          50% {
            opacity: 0.7;
            transform: rotate(10deg);
          }
        }
      `}</style>
    </div>
  );
};

export default YourNextSpotSection;