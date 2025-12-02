import { MapPin, Search, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const HeroSection = () => {
  return (
    <div className="pt-1">
      <div className="bg-card px-4 py-4 rounded-2xl shadow-soft border border-purple/10 relative overflow-hidden">
        {/* Floating accent icon */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-purple/10 flex items-center justify-center">
          <Compass className="h-4 w-4 text-purple" />
        </div>
        
        <div className="relative z-10">
          {/* Title + Subtitle - Tight grouping */}
          <h1 className="text-lg font-semibold text-foreground leading-tight">
            Where are we heading tonight?
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">
            Discover places that match your vibe.
          </p>
          
          {/* Subtle divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-purple/15 to-transparent mb-3" />
          
          {/* Chip Filters - Slim, grouped */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide -mx-1 px-1">
            <Badge className="flex-shrink-0 bg-card hover:bg-secondary text-foreground border border-purple/20 text-[11px] px-2.5 py-1 rounded-full cursor-pointer transition-all hover:border-purple/35 shadow-pill">
              🔥 Vibes match
            </Badge>
            <Badge className="flex-shrink-0 bg-card hover:bg-secondary text-foreground border border-purple/20 text-[11px] px-2.5 py-1 rounded-full cursor-pointer transition-all hover:border-purple/35 shadow-pill">
              ⚡ Ready now
            </Badge>
            <Badge className="flex-shrink-0 bg-card hover:bg-secondary text-foreground border border-purple/20 text-[11px] px-2.5 py-1 rounded-full cursor-pointer transition-all hover:border-purple/35 shadow-pill">
              🐝 Budget-friendly
            </Badge>
          </div>
          
          {/* Search Bar - Slim, elegant */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
            <MapPin className="absolute left-7 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-purple/70" />
            <Input
              placeholder="Find your next spot..."
              className="pl-12 bg-card border border-purple/15 focus:border-purple/40 text-foreground placeholder:text-muted-foreground/60 rounded-xl h-9 text-sm shadow-pill"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
