import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Sparkles, Clock, UtensilsCrossed, CalendarCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { useSearch } from "@/context/SearchContext";

const TonightsPickCard = () => {
  const navigate = useNavigate();
  const { shouldBoostCuisine, behavior, addRestaurantVisit } = useUserBehavior();
  const { highlightedCuisine } = useSearch();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Rank all restaurants, take top 3
  const picks = useMemo(() => {
    return [...personalizedRestaurants]
      .map(r => ({
        ...r,
        score:
          (shouldBoostCuisine(r.cuisine) ? 5 : 0) +
          (behavior.visitedRestaurants.some(v => v.cuisine === r.cuisine) ? 3 : 0) +
          (highlightedCuisine && r.cuisine.toLowerCase().includes(highlightedCuisine.toLowerCase()) ? 10 : 0) +
          r.matchScore / 10
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [shouldBoostCuisine, behavior.visitedRestaurants, highlightedCuisine]);

  const pick = picks[currentIndex];

  const handleGo = useCallback(() => {
    if (!pick) return;
    addRestaurantVisit({ id: pick.id, name: pick.name, cuisine: pick.cuisine });
    navigate(`/restaurant/${pick.id}`);
  }, [navigate, pick, addRestaurantVisit]);

  const handleSkip = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % picks.length);
  }, [picks.length]);

  const handleViewMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!pick) return;
    addRestaurantVisit({ id: pick.id, name: pick.name, cuisine: pick.cuisine });
    navigate(`/restaurant/${pick.id}`);
  }, [navigate, pick, addRestaurantVisit]);

  if (!pick) return null;

  // Get today's hours
  const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
  const hoursEntry = pick.openingHours
    ? Object.entries(pick.openingHours).find(([days]) => days.includes(today))
    : null;
  const todayHours = hoursEntry ? hoursEntry[1] : "Check hours";

  return (
    <div className="space-y-3">
      {/* Pick counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-purple" />
          <span className="text-[12px] font-semibold text-foreground">
            Pick {currentIndex + 1} of {picks.length}
          </span>
        </div>
        {picks.length > 1 && (
          <button
            onClick={handleSkip}
            className="flex items-center gap-0.5 text-[11px] font-medium text-purple hover:text-purple/80 transition-colors active:scale-95"
          >
            Skip
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Card */}
      <div
        key={pick.id}
        className="relative overflow-hidden rounded-3xl bg-card border border-border/40 shadow-[var(--shadow-card)] animate-[fadeIn_0.3s_ease-out_forwards]"
      >
        {/* Hero image */}
        <div className="relative aspect-[16/9] overflow-hidden cursor-pointer" onClick={handleGo}>
          <img src={pick.imageUrl} alt={pick.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Match score */}
          <div className="absolute top-3 right-3 bg-purple/90 text-primary-foreground px-2.5 py-1 rounded-full text-[11px] font-bold">
            {pick.matchScore}% match
          </div>

          {/* Restaurant info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-card/50 shadow-sm">
                  <img src={pick.logoUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">{pick.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-white/80 text-[11px]">{pick.cuisine}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-white/80 text-[11px]">{pick.priceLevel}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-full px-2 py-1">
                <Star className="h-3 w-3 fill-white text-white" />
                <span className="text-white text-[12px] font-semibold">{pick.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decision content */}
        <div className="p-4 space-y-3">
          {/* AI reason */}
          <div className="flex items-start gap-2.5 bg-purple/5 rounded-xl p-3">
            <Sparkles className="h-3.5 w-3.5 text-purple mt-0.5 flex-shrink-0" />
            <p className="text-[12px] text-foreground/80 leading-relaxed">{pick.aiReason}</p>
          </div>

          {/* Key info row */}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-purple/60" />
              <span>{pick.distance}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-purple/60" />
              <span className={pick.isOpen ? "text-green-600 font-medium" : "text-destructive"}>
                {pick.isOpen ? todayHours : "Closed today"}
              </span>
            </div>
            <div className="flex gap-1 ml-auto">
              {pick.ambience.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0 rounded-full bg-secondary/50 text-muted-foreground">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Signature dishes hint */}
          {pick.signatureDishes && (
            <p className="text-[10px] text-muted-foreground/60">
              <span className="font-medium text-foreground/60">Try:</span>{" "}
              {pick.signatureDishes.slice(0, 2).join(" · ")}
            </p>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={handleViewMenu}
              className="rounded-xl h-10 text-[12px] font-medium border-border/50 hover:bg-secondary/30"
            >
              <UtensilsCrossed className="h-3.5 w-3.5 mr-1.5" />
              Menu
            </Button>
            <Button
              variant="outline"
              onClick={(e) => e.stopPropagation()}
              className="rounded-xl h-10 text-[12px] font-medium border-border/50 hover:bg-secondary/30"
            >
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              Hours
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleGo();
              }}
              className="rounded-xl h-10 text-[12px] font-semibold bg-purple text-primary-foreground hover:bg-purple/90"
            >
              <CalendarCheck className="h-3.5 w-3.5 mr-1.5" />
              Book
            </Button>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      {picks.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {picks.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? "w-5 bg-purple"
                  : "w-1.5 bg-muted-foreground/20 hover:bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TonightsPickCard;
