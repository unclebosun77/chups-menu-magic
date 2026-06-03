import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isRestaurantOpen } from "@/utils/openingHours";
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

const NearbyOpenSection = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<NearbyRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase
          .from("restaurants")
          .select("id, name, cuisine_type, logo_url, gallery_images, address, is_open, hours, is_temporarily_closed")
          .eq("status", "active");

        const items: NearbyRestaurant[] = (data || []).map(r => {
          const gallery = Array.isArray(r.gallery_images) ? r.gallery_images : [];
          const heroImage = (gallery[0] as string) || "";
          return {
            id: r.id,
            name: r.name,
            cuisine: r.cuisine_type,
            distance: "Nearby",
            isOpen: isRestaurantOpen(r.hours as any, r.is_temporarily_closed),
            imageUrl: heroImage || undefined,
            logoUrl: r.logo_url || undefined,
            rating: 4.5,
          };
        });

        setRestaurants(items.filter(r => r.isOpen).slice(0, 8));
      } catch {
        setRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [refreshKey]);

  const handleTap = useCallback((r: NearbyRestaurant) => {
    navigate(`/restaurant/${r.id}`);
  }, [navigate]);

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-bold text-foreground tracking-tight">Open now near you</h2>
        </div>
        <div className="flex gap-3 overflow-hidden -mx-4 px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-shrink-0 w-40">
              <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[16px] font-bold text-foreground tracking-tight">
          Open now near you
        </h2>
        <button
          onClick={() => navigate("/discover")}
          className="text-[13px] text-muted-foreground font-medium active:opacity-70 transition-opacity"
        >
          See all
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {restaurants.map((r) => (
          <button
            key={r.id}
            onClick={() => handleTap(r)}
            className="flex-shrink-0 w-40 text-left active:scale-[0.97] transition-transform"
          >
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-muted/30 shadow-card border-0">
              {r.imageUrl ? (
                <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.svg'; }} />
              ) : r.logoUrl ? (
                <div className="w-full h-full flex items-center justify-center bg-secondary/40">
                  <img src={r.logoUrl} alt="" className="w-14 h-14 object-contain" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.svg'; }} />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <span className="text-xl font-bold text-muted-foreground">{r.name[0]}</span>
                </div>
              )}
              <div className="absolute top-2 left-2 bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Open
              </div>
            </div>
            <p className="text-[14px] font-semibold text-foreground mt-2 leading-tight truncate">{r.name}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{r.cuisine}</p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default NearbyOpenSection;
