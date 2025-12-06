import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "@/context/LocationContext";
import { useTasteProfile } from "@/context/TasteProfileContext";
import { rankNearbyOptions, NearbyRestaurant } from "@/utils/nearbyEngine";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";
import { enrichWithLocation } from "@/utils/mockLocations";

interface LiveRecommendation extends NearbyRestaurant {
  reasonForRecommendation: string;
  isTopPick: boolean;
}

interface UseLiveRecommendationsResult {
  recommendations: LiveRecommendation[];
  isRefreshing: boolean;
  nearbyCount: number;
  currentRegion: string;
  refresh: () => void;
  topPick: LiveRecommendation | null;
}

export function useLiveRecommendations(
  externalRestaurants?: any[],
  options: { limit?: number; autoRefreshInterval?: number } = {}
): UseLiveRecommendationsResult {
  const { limit = 5, autoRefreshInterval = 0 } = options;
  const { userLocation, currentRegion, preferences } = useLocation();
  const { profile } = useTasteProfile();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Use external restaurants or fall back to personalized restaurants
  const restaurants = useMemo(() => {
    const source = externalRestaurants || personalizedRestaurants;
    return source.map(r => enrichWithLocation({
      ...r,
      cuisine: r.cuisine || r.cuisine_type,
    }));
  }, [externalRestaurants]);

  // Generate recommendations based on location + taste
  const recommendations = useMemo(() => {
    let filteredRestaurants = restaurants;

    // Apply region filter if preference is set
    if (preferences.onlyShowPreferredRegion && preferences.preferredRegion) {
      filteredRestaurants = restaurants.filter(
        r => r.region?.toLowerCase() === preferences.preferredRegion?.toLowerCase()
      );
    }

    const ranked = rankNearbyOptions(filteredRestaurants, userLocation, profile, {
      tasteWeight: 0.7,
      distanceWeight: 0.3,
      maxDistance: 10,
    });

    return ranked.slice(0, limit).map((r, index) => ({
      ...r,
      reasonForRecommendation: generateReasonText(r, index === 0),
      isTopPick: index === 0,
    }));
  }, [restaurants, userLocation, profile, preferences, limit, refreshTrigger]);

  // Trigger refresh animation
  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1);
      setIsRefreshing(false);
    }, 600);
  }, []);

  // Auto-refresh on location/profile changes
  useEffect(() => {
    refresh();
  }, [userLocation.latitude, userLocation.longitude, profile?.cuisines?.length]);

  // Optional auto-refresh interval
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const interval = setInterval(refresh, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval, refresh]);

  const topPick = recommendations[0] || null;
  const nearbyCount = recommendations.length;

  return {
    recommendations,
    isRefreshing,
    nearbyCount,
    currentRegion,
    refresh,
    topPick,
  };
}

// Generate contextual recommendation reason
function generateReasonText(rec: NearbyRestaurant, isTop: boolean): string {
  const reasons: string[] = [];

  if (isTop && rec.combinedScore > 85) {
    reasons.push("🎯 Top match for you right now");
  }

  if (rec.distance < 0.5) {
    reasons.push(`⚡ Just ${rec.distanceText}`);
  } else if (rec.distance < 1) {
    reasons.push(`📍 Only ${rec.distanceText}`);
  }

  if (rec.tasteScore > 80) {
    reasons.push(`❤️ ${rec.tasteScore}% taste match`);
  }

  if (rec.region) {
    reasons.push(`🏙️ In ${rec.region}`);
  }

  return reasons[0] || rec.nearbyReason;
}

export default useLiveRecommendations;
