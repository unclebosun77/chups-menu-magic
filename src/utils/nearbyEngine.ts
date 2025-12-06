// Nearby Experiences Engine
// Combines location proximity with taste matching for intelligent recommendations

import { Coordinates } from "@/context/LocationContext";
import { TasteProfile } from "@/context/TasteProfileContext";
import { calculateTasteMatchScore } from "./outaSuggestEngine";
import { enrichWithLocation } from "./mockLocations";

export interface NearbyRestaurant {
  id: string;
  name: string;
  cuisine: string;
  latitude: number;
  longitude: number;
  region: string;
  distance: number;
  distanceText: string;
  tasteScore: number;
  combinedScore: number;
  nearbyReason: string;
}

interface RestaurantData {
  id: string;
  name: string;
  cuisine?: string;
  cuisine_type?: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  priceLevel?: string;
  ambience?: string[];
  rating?: number;
  isOpen?: boolean;
}

// Haversine distance calculation
function haversineDistance(a: Coordinates, b: Coordinates): number {
  const R = 6371;
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

// Convert distance to readable text
function getDistanceText(km: number): string {
  if (km < 0.3) return "2 min walk";
  if (km < 0.5) return "5 min walk";
  if (km < 1) return `${Math.round(km * 12)} min walk`;
  if (km < 2) return `${Math.round(km * 10)} min walk`;
  if (km < 5) return `${Math.round(km * 3)} min drive`;
  return `${km.toFixed(1)} km away`;
}

// Convert distance to a 0-100 score (closer = higher)
function getDistanceScore(km: number, maxDistance: number): number {
  if (km >= maxDistance) return 0;
  return Math.round(100 * (1 - km / maxDistance));
}

// Generate contextual reason for nearby recommendation
function generateNearbyReason(
  restaurant: NearbyRestaurant,
  tasteProfile: TasteProfile | null
): string {
  const reasons: string[] = [];

  // Distance-based reasons
  if (restaurant.distance < 0.5) {
    reasons.push(`Just ${restaurant.distanceText} from you`);
  } else if (restaurant.distance < 1) {
    reasons.push(`Only ${restaurant.distanceText}`);
  }

  // Taste-based reasons
  if (tasteProfile && restaurant.tasteScore > 80) {
    const cuisineMatch = tasteProfile.cuisines.find(c =>
      restaurant.cuisine.toLowerCase().includes(c.toLowerCase())
    );
    if (cuisineMatch) {
      reasons.push(`Matches your love for ${cuisineMatch}`);
    }
  }

  // Region-based
  if (restaurant.region) {
    reasons.push(`Located in ${restaurant.region}`);
  }

  // Combined score reason
  if (restaurant.combinedScore > 85) {
    reasons.push("Top match for you nearby");
  }

  return reasons[0] || `${restaurant.distanceText} from your location`;
}

// Get nearby restaurants within max distance
export function getNearbyRestaurants(
  restaurants: RestaurantData[],
  userLocation: Coordinates,
  maxDistance: number = 5 // km
): RestaurantData[] {
  return restaurants
    .map(r => enrichWithLocation(r))
    .filter(r => {
      if (!r.latitude || !r.longitude) return false;
      const dist = haversineDistance(userLocation, { latitude: r.latitude, longitude: r.longitude });
      return dist <= maxDistance;
    })
    .sort((a, b) => {
      const distA = haversineDistance(userLocation, { latitude: a.latitude!, longitude: a.longitude! });
      const distB = haversineDistance(userLocation, { latitude: b.latitude!, longitude: b.longitude! });
      return distA - distB;
    });
}

// Rank nearby restaurants by combined taste + distance score
export function rankNearbyOptions(
  restaurants: RestaurantData[],
  userLocation: Coordinates,
  tasteProfile: TasteProfile | null,
  options: { tasteWeight?: number; distanceWeight?: number; maxDistance?: number } = {}
): NearbyRestaurant[] {
  const { tasteWeight = 0.7, distanceWeight = 0.3, maxDistance = 5 } = options;

  return restaurants
    .map(r => enrichWithLocation(r))
    .filter(r => r.latitude && r.longitude)
    .map(r => {
      const cuisine = r.cuisine || r.cuisine_type || "Unknown";
      const distance = haversineDistance(userLocation, { latitude: r.latitude!, longitude: r.longitude! });
      const distanceScore = getDistanceScore(distance, maxDistance);
      
      const tasteScore = calculateTasteMatchScore(
        {
          id: r.id,
          name: r.name,
          cuisine,
          priceLevel: r.priceLevel,
          ambience: r.ambience,
          rating: r.rating,
          isOpen: r.isOpen,
        },
        tasteProfile
      );

      const combinedScore = Math.round(tasteScore * tasteWeight + distanceScore * distanceWeight);

      const nearbyRestaurant: NearbyRestaurant = {
        id: r.id,
        name: r.name,
        cuisine,
        latitude: r.latitude!,
        longitude: r.longitude!,
        region: r.region || "City Centre",
        distance,
        distanceText: getDistanceText(distance),
        tasteScore,
        combinedScore,
        nearbyReason: "",
      };

      nearbyRestaurant.nearbyReason = generateNearbyReason(nearbyRestaurant, tasteProfile);

      return nearbyRestaurant;
    })
    .filter(r => r.distance <= maxDistance)
    .sort((a, b) => b.combinedScore - a.combinedScore);
}

// Get count of nearby restaurants by region
export function getNearbyCountByRegion(
  restaurants: RestaurantData[],
  userLocation: Coordinates,
  maxDistance: number = 5
): Record<string, number> {
  const nearby = getNearbyRestaurants(restaurants, userLocation, maxDistance);
  const counts: Record<string, number> = { All: nearby.length };

  nearby.forEach(r => {
    const enriched = enrichWithLocation(r);
    if (enriched.region) {
      counts[enriched.region] = (counts[enriched.region] || 0) + 1;
    }
  });

  return counts;
}
