// Canonical Restaurant Data - Single source of truth for all restaurant references
// All features (Curated, Services, AI) must use this data, not define their own

import { personalizedRestaurants } from './personalizedRestaurants';

// Canonical restaurant IDs - Supabase UUIDs
export const CANONICAL_IDS = {
  YAKOYO: "8179401a-d2c5-4561-98ae-2010b561d477",
  COSBY: "3a798457-b065-44c9-b7d4-9c05910e8593",
  PROX: "4b1ee37b-9053-4523-b610-eabb8a059712",
} as const;

// Theme-to-restaurant mapping for curated experiences
// Maps collection themes to appropriate canonical restaurant IDs
export const THEME_RESTAURANT_MAP: Record<string, string[]> = {
  'Date Night': [CANONICAL_IDS.COSBY],
  'Fine Dining': [CANONICAL_IDS.COSBY],
  'Romantic': [CANONICAL_IDS.COSBY],
  'Trending Now': [CANONICAL_IDS.YAKOYO, CANONICAL_IDS.COSBY],
  'Group Friendly': [CANONICAL_IDS.YAKOYO, CANONICAL_IDS.PROX],
  'Groups': [CANONICAL_IDS.YAKOYO, CANONICAL_IDS.PROX],
  'Hidden Gems': [CANONICAL_IDS.PROX],
  'Budget Bites': [CANONICAL_IDS.PROX],
  'Budget': [CANONICAL_IDS.PROX, CANONICAL_IDS.YAKOYO],
  'Afro Fusion': [CANONICAL_IDS.YAKOYO],
  'Italian': [CANONICAL_IDS.COSBY],
  'Thai': [CANONICAL_IDS.PROX],
  'Asian': [CANONICAL_IDS.PROX],
  'VIP Access': [CANONICAL_IDS.COSBY],
  'Premium': [CANONICAL_IDS.COSBY, CANONICAL_IDS.YAKOYO],
};

// Get restaurant route for a theme/collection
export function getRestaurantRouteForTheme(theme: string): string {
  const restaurants = THEME_RESTAURANT_MAP[theme];
  if (restaurants && restaurants.length > 0) {
    return `/restaurant/${restaurants[0]}`;
  }
  return '/discover';
}

// Get all restaurants for a theme (for lists)
export function getRestaurantsForTheme(theme: string): string[] {
  return THEME_RESTAURANT_MAP[theme] || [];
}

// Get canonical restaurant by ID
export function getCanonicalRestaurant(id: string) {
  return personalizedRestaurants.find(r => r.id === id);
}

// Get all canonical restaurants
export function getAllCanonicalRestaurants() {
  return personalizedRestaurants;
}

// Get restaurant by name (for AI mentions)
export function getRestaurantByName(name: string) {
  const lower = name.toLowerCase();
  return personalizedRestaurants.find(r => r.name.toLowerCase() === lower);
}

// Check if a restaurant ID is canonical
export function isCanonicalId(id: string): boolean {
  return Object.values(CANONICAL_IDS).includes(id as any);
}

// Service availability mapping
export const SERVICE_AVAILABILITY: Record<string, { available: boolean; route: string; comingSoon?: boolean }> = {
  'Ask Outa': { available: true, route: '/chat' },
  'AI Restaurant Finder': { available: true, route: '/chat' },
  'Curated Experiences': { available: true, route: '/curated-experiences' },
  'Date Night Planning': { available: true, route: '/curated-experiences' },
  'Group Dining': { available: true, route: '/curated-experiences' },
  'Explore': { available: true, route: '/discover' },
  'Saved Restaurants': { available: true, route: '/saved' },
  'My Bookings': { available: true, route: '/my-bookings' },
  'My Orders': { available: true, route: '/my-orders' },
  'Outa Concierge': { available: true, route: '/chat' },
  'VIP Access': { available: false, route: '/curated-experiences', comingSoon: true },
  'Private Events': { available: false, route: '/services', comingSoon: true },
  'Gift Cards': { available: false, route: '/services', comingSoon: true },
};

// Get service info
export function getServiceInfo(serviceName: string) {
  return SERVICE_AVAILABILITY[serviceName] || { available: false, route: '/services', comingSoon: true };
}
