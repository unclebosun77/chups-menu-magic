import { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, CalendarCheck, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";
import { useUserBehavior } from "@/context/UserBehaviorContext";

const TonightsPickHero = () => {
  const navigate = useNavigate();
  const { shouldBoostCuisine, behavior, addRestaurantVisit } = useUserBehavior();

  const pick = useMemo(() => {
    return [...personalizedRestaurants]
      .filter(r => r.isOpen)
      .map(r => ({
        ...r,
        score:
          (shouldBoostCuisine(r.cuisine) ? 5 : 0) +
          (behavior.visitedRestaurants.some(v => v.cuisine === r.cuisine) ? 3 : 0) +
          r.matchScore / 10,
      }))
      .sort((a, b) => b.score - a.score)[0];
  }, [shouldBoostCuisine, behavior.visitedRestaurants]);

  const handleNavigate = useCallback(() => {
    if (!pick) return;
    addRestaurantVisit({ id: pick.id, name: pick.name, cuisine: pick.cuisine });
    navigate(`/restaurant/${pick.id}`);
  }, [navigate, pick, addRestaurantVisit]);

  if (!pick) return null;

  return (
    <section>
      <h2 className="text-[13px] font-semibold text-muted-foreground tracking-tight mb-2.5">
        Tonight's pick 🔥
      </h2>

      <div
        className="relative overflow-hidden rounded-2xl cursor-pointer active:scale-[0.99] transition-transform"
        onClick={handleNavigate}
      >
        {/* Hero image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <img src={pick.imageUrl} alt={pick.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Match badge */}
          <div className="absolute top-3 right-3 bg-purple text-primary-foreground px-2.5 py-1 rounded-full text-[11px] font-bold shadow-lg">
            {pick.matchScore}% match
          </div>

          {/* Open badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-green-500/90 text-white px-2 py-0.5 rounded-full text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Open now
          </div>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-bold text-white tracking-tight">{pick.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-white/80 text-[12px]">{pick.cuisine}</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80 text-[12px]">{pick.priceLevel}</span>
              <span className="text-white/40">·</span>
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-white text-white" />
                <span className="text-white/90 text-[12px] font-medium">{pick.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-3 bg-card border border-border/40 border-t-0 rounded-b-2xl">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); handleNavigate(); }}
            className="flex-1 rounded-xl h-9 text-[12px] font-medium border-border/50"
          >
            <UtensilsCrossed className="h-3.5 w-3.5 mr-1.5" />
            View menu
          </Button>
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleNavigate(); }}
            className="flex-1 rounded-xl h-9 text-[12px] font-semibold bg-purple text-primary-foreground hover:bg-purple/90"
          >
            <CalendarCheck className="h-3.5 w-3.5 mr-1.5" />
            Reserve a table
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TonightsPickHero;
