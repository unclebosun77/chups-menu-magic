// Maps Supabase restaurant UUIDs to legacy demo IDs for backwards compatibility
// The demoRestaurants file now uses Supabase UUIDs directly as keys

export const SUPABASE_TO_DEMO_MAP: Record<string, string> = {
  "8179401a-d2c5-4561-98ae-2010b561d477": "yakoyo-demo",
  "3a798457-b065-44c9-b7d4-9c05910e8593": "cosby-demo", 
  "4b1ee37b-9053-4523-b610-eabb8a059712": "prox-demo",
};

export const DEMO_TO_SUPABASE_MAP: Record<string, string> = {
  "yakoyo-demo": "8179401a-d2c5-4561-98ae-2010b561d477",
  "cosby-demo": "3a798457-b065-44c9-b7d4-9c05910e8593",
  "prox-demo": "4b1ee37b-9053-4523-b610-eabb8a059712",
};

// Get the Supabase UUID for a restaurant ID (handles both demo IDs and UUIDs)
export function getSupabaseId(restaurantId: string): string {
  // Check if it's a legacy demo ID
  if (DEMO_TO_SUPABASE_MAP[restaurantId]) {
    return DEMO_TO_SUPABASE_MAP[restaurantId];
  }
  // Otherwise return as-is (already a UUID or unknown ID)
  return restaurantId;
}

// Get the demo ID for a Supabase UUID (for backwards compatibility)
export function getDemoId(supabaseId: string): string | null {
  return SUPABASE_TO_DEMO_MAP[supabaseId] || null;
}

// Check if a restaurant has rich demo data available
export function hasRichDemoData(restaurantId: string): boolean {
  const supabaseId = getSupabaseId(restaurantId);
  return supabaseId in SUPABASE_TO_DEMO_MAP;
}
