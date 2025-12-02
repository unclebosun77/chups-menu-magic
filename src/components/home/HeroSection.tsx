import { useNavigate } from "react-router-dom";
import { MapPin, Search, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-1">
      <div className="bg-card p-5 rounded-2xl shadow-card border border-purple/15 relative overflow-hidden">
        {/* Subtle gradient border glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple/5 via-transparent to-neon-pink/5 pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-xl font-semibold mb-1 text-foreground">
            Where are we heading tonight?
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Discover places that match your vibe.
          </p>
          
          {/* AI Suggestion Chips - Horizontal Scroll */}
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide -mx-1 px-1">
            <Badge className="flex-shrink-0 bg-card hover:bg-secondary text-foreground border border-purple/25 text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all hover:border-purple/40 shadow-pill">
              🔥 Vibes match
            </Badge>
            <Badge className="flex-shrink-0 bg-card hover:bg-secondary text-foreground border border-purple/25 text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all hover:border-purple/40 shadow-pill">
              ⚡ Ready now
            </Badge>
            <Badge className="flex-shrink-0 bg-card hover:bg-secondary text-foreground border border-purple/25 text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all hover:border-purple/40 shadow-pill">
              🐝 Budget-friendly
            </Badge>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 h-4 w-4 text-purple" />
            <Input
              placeholder="Find your next spot..."
              className="pl-14 bg-card border border-purple/20 focus:border-purple/50 text-foreground placeholder:text-muted-foreground rounded-xl h-11 shadow-soft"
            />
          </div>
          
          {/* Let's goo button with rocket */}
          <Button 
            className="w-full bg-purple text-primary-foreground hover:bg-purple-hover rounded-xl h-11 font-medium shadow-soft flex items-center justify-center gap-2"
            onClick={() => navigate("/discover")}
          >
            <span>Let's goo</span>
            <Rocket className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
