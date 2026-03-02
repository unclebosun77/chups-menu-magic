import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TonightsPickCard from "@/components/home/TonightsPickCard";
import FloatingAIButton from "@/components/FloatingAIButton";
import LiveSearchOverlay from "@/components/search/LiveSearchOverlay";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";
import { useSearch } from "@/context/SearchContext";

const Index = () => {
  const navigate = useNavigate();
  const { query, setQuery, clearSearch } = useSearch();

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
        {/* Minimal header */}
        <div className="pt-6 pb-1">
          <h1
            className="text-[22px] font-bold text-foreground leading-tight tracking-tight animate-[fadeIn_0.4s_ease-out_forwards]"
            style={{ opacity: 0, animationDelay: '80ms' }}
          >
            Good for tonight
          </h1>
        </div>

        {/* Compact search */}
        <div className="relative mt-3 mb-6 animate-[fadeIn_0.4s_ease-out_forwards]" style={{ opacity: 0, animationDelay: '150ms' }}>
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
            <Search className="h-3.5 w-3.5 text-muted-foreground/40" strokeWidth={1.5} />
          </div>
          <Input
            placeholder="Search for a place or cuisine…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setQuery(query)}
            className="pl-10 pr-10 bg-card/90 border border-border/40 focus:border-purple/30 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] text-foreground placeholder:text-muted-foreground/40 rounded-2xl text-[13px] h-11 transition-all duration-200"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="h-3 w-3 text-muted-foreground/60" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* THE decision — one confident pick */}
        <section className="animate-[fadeIn_0.5s_ease-out_forwards]" style={{ opacity: 0, animationDelay: '200ms' }}>
          <TonightsPickCard />
        </section>

        {/* Ask CHUPS nudge */}
        <section className="mt-8 animate-[fadeIn_0.5s_ease-out_forwards]" style={{ opacity: 0, animationDelay: '450ms' }}>
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
        </section>
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
