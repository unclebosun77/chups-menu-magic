import { useMemo, useCallback, useState, useEffect } from "react";
import { isRestaurantOpen } from "@/utils/openingHours";
import { useNavigate } from "react-router-dom";
import { Sparkles, Star, MapPin, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { useSearch } from "@/context/SearchContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type PickItem = {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  description: string;
  priceLevel: string;
  matchScore: number;
  aiReason: string;
  isOpen: boolean;
  distance: string;
  rating: number;
  logoUrl: string;
  imageUrl?: string;
};

const PickedForYouSection = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const navigate = useNavigate();
  const { shouldBoostCuisine, behavior, addRestaurantVisit } = useUserBehavior();
  const { highlightedCuisine } = useSearch();
  const [supabaseRestaurants, setSupabaseRestaurants] = useState<PickItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch restaurants from Supabase and merge with demo data
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data, error } = await supabase
          .from("restaurants")
          .select("id, name, cuisine_type, description, logo_url, address, city, is_open, latitude, longitude, hours, is_temporarily_closed, crowd_level, crowd_updated_at")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Convert Supabase restaurants to PickItem format, excluding those already in demo data
        const demoIds = new Set(personalizedRestaurants.map(r => r.id));
        const newRestaurants: PickItem[] = (data || [])
          .filter(r => !demoIds.has(r.id))
          .map(r => ({
            id: r.id,
            name: r.name,
            cuisine: r.cuisine_type,
            address: r.address || r.city || "",
            description: r.description || "",
            priceLevel: "££",
            matchScore: 75 + Math.floor(Math.random() * 15),
            aiReason: `Newly added ${r.cuisine_type} spot — check it out.`,
            isOpen: isRestaurantOpen(r.hours as any, r.is_temporarily_closed),
            distance: "Nearby",
            rating: 4.5,
            logoUrl: r.logo_url || "",
          }));

        setSupabaseRestaurants(newRestaurants);
      } catch (err) {
        console.error("Failed to fetch restaurants:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [refreshKey]);

  const picks = useMemo(() => {
    const allRestaurants: PickItem[] = [
      ...personalizedRestaurants.map(r => ({
        ...r,
        imageUrl: (r as any).imageUrl,
      })),
      ...supabaseRestaurants,
    ];

    return allRestaurants
      .map(r => ({
        ...r,
        score:
          (shouldBoostCuisine(r.cuisine) ? 5 : 0) +
          (behavior.visitedRestaurants.some(v => v.cuisine === r.cuisine) ? 3 : 0) +
          (highlightedCuisine && r.cuisine.toLowerCase().includes(highlightedCuisine.toLowerCase()) ? 10 : 0) +
          r.matchScore / 10,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [shouldBoostCuisine, behavior.visitedRestaurants, highlightedCuisine, supabaseRestaurants]);

  const handleBook = useCallback(
    (pick: (typeof picks)[0], e: React.MouseEvent) => {
      e.stopPropagation();
      addRestaurantVisit({ id: pick.id, name: pick.name, cuisine: pick.cuisine });
      navigate(`/restaurant/${pick.id}`);
    },
    [navigate, addRestaurantVisit],
  );

  const handleCardTap = useCallback(
    (pick: (typeof picks)[0]) => {
      addRestaurantVisit({ id: pick.id, name: pick.name, cuisine: pick.cuisine });
      navigate(`/restaurant/${pick.id}`);
    },
    [navigate, addRestaurantVisit],
  );

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="h-4 w-4 text-purple" />
          <h2 className="text-[15px] font-bold text-foreground tracking-tight">Picked for you</h2>
        </div>
        <div className="flex gap-3 overflow-hidden -mx-4 px-4">
          {[1, 2].map(i => (
            <div key={i} className="flex-shrink-0 w-[75vw] max-w-[310px] rounded-2xl overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (picks.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles className="h-4 w-4 text-purple" />
        <h2 className="text-[15px] font-bold text-foreground tracking-tight">
          Picked for you
        </h2>
      </div>

      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
          {picks.map((pick) => (
            <div
              key={pick.id}
              onClick={() => handleCardTap(pick)}
              className="flex-shrink-0 w-[75vw] max-w-[310px] snap-start rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
            >
              {/* Logo hero */}
              <div className="relative aspect-[4/3] overflow-hidden bg-muted/30 flex items-center justify-center">
                {pick.logoUrl ? (
                  <img
                    src={pick.logoUrl}
                    alt={`${pick.name} logo`}
                    className="w-24 h-24 object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">{pick.name[0]}</span>
                  </div>
                )}

                {/* Match badge */}
                <div className="absolute top-2.5 right-2.5 bg-purple/90 text-primary-foreground px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {pick.matchScore}% match
                </div>
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                <div>
                  <h3 className="text-[15px] font-bold text-foreground leading-tight">
                    {pick.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-muted-foreground text-[11px]">{pick.cuisine}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-muted-foreground text-[11px]">{pick.priceLevel}</span>
                  </div>
                </div>

                {/* AI reason */}
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {pick.aiReason}
                </p>

                {/* Meta row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-purple text-purple" />
                      <span className="font-medium text-foreground">{pick.rating}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      <span>{pick.distance}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={(e) => handleBook(pick, e)}
                    className="h-7 px-3 rounded-xl text-[11px] font-semibold bg-purple text-primary-foreground hover:bg-purple/90"
                  >
                    <CalendarCheck className="h-3 w-3 mr-1" />
                    Book
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Fade hint on right edge */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
};

export default PickedForYouSection;
