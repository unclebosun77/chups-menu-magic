import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationPreferences {
  preferredRegion: string | null;
  onlyShowPreferredRegion: boolean;
}

interface LocationContextValue {
  userLocation: Coordinates;
  updateUserLocation: (coords: Coordinates) => void;
  distanceBetween: (a: Coordinates, b: Coordinates) => number;
  sortByDistance: <T extends { latitude?: number; longitude?: number }>(items: T[]) => T[];
  filterByRegion: <T extends { region?: string }>(items: T[], regionName: string | null) => T[];
  getDistanceText: (coords: Coordinates) => string;
  preferences: LocationPreferences;
  updatePreferences: (prefs: Partial<LocationPreferences>) => void;
  currentRegion: string;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

// Birmingham City Centre default location
const BIRMINGHAM_CENTER: Coordinates = {
  latitude: 52.4862,
  longitude: -1.8904,
};

const STORAGE_KEY = "outa_location_preferences";

// Haversine formula for distance calculation (returns km)
function haversineDistance(a: Coordinates, b: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;

  const aCalc =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));

  return R * c;
}

// Map distance to walking/driving time
function getDistanceDescription(km: number): string {
  if (km < 0.3) return "2 min walk";
  if (km < 0.5) return "5 min walk";
  if (km < 1) return `${Math.round(km * 12)} min walk`;
  if (km < 2) return `${Math.round(km * 10)} min walk`;
  if (km < 5) return `${Math.round(km * 3)} min drive`;
  return `${Math.round(km)} km away`;
}

// Determine region from coordinates (mock mapping)
function getRegionFromCoords(coords: Coordinates): string {
  // Simple mock region detection based on coordinates
  const regions = [
    { name: "Mailbox", lat: 52.4755, lng: -1.9010 },
    { name: "Broad Street", lat: 52.4778, lng: -1.9120 },
    { name: "Digbeth", lat: 52.4750, lng: -1.8780 },
    { name: "Jewellery Quarter", lat: 52.4880, lng: -1.9100 },
    { name: "Soho Wharf", lat: 52.4800, lng: -1.9200 },
  ];

  let closestRegion = "City Centre";
  let minDist = Infinity;

  regions.forEach(region => {
    const dist = haversineDistance(coords, { latitude: region.lat, longitude: region.lng });
    if (dist < minDist && dist < 1) {
      minDist = dist;
      closestRegion = region.name;
    }
  });

  return closestRegion;
}

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [userLocation, setUserLocation] = useState<Coordinates>(BIRMINGHAM_CENTER);
  const [preferences, setPreferences] = useState<LocationPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { preferredRegion: null, onlyShowPreferredRegion: false };
  });

  const updateUserLocation = useCallback((coords: Coordinates) => {
    setUserLocation(coords);
  }, []);

  const distanceBetween = useCallback((a: Coordinates, b: Coordinates): number => {
    return haversineDistance(a, b);
  }, []);

  const sortByDistance = useCallback(<T extends { latitude?: number; longitude?: number }>(items: T[]): T[] => {
    return [...items].sort((a, b) => {
      if (!a.latitude || !a.longitude) return 1;
      if (!b.latitude || !b.longitude) return -1;
      
      const distA = haversineDistance(userLocation, { latitude: a.latitude, longitude: a.longitude });
      const distB = haversineDistance(userLocation, { latitude: b.latitude, longitude: b.longitude });
      
      return distA - distB;
    });
  }, [userLocation]);

  const filterByRegion = useCallback(<T extends { region?: string }>(items: T[], regionName: string | null): T[] => {
    if (!regionName || regionName === "All") return items;
    return items.filter(item => item.region?.toLowerCase() === regionName.toLowerCase());
  }, []);

  const getDistanceText = useCallback((coords: Coordinates): string => {
    const km = haversineDistance(userLocation, coords);
    return getDistanceDescription(km);
  }, [userLocation]);

  const updatePreferences = useCallback((prefs: Partial<LocationPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...prefs };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const currentRegion = useMemo(() => getRegionFromCoords(userLocation), [userLocation]);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        updateUserLocation,
        distanceBetween,
        sortByDistance,
        filterByRegion,
        getDistanceText,
        preferences,
        updatePreferences,
        currentRegion,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
