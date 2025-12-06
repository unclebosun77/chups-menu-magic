import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "@/context/LocationContext";
import { BIRMINGHAM_REGIONS, BirminghamRegion } from "@/utils/mockLocations";
import { MapPin } from "lucide-react";

interface RegionFilterProps {
  onRegionChange: (region: string | null) => void;
  selectedRegion?: string | null;
  showCounts?: boolean;
  counts?: Record<string, number>;
  className?: string;
}

const RegionFilter = ({
  onRegionChange,
  selectedRegion = "All",
  showCounts = false,
  counts = {},
  className,
}: RegionFilterProps) => {
  const { currentRegion } = useLocation();
  const [activeRegion, setActiveRegion] = useState<string>(selectedRegion || "All");

  useEffect(() => {
    if (selectedRegion !== undefined) {
      setActiveRegion(selectedRegion || "All");
    }
  }, [selectedRegion]);

  const handleSelect = (region: string) => {
    const newRegion = region === "All" ? null : region;
    setActiveRegion(region);
    onRegionChange(newRegion);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {BIRMINGHAM_REGIONS.map((region, index) => {
          const isActive = activeRegion === region;
          const isCurrentLocation = region === currentRegion;
          const count = counts[region];

          return (
            <button
              key={region}
              onClick={() => handleSelect(region)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium",
                "transition-all duration-300 ease-out",
                "border whitespace-nowrap",
                "animate-fade-in",
                isActive
                  ? "bg-purple text-white border-purple shadow-lg shadow-purple/25 scale-105"
                  : "bg-card/80 text-muted-foreground border-border/50 hover:border-purple/30 hover:bg-card",
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="flex items-center gap-1.5">
                {isCurrentLocation && !isActive && (
                  <MapPin className="h-3 w-3 text-purple" />
                )}
                {region}
                {showCounts && count !== undefined && count > 0 && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full ml-1",
                    isActive ? "bg-white/20" : "bg-secondary"
                  )}>
                    {count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Fade edges */}
      <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default RegionFilter;
