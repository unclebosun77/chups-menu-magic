import { useNavigate } from "react-router-dom";
import { MapPin, Search, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-2 pb-1">
      <div className="bg-card px-5 py-6 rounded-2xl shadow-sm border border-purple/10 relative overflow-hidden">
        {/* Subtle floating accent icon */}
        <div className="absolute top-4 right-4 text-purple/40">
          <Sparkles className="h-5 w-5" />
        </div>
        
        <div className="relative z-10">
          {/* Title group - tightened */}
          <div className="mb-5">
            <h1 className="text-lg font-semibold text-foreground leading-tight">
              Where are we heading tonight?
            </h1>
            <p className="text-sm text-muted-foreground/80 mt-1">
              Discover places that match your vibe.
            </p>
          </div>
          
          {/* Search Bar - slimmer, more iOS */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-purple/70" />
            <Input
              placeholder="Find your next spot..."
              className="pl-14 bg-background border border-purple/15 focus:border-purple/30 text-foreground placeholder:text-muted-foreground/60 rounded-xl h-10 text-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
            />
          </div>
          
          {/* CTA Button - refined */}
          <Button 
            className="w-full bg-purple text-primary-foreground hover:bg-purple-hover rounded-xl h-10 text-sm font-medium shadow-sm flex items-center justify-center gap-2 transition-all"
            onClick={() => navigate("/discover")}
          >
            <span>Let's goo</span>
            <Rocket className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
