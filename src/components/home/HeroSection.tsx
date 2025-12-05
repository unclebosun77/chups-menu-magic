import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/context/SearchContext";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import LiveSearchOverlay from "@/components/search/LiveSearchOverlay";

const HeroSection = () => {
  const navigate = useNavigate();
  const { query, setQuery, clearSearch } = useSearch();
  const { behavior } = useUserBehavior();
  const expandedSearch = behavior.searchFrequency > 5;

  return (
    <>
      <div className="pt-6 pb-2">
        {/* Premium Header with Sparkle */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="relative animate-[headerIconPop_0.4s_ease-out_forwards]"
              style={{ opacity: 0, animationDelay: '100ms' }}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple/15 to-neon-pink/10 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_2px_8px_-2px_rgba(139,92,246,0.15)]">
                <Sparkles className="h-4 w-4 text-purple" strokeWidth={1.5} />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gradient-to-br from-neon-pink to-purple animate-[pulse_2s_ease-in-out_infinite]" />
            </div>
            <span 
              className="text-[10px] font-semibold text-purple/60 tracking-wider uppercase animate-[fadeIn_0.3s_ease-out_forwards]"
              style={{ opacity: 0, animationDelay: '200ms' }}
            >
              Outa Intelligence
            </span>
          </div>
          
          <h1 
            className="text-[22px] font-bold text-foreground leading-tight tracking-tight animate-[titleSlideUp_0.45s_ease-out_forwards]"
            style={{ opacity: 0, animationDelay: '150ms' }}
          >
            Where are we heading tonight?
          </h1>
          <p 
            className="text-[13px] text-muted-foreground/60 mt-2 font-light leading-relaxed animate-[subtitleFade_0.5s_ease-out_forwards]"
            style={{ opacity: 0, animationDelay: '250ms' }}
          >
            Discover places that match your vibe.
          </p>
        </div>
        
        {/* Premium Search Bar */}
        <div 
          className="relative animate-[searchBarReveal_0.45s_ease-out_forwards]"
          style={{ opacity: 0, animationDelay: '300ms' }}
        >
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-lg bg-purple/8 flex items-center justify-center">
            <Search className="h-3.5 w-3.5 text-purple/60" strokeWidth={1.5} />
          </div>
          <Input
            placeholder="Find your next spot..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setQuery(query)}
            className={`pl-12 pr-10 bg-card/90 border border-border/40 focus:border-purple/30 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] text-foreground placeholder:text-muted-foreground/40 rounded-2xl text-[13px] transition-all duration-200 ${expandedSearch ? "h-12" : "h-11"}`}
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
        
        {/* Premium CTA Button */}
        <Button 
          className="w-full bg-gradient-to-r from-purple to-purple/90 text-primary-foreground hover:from-purple/95 hover:to-purple/85 rounded-2xl h-12 text-[14px] font-semibold flex items-center justify-center gap-2 transition-all duration-300 mt-4 shadow-[0_6px_20px_-6px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_28px_-6px_rgba(139,92,246,0.5)] hover:scale-[1.01] active:scale-[0.98] animate-[ctaReveal_0.5s_ease-out_forwards]"
          style={{ opacity: 0, animationDelay: '380ms' }}
          onClick={() => navigate("/discover")}
        >
          <span>Let's goo</span>
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Button>
      </div>
      <LiveSearchOverlay />

      {/* Animation Keyframes */}
      <style>{`
        @keyframes headerIconPop {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes titleSlideUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes subtitleFade {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes searchBarReveal {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes ctaReveal {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.15);
          }
        }
      `}</style>
    </>
  );
};

export default HeroSection;