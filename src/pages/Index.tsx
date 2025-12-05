import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import SkeletonCard from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";
import HeroSection from "@/components/home/HeroSection";
import SmartActionPills from "@/components/home/SmartActionPills";
import UniversalRestaurantCard from "@/components/home/UniversalRestaurantCard";
import ExploreDishesSection from "@/components/home/ExploreDishesSection";
import YourNextSpotSection from "@/components/home/YourNextSpotSection";

type Restaurant = {
  id: string;
  name: string;
  cuisine_type: string;
  description: string | null;
  logo_url: string | null;
  is_open: boolean;
  latitude: number | null;
  longitude: number | null;
};

const Index = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRestaurants = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, cuisine_type, description, logo_url, is_open, latitude, longitude")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error && data) {
        setRestaurants(data);
      }
      setIsLoading(false);
    };

    loadRestaurants();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 animate-[pageEnter_0.4s_ease-out_forwards]" style={{ opacity: 0 }}>
      <div className="px-4 pb-28">
        {/* Dev: Quick Onboarding Access */}
        {restaurants.length === 0 && !isLoading && (
          <div 
            className="bg-gradient-to-br from-secondary/40 to-secondary/20 border border-border/30 rounded-2xl p-5 mt-4 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] animate-[fadeSlideUp_0.4s_ease-out_forwards]"
            style={{ opacity: 0, animationDelay: '200ms' }}
          >
            <p className="text-sm text-foreground mb-3 font-medium">👋 No spots yet!</p>
            <Button 
              onClick={() => navigate("/restaurant/onboarding")}
              className="w-full bg-purple text-primary-foreground hover:bg-purple-hover rounded-xl h-11 shadow-[0_4px_12px_-4px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_20px_-4px_rgba(139,92,246,0.4)] transition-all duration-300 active:scale-[0.98]"
              size="sm"
            >
              <Rocket className="mr-2 h-4 w-4" />
              Add Your First Spot
            </Button>
          </div>
        )}

        {/* Hero Section - Premium Entrance */}
        <div 
          className="animate-[heroReveal_0.5s_ease-out_forwards]"
          style={{ opacity: 0 }}
        >
          <HeroSection />
        </div>

        {/* AI Smart Actions - Staggered Reveal */}
        <div 
          className="mt-7 animate-[sectionSlide_0.45s_ease-out_forwards]"
          style={{ opacity: 0, animationDelay: '150ms' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple/12 to-neon-pink/8 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]">
              <Sparkles className="h-3 w-3 text-purple animate-[sparkleGlow_2s_ease-in-out_infinite]" strokeWidth={1.5} />
            </div>
            <p className="text-[12px] font-medium text-foreground/70 tracking-tight">
              Outa suggests
            </p>
          </div>
          <SmartActionPills />
        </div>

        {/* Discover Section - Premium Cards */}
        <div 
          className="mt-9 animate-[sectionSlide_0.5s_ease-out_forwards]"
          style={{ opacity: 0, animationDelay: '280ms' }}
        >
          <div className="mb-5">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🥢</span>
              <div>
                <h2 className="text-[17px] font-bold text-foreground tracking-tight">
                  Discover
                </h2>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5 font-light">Trending around you</p>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex gap-3.5 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} type="vertical" className="flex-shrink-0 w-44" />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="animate-[fadeSlideUp_0.4s_ease-out_forwards]" style={{ opacity: 0, animationDelay: '400ms' }}>
              <EmptyState
                icon={MapPin}
                title="Mapping your vibe zone 🗺️"
                description="Hang tight while we scout amazing spots near you!"
                compact
              />
            </div>
          ) : (
            <div className="flex gap-3.5 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
              {restaurants.map((restaurant, index) => (
                <div
                  key={restaurant.id}
                  className="animate-[cardReveal_0.4s_ease-out_forwards]"
                  style={{ 
                    opacity: 0, 
                    animationDelay: `${350 + index * 80}ms` 
                  }}
                >
                  <UniversalRestaurantCard restaurant={restaurant} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Your Next Spot Section - Hero Treatment */}
        <div 
          className="mt-10 animate-[sectionSlide_0.5s_ease-out_forwards]"
          style={{ opacity: 0, animationDelay: '450ms' }}
        >
          <YourNextSpotSection />
        </div>

        {/* Explore Dishes Section - Magazine Style */}
        <div 
          className="mt-10 animate-[sectionSlide_0.55s_ease-out_forwards]"
          style={{ opacity: 0, animationDelay: '580ms' }}
        >
          <ExploreDishesSection />
        </div>
      </div>

      {/* Premium Animation Keyframes */}
      <style>{`
        @keyframes pageEnter {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes heroReveal {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes sectionSlide {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes cardReveal {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes sparkleGlow {
          0%, 100% {
            opacity: 1;
            filter: drop-shadow(0 0 4px rgba(139, 92, 246, 0.3));
          }
          50% {
            opacity: 0.8;
            filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.5));
          }
        }
      `}</style>
    </div>
  );
};

export default Index;