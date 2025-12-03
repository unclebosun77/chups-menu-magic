import { useNavigate } from "react-router-dom";
import { Search, Rocket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/context/SearchContext";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import LiveSearchOverlay from "@/components/search/LiveSearchOverlay";

const HeroSection = () => {
  const navigate = useNavigate();
  const { query, setQuery, isSearching, clearSearch } = useSearch();
  const { behavior } = useUserBehavior();
  const expandedSearch = behavior.searchFrequency > 5;

  return (
    <>
      <div className="pt-5 pb-1">
        <div className="mb-4">
          <h1 className="text-lg font-bold text-foreground leading-snug tracking-tight">
            Where are we heading tonight?
          </h1>
          <p className="text-[13px] text-muted-foreground/70 mt-1">
            Discover places that match your vibe.
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
          <Input
            placeholder="Find your next spot..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setQuery(query)}
            className={`pl-9 pr-8 bg-card border border-border/60 focus:border-purple/30 text-foreground placeholder:text-muted-foreground/40 rounded-xl text-[13px] transition-all ${expandedSearch ? "h-10" : "h-8"}`}
          />
          {query && (
            <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-3.5 w-3.5 text-muted-foreground/60" />
            </button>
          )}
        </div>
        
        <Button 
          className="w-full bg-purple text-primary-foreground hover:bg-purple-hover rounded-xl h-8 text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all mt-3 shadow-sm"
          onClick={() => navigate("/discover")}
        >
          <span>Let's goo</span>
          <Rocket className="h-3 w-3" />
        </Button>
      </div>
      <LiveSearchOverlay />
    </>
  );
};

export default HeroSection;
