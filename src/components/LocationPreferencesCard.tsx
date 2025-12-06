import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Navigation, RefreshCw } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { BIRMINGHAM_REGIONS, MOCK_USER_LOCATIONS } from "@/utils/mockLocations";
import { cn } from "@/lib/utils";

interface LocationPreferencesCardProps {
  className?: string;
}

const LocationPreferencesCard = ({ className }: LocationPreferencesCardProps) => {
  const { 
    userLocation, 
    updateUserLocation, 
    currentRegion, 
    preferences, 
    updatePreferences 
  } = useLocation();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateLocation = () => {
    setIsUpdating(true);
    // Simulate location update with random Birmingham location
    const locations = Object.values(MOCK_USER_LOCATIONS);
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    setTimeout(() => {
      updateUserLocation({
        latitude: randomLocation.latitude,
        longitude: randomLocation.longitude,
      });
      setIsUpdating(false);
    }, 800);
  };

  const handlePreferredRegionChange = (region: string) => {
    updatePreferences({
      preferredRegion: region === "none" ? null : region,
    });
  };

  const handleOnlyPreferredToggle = (checked: boolean) => {
    updatePreferences({
      onlyShowPreferredRegion: checked,
    });
  };

  return (
    <Card className={cn(
      "bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border-blue-500/20 overflow-hidden",
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          Location & Region
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Current Location Display */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/50 uppercase tracking-wider">Current Location</span>
            <div className="flex items-center gap-1 text-xs text-green-400">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Active
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-400" />
            <span className="text-white font-medium">{currentRegion}</span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            {userLocation.latitude.toFixed(4)}°N, {Math.abs(userLocation.longitude).toFixed(4)}°W
          </p>
        </div>

        {/* Update Location Button */}
        <Button
          variant="outline"
          onClick={handleUpdateLocation}
          disabled={isUpdating}
          className="w-full border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isUpdating && "animate-spin")} />
          {isUpdating ? "Updating..." : "Update My Location"}
        </Button>

        {/* Preferred Region Dropdown */}
        <div className="space-y-2">
          <Label className="text-white/70">Preferred Region</Label>
          <Select
            value={preferences.preferredRegion || "none"}
            onValueChange={handlePreferredRegionChange}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Select a region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No preference</SelectItem>
              {BIRMINGHAM_REGIONS.filter(r => r !== "All").map(region => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Only Show Preferred Region Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
          <div>
            <Label className="text-white text-sm">Only show preferred region</Label>
            <p className="text-xs text-white/50 mt-0.5">
              Filter out restaurants outside your preferred area
            </p>
          </div>
          <Switch
            checked={preferences.onlyShowPreferredRegion}
            onCheckedChange={handleOnlyPreferredToggle}
            disabled={!preferences.preferredRegion}
          />
        </div>

        {/* Location Tips */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-blue-300">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span>Location updates personalize your nearby recommendations</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationPreferencesCard;
