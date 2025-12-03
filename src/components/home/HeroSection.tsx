import { useNavigate } from "react-router-dom";
import { Search, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-4 pb-2">
      {/* Title group - direct on page, no container */}
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-foreground leading-tight">
          Where are we heading tonight?
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Discover places that match your vibe.
        </p>
      </div>
      
      {/* Search Bar - slimmer */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <Input
          placeholder="Find your next spot..."
          className="pl-10 bg-card border border-border focus:border-purple/40 text-foreground placeholder:text-muted-foreground/50 rounded-xl h-9 text-sm"
        />
      </div>
      
      {/* CTA Button - smaller, cleaner */}
      <Button 
        className="w-full bg-purple text-primary-foreground hover:bg-purple-hover rounded-xl h-9 text-sm font-medium flex items-center justify-center gap-1.5 transition-all"
        onClick={() => navigate("/discover")}
      >
        <span>Let's goo</span>
        <Rocket className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export default HeroSection;
