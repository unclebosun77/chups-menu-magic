import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isRestaurantOpen } from "@/utils/openingHours";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";
import { Skeleton } from "@/components/ui/skeleton";

interface NearbyRestaurant {
  id: string;
  name: string;
  cuisine: string;
  distance: string;
  isOpen: boolean;
  imageUrl?: string;
  logoUrl?: string;
  rating: number;
}

const NearbyOpenSection = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<NearbyRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase
          .from("restaurants")
          .select("id, name, cuisine_type, logo_url, address, is_open, hours, is_temporarily_closed")
          .eq("status", "active");

        const demoIds = new Set(personalizedRestaurants.map(r => r.id));
        const supaItems: NearbyRestaurant[] = (data || [])
          .filter(r => !demoIds.has(r.id))
          .map(r => ({
            id: r.id,
            name: r.name,
            cuisine: r.cuisine_type,
            distance: "Nearby",
            isOpen: isRestaurantOpen(r.hours as any, r.is_temporarily_closed),
            logoUrl: r.logo_url || undefined,
            rating: 4.5,
          }));

        const demoItems: NearbyRestaurant[] = personalizedRestaurants
          .filter(r => r.isOpen)
          .map(r => ({
            id: r.id,
            name: r.name,
            cuisine: r.cuisine,
            distance: r.distance,
            isOpen: r.isOpen,
            imageUrl: r.imageUrl,
            logoUrl: r.logoUrl,
            rating: r.rating,
          }));

        setRestaurants([...demoItems, ...supaItems].filter(r => r.isOpen).slice(0, 8));
      } catch {
        // fallback to demo
        setRestaurants(
          personalizedRestaurants.filter(r => r.isOpen).map(r => ({
            id: r.id, name: r.name, cuisine: r.cuisine, distance: r.distance,
            isOpen: true, imageUrl: r.imageUrl, logoUrl: r.logoUrl, rating: r.rating,
          }))
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const handleTap = useCallback((r: NearbyRestaurant) => {
    navigate(`/restaurant/${r.id}`);
  }, [navigate]);

  if (isLoading) {
    return (
      <section>
        <h2 className="text-[13px] font-semibold text-muted-foreground tracking-tight mb-2.5">Open now near you 📍</h2>
        <div className="flex gap-3 overflow-hidden -mx-4 px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-shrink-0 w-32">
              <Skeleton className="w-full aspect-square rounded-2xl" />
              <Skeleton className="h-3 w-3/4 mt-2" />
              <Skeleton className="h-2.5 w-1/2 mt-1" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (restaurants.length === 0) return null;

  return (
    <section>
      <h2 className="text-[13px] font-semibold text-muted-foreground tracking-tight mb-2.5">
        Open now near you 📍
      </h2>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {restaurants.map((r) => (
          <button
            key={r.id}
            onClick={() => handleTap(r)}
            className="flex-shrink-0 w-32 text-left active:scale-[0.97] transition-transform"
          >
            {/* Image */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-muted/30 border border-border/30">
              {r.imageUrl ? (
                <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
              ) : r.logoUrl ? (
                <div className="w-full h-full flex items-center justify-center bg-secondary/40">
                  <img src={r.logoUrl} alt="" className="w-14 h-14 object-contain" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <span className="text-xl font-bold text-muted-foreground">{r.name[0]}</span>
                </div>
              )}
              {/* Open badge */}
              <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 bg-green-500/90 text-white px-1.5 py-0.5 rounded-full text-[9px] font-semibold">
                <span className="w-1 h-1 rounded-full bg-white" />
                Open
              </div>
            </div>
            {/* Info */}
            <p className="text-[12px] font-semibold text-foreground mt-1.5 leading-tight truncate">{r.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] text-muted-foreground truncate">{r.cuisine}</span>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-[10px] text-muted-foreground">{r.distance}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default NearbyOpenSection;
