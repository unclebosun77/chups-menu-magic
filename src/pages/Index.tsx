import { useCallback } from "react";
import HomeHeader from "@/components/home/HomeHeader";
import QuickActionPills from "@/components/home/QuickActionPills";
import TonightsPickHero from "@/components/home/TonightsPickHero";
import NearbyOpenSection from "@/components/home/NearbyOpenSection";
import PickedForYouSection from "@/components/home/PickedForYouSection";
import ExploreCuisineRow from "@/components/home/ExploreCuisineRow";
import OutaBanner from "@/components/home/OutaBanner";
import LiveSearchOverlay from "@/components/search/LiveSearchOverlay";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";

const sectionAnim = (delay: number) => ({
  opacity: 0 as number,
  animationDelay: `${delay}ms`,
});

const Index = () => {
  const handleRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
  }, []);

  const { pullDistance, isRefreshing, handlers } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  return (
    <div
      className="relative min-h-screen bg-background"
      {...handlers}
    >
      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />

      <div
        className="px-4 pb-28 transition-transform duration-100"
        style={{ transform: pullDistance > 0 ? `translateY(${pullDistance * 0.3}px)` : undefined }}
      >
        {/* Section 1 — Header & Greeting */}
        <div className="animate-[fadeIn_0.4s_ease-out_forwards]" style={sectionAnim(50)}>
          <HomeHeader />
        </div>

        {/* Section 2 — Quick Action Pills */}
        <div className="mt-4 animate-[fadeIn_0.4s_ease-out_forwards]" style={sectionAnim(120)}>
          <QuickActionPills />
        </div>

        {/* Section 3 — Tonight's Pick */}
        <div className="mt-6 animate-[fadeIn_0.5s_ease-out_forwards]" style={sectionAnim(200)}>
          <TonightsPickHero />
        </div>

        {/* Section 4 — Nearby & Open Now */}
        <div className="mt-8 animate-[fadeIn_0.5s_ease-out_forwards]" style={sectionAnim(300)}>
          <NearbyOpenSection />
        </div>

        {/* Section 5 — Picked For You */}
        <div className="mt-8 animate-[fadeIn_0.5s_ease-out_forwards]" style={sectionAnim(400)}>
          <PickedForYouSection />
        </div>

        {/* Section 6 — Explore by Cuisine */}
        <div className="mt-8 animate-[fadeIn_0.5s_ease-out_forwards]" style={sectionAnim(500)}>
          <ExploreCuisineRow />
        </div>

        {/* Section 7 — Ask Outa Banner */}
        <div className="mt-8 animate-[fadeIn_0.5s_ease-out_forwards]" style={sectionAnim(600)}>
          <OutaBanner />
        </div>
      </div>

      <LiveSearchOverlay />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Index;
