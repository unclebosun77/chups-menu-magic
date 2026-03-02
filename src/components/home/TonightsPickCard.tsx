import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Sparkles, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { useSearch } from "@/context/SearchContext";

const TonightsPickCard = () => {
  const navigate = useNavigate();
  const { shouldBoostCuisine, behavior, addRestaurantVisit } = useUserBehavior();
  const { highlightedCuisine } = useSearch();

  // Pick the single best match
  const topPick = useMemo(() => {
    return [...personalizedRestaurants]
      .map(r => ({
        ...r,
        score:
          (shouldBoostCuisine(r.cuisine) ? 5 : 0) +
          (behavior.visitedRestaurants.some(v => v.cuisine === r.cuisine) ? 3 : 0) +
          (highlightedCuisine && r.cuisine.toLowerCase().includes(highlightedCuisine.toLowerCase()) ? 10 : 0) +
          r.matchScore / 10
      }))
      .sort((a, b) => b.score - a.score)[0];
  }, [shouldBoostCuisine, behavior.visitedRestaurants, highlightedCuisine]);

  const handleGo = useCallback(() => {
    addRestaurantVisit({
      id: topPick.id,
      name: topPick.name,
      cuisine: topPick.cuisine,
    });
    navigate(`/restaurant/${topPick.id}`);
  }, [navigate, topPick, addRestaurantVisit]);

  if (!topPick) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-card border border-border/40 shadow-[var(--shadow-card)]">
      {/* Hero image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={topPick.imageUrl}
          alt={topPick.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Confidence badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-card/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
          <Sparkles className="h-3 w-3 text-purple" />
          <span className="text-[11px] font-semibold text-foreground">Tonight's pick</span>
        </div>

        {/* Match score */}
        <div className="absolute top-3 right-3 bg-purple/90 text-primary-foreground px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
          <span>{topPick.matchScore}% match</span>
        </div>

        {/* Restaurant name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-card/50 shadow-sm">
                  <img src={topPick.logoUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">{topPick.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-white/80 text-[11px]">{topPick.cuisine}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-white/80 text-[11px]">{topPick.priceLevel}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="h-3 w-3 fill-white text-white" />
              <span className="text-white text-[12px] font-semibold">{topPick.rating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision content — minimal, confident */}
      <div className="p-4 space-y-3">
        {/* AI reason — the "why" */}
        <div className="flex items-start gap-2.5 bg-purple/5 rounded-xl p-3">
          <Sparkles className="h-3.5 w-3.5 text-purple mt-0.5 flex-shrink-0" />
          <p className="text-[12px] text-foreground/80 leading-relaxed">
            {topPick.aiReason}
          </p>
        </div>

        {/* Key facts — just enough to decide */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-purple/60" />
            <span>{topPick.distance}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-purple/60" />
            <span className={topPick.isOpen ? "text-green-600 font-medium" : "text-destructive"}>
              {topPick.isOpen ? "Open now" : "Closed"}
            </span>
          </div>
          <div className="flex gap-1 ml-auto">
            {topPick.ambience.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0 rounded-full bg-secondary/50 text-muted-foreground">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Primary CTA — the decision moment */}
        <Button
          onClick={handleGo}
          className="w-full bg-gradient-to-r from-purple to-purple/90 text-primary-foreground rounded-2xl h-12 text-[14px] font-semibold flex items-center justify-center gap-2 shadow-[0_6px_20px_-6px_hsl(var(--purple)/0.4)] hover:shadow-[0_8px_28px_-6px_hsl(var(--purple)/0.5)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-200"
        >
          Let's go here
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TonightsPickCard;
