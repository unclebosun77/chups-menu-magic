import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import PickedForYouSection from "@/components/home/PickedForYouSection";
import ExploreDishesRow from "@/components/home/ExploreDishesRow";
import FloatingAIButton from "@/components/FloatingAIButton";
import LiveSearchOverlay from "@/components/search/LiveSearchOverlay";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";

const Index = () => {
  const navigate = useNavigate();

  const handleRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
  }, []);

  const { pullDistance, isRefreshing, handlers } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  return (
    <div
      className="relative min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/30"
      {...handlers}
    >
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
      />

      <div
        className="px-4 pb-28 transition-transform duration-100"
        style={{ transform: pullDistance > 0 ? `translateY(${pullDistance * 0.3}px)` : undefined }}
      >
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1
            className="text-[22px] font-bold text-foreground leading-tight tracking-tight animate-[fadeIn_0.4s_ease-out_forwards]"
            style={{ opacity: 0, animationDelay: '80ms' }}
          >
            Good for tonight
          </h1>
        </div>

        {/* Section 1 — Picked for you */}
        <div className="animate-[fadeIn_0.5s_ease-out_forwards]" style={{ opacity: 0, animationDelay: '150ms' }}>
          <PickedForYouSection />
        </div>

        {/* Section 2 — Explore dishes */}
        <div className="mt-8 animate-[fadeIn_0.5s_ease-out_forwards]" style={{ opacity: 0, animationDelay: '300ms' }}>
          <ExploreDishesRow />
        </div>

        {/* Ask CHUPS nudge */}
        <div className="mt-8 animate-[fadeIn_0.5s_ease-out_forwards]" style={{ opacity: 0, animationDelay: '400ms' }}>
          <button
            onClick={() => navigate("/outa")}
            className="w-full flex items-center gap-3 bg-card border border-border/40 rounded-2xl p-4 text-left hover:border-purple/20 transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple/15 to-purple/5 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-purple" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-foreground">Need a hand choosing?</p>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">Tell me who's coming — I'll pick the right spot</p>
            </div>
          </button>
        </div>
      </div>

      <LiveSearchOverlay />
      <FloatingAIButton />

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
