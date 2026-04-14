import { useMemo, useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, CalendarCheck, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { supabase } from "@/integrations/supabase/client";
import { isRestaurantOpen } from "@/utils/openingHours";

type PickItem = {
  id: string;
  name: string;
  cuisine: string;
  imageUrl: string;
  logoUrl?: string;
  matchScore: number;
  isOpen: boolean;
  priceLevel: string;
  rating: number;
  distance: string;
};

const TonightsPickHero = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const navigate = useNavigate();
  const { shouldBoostCuisine, behavior, addRestaurantVisit } = useUserBehavior();
  const [restaurants, setRestaurants] = useState<PickItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase
          .from("restaurants")
          .select("id, name, cuisine_type, logo_url, gallery_images, address, is_open, hours, is_temporarily_closed")
          .eq("status", "active");

        if (data) {
          const mapped: PickItem[] = data.map((r) => {
            const galleryImages = Array.isArray(r.gallery_images) ? r.gallery_images : [];
            const coverImage = (galleryImages[0] as string) || "";
            return {
              id: r.id,
              name: r.name,
              cuisine: r.cuisine_type,
              imageUrl: coverImage || r.logo_url || "",
              logoUrl: r.logo_url || "",
              matchScore: 75,
              isOpen: isRestaurantOpen(r.hours as Record<string, string> | null, r.is_temporarily_closed),
              priceLevel: "££",
              rating: 4.5,
              distance: "Nearby",
            };
          });
          setRestaurants(mapped);
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [refreshKey]);

  const pick = useMemo(() => {
    return restaurants
      .filter((r) => r.isOpen)
      .map((r) => ({
        ...r,
        score:
          (shouldBoostCuisine(r.cuisine) ? 5 : 0) +
          (behavior.visitedRestaurants.some((v) => v.cuisine === r.cuisine) ? 3 : 0) +
          r.matchScore / 10,
      }))
      .sort((a, b) => b.score - a.score)[0];
  }, [shouldBoostCuisine, behavior.visitedRestaurants, restaurants]);

  const handleNavigate = useCallback(() => {
    if (!pick) return;
    addRestaurantVisit({ id: pick.id, name: pick.name, cuisine: pick.cuisine });
    navigate(`/restaurant/${pick.id}`);
  }, [navigate, pick, addRestaurantVisit]);

  if (loading) {
    return (
      <section>
        <h2 className="text-[13px] font-semibold text-muted-foreground tracking-tight mb-2.5">
          Tonight's pick 🔥
        </h2>
        <Skeleton className="w-full aspect-[16/9] rounded-2xl" />
      </section>
    );
  }

  if (!pick) return null;

  const hasImage = !!pick.imageUrl;

  return (
    <section>
      <h2 className="text-[13px] font-semibold text-muted-foreground tracking-tight mb-2.5">
        Tonight's pick 🔥
      </h2>

      <div
        className="relative overflow-hidden rounded-2xl cursor-pointer active:scale-[0.99] transition-transform"
        onClick={handleNavigate}
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          {hasImage ? (
            <img src={pick.imageUrl} alt={pick.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.svg'; }} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple/80 to-purple/40 flex items-center justify-center">
              <span className="text-5xl font-bold text-white/80">{pick.name[0]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute top-3 right-3 bg-purple text-primary-foreground px-2.5 py-1 rounded-full text-[11px] font-bold shadow-lg">
            {pick.matchScore}% match
          </div>

          <div className="absolute top-3 left-3 flex items-center gap-1 bg-green-500/90 text-white px-2 py-0.5 rounded-full text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Open now
          </div>

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
