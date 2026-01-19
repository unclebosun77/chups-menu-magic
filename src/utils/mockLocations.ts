// Mock location data for Birmingham restaurants
// Each restaurant has coordinates and a region/neighborhood

export interface RestaurantLocation {
  id: string;
  latitude: number;
  longitude: number;
  region: string;
  address: string;
}

// Birmingham neighborhoods/regions
export const BIRMINGHAM_REGIONS = [
  "All",
  "City Centre",
  "Mailbox",
  "Broad Street",
  "Digbeth",
  "Jewellery Quarter",
  "Soho Wharf",
  "Brindleyplace",
] as const;

export type BirminghamRegion = typeof BIRMINGHAM_REGIONS[number];

// Mock restaurant locations using Supabase UUIDs
export const restaurantLocations: Record<string, RestaurantLocation> = {
  "8179401a-d2c5-4561-98ae-2010b561d477": {
    id: "8179401a-d2c5-4561-98ae-2010b561d477",
    latitude: 52.4810,
    longitude: -1.8950,
    region: "City Centre",
    address: "12 Bennetts Hill, Birmingham City Centre, B2 5RS",
  },
  "3a798457-b065-44c9-b7d4-9c05910e8593": {
    id: "3a798457-b065-44c9-b7d4-9c05910e8593",
    latitude: 52.4778,
    longitude: -1.9005,
    region: "Mailbox",
    address: "38 Temple Street, Birmingham City Centre, B2 5DP",
  },
  "4b1ee37b-9053-4523-b610-eabb8a059712": {
    id: "4b1ee37b-9053-4523-b610-eabb8a059712",
    latitude: 52.4820,
    longitude: -1.9120,
    region: "Broad Street",
    address: "24 Colmore Row, Birmingham City Centre, B3 2QE",
  },
};

// Mock user location presets for testing
export const MOCK_USER_LOCATIONS = {
  cityCenter: { latitude: 52.4862, longitude: -1.8904, name: "City Centre" },
  mailbox: { latitude: 52.4755, longitude: -1.9010, name: "Mailbox" },
  digbeth: { latitude: 52.4750, longitude: -1.8780, name: "Digbeth" },
  broadStreet: { latitude: 52.4778, longitude: -1.9120, name: "Broad Street" },
  jewelryQuarter: { latitude: 52.4880, longitude: -1.9100, name: "Jewellery Quarter" },
};

// Get location for a restaurant by ID
export function getRestaurantLocation(restaurantId: string): RestaurantLocation | null {
  return restaurantLocations[restaurantId] || null;
}

// Enrich restaurant data with location
export function enrichWithLocation<T extends { id: string }>(
  restaurant: T
): T & Partial<RestaurantLocation> {
  const location = restaurantLocations[restaurant.id];
  if (location) {
    return { ...restaurant, ...location };
  }
  // Generate random location within Birmingham for unknown restaurants
  return {
    ...restaurant,
    latitude: 52.48 + (Math.random() - 0.5) * 0.02,
    longitude: -1.89 + (Math.random() - 0.5) * 0.02,
    region: BIRMINGHAM_REGIONS[Math.floor(Math.random() * (BIRMINGHAM_REGIONS.length - 1)) + 1],
  };
}
