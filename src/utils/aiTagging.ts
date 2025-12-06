// AI-Driven Restaurant Tagging Utility
// Generates intelligent tags based on restaurant attributes

export type RestaurantTag = {
  label: string;
  category: 'vibe' | 'dietary' | 'occasion' | 'price' | 'time';
  confidence: number; // 0-100
};

interface RestaurantData {
  name: string;
  cuisine: string;
  priceLevel?: string;
  ambience?: string[];
  description?: string;
  signatureDishes?: string[];
  rating?: number;
  isOpen?: boolean;
}

const VIBE_TAGS: Record<string, string[]> = {
  romantic: ['elegant', 'romantic', 'soft lighting', 'intimate', 'boutique', 'cozy'],
  groupFriendly: ['vibrant', 'lively', 'social', 'group', 'party', 'fun'],
  casual: ['casual', 'relaxed', 'chill', 'laid-back', 'comfortable'],
  upscale: ['premium', 'fine dining', 'elegant', 'sophisticated', 'luxury'],
  cultural: ['authentic', 'traditional', 'cultural', 'heritage', 'local'],
};

const DIETARY_KEYWORDS: Record<string, string[]> = {
  veggie: ['vegan', 'vegetarian', 'veggie', 'plant', 'salad', 'vegetables'],
  spicy: ['spicy', 'hot', 'chili', 'fire', 'pepper', 'suya', 'jollof'],
  seafood: ['fish', 'seafood', 'shrimp', 'lobster', 'crab', 'prawn'],
  glutenFree: ['gluten-free', 'gluten free', 'celiac'],
};

const OCCASION_PATTERNS: Record<string, { keywords: string[]; vibes: string[] }> = {
  dateNight: { keywords: ['romantic', 'intimate'], vibes: ['Romantic', 'Elegant', 'Soft lighting'] },
  businessMeeting: { keywords: ['professional', 'quiet'], vibes: ['Elegant', 'Premium', 'Sophisticated'] },
  celebration: { keywords: ['party', 'celebration'], vibes: ['Vibrant', 'Lively', 'Fun'] },
  familyDinner: { keywords: ['family', 'kids'], vibes: ['Warm', 'Comfortable', 'Casual'] },
};

function matchKeywords(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  const matches = keywords.filter(kw => lowerText.includes(kw.toLowerCase()));
  return Math.min(100, matches.length * 25);
}

function getPriceTag(priceLevel?: string): RestaurantTag | null {
  if (!priceLevel) return null;
  
  const poundCount = (priceLevel.match(/£/g) || []).length;
  
  if (poundCount <= 1) {
    return { label: 'Budget-Friendly', category: 'price', confidence: 90 };
  } else if (poundCount === 2) {
    return { label: 'Mid-Range', category: 'price', confidence: 85 };
  } else {
    return { label: 'Fine Dining', category: 'price', confidence: 95 };
  }
}

function getTimeTag(isOpen?: boolean): RestaurantTag | null {
  // Mock late-night detection based on name/description patterns
  return isOpen 
    ? { label: 'Open Now', category: 'time', confidence: 100 }
    : null;
}

export function generateRestaurantTags(restaurant: RestaurantData): RestaurantTag[] {
  const tags: RestaurantTag[] = [];
  const allText = [
    restaurant.name,
    restaurant.cuisine,
    restaurant.description || '',
    ...(restaurant.ambience || []),
    ...(restaurant.signatureDishes || []),
  ].join(' ');

  // Vibe tags
  Object.entries(VIBE_TAGS).forEach(([tagKey, keywords]) => {
    const confidence = matchKeywords(allText, keywords);
    if (confidence >= 25) {
      const labelMap: Record<string, string> = {
        romantic: 'Romantic',
        groupFriendly: 'Group-Friendly',
        casual: 'Casual Vibes',
        upscale: 'Upscale',
        cultural: 'Cultural Experience',
      };
      tags.push({ label: labelMap[tagKey], category: 'vibe', confidence });
    }
  });

  // Dietary tags
  Object.entries(DIETARY_KEYWORDS).forEach(([tagKey, keywords]) => {
    const confidence = matchKeywords(allText, keywords);
    if (confidence >= 25) {
      const labelMap: Record<string, string> = {
        veggie: 'Veggie Options',
        spicy: 'Spicy 🌶️',
        seafood: 'Seafood',
        glutenFree: 'Gluten-Free',
      };
      tags.push({ label: labelMap[tagKey], category: 'dietary', confidence });
    }
  });

  // Occasion tags
  Object.entries(OCCASION_PATTERNS).forEach(([tagKey, { keywords, vibes }]) => {
    const keywordMatch = matchKeywords(allText, keywords);
    const vibeMatch = restaurant.ambience?.some(a => 
      vibes.some(v => a.toLowerCase().includes(v.toLowerCase()))
    ) ? 50 : 0;
    const confidence = Math.max(keywordMatch, vibeMatch);
    
    if (confidence >= 25) {
      const labelMap: Record<string, string> = {
        dateNight: 'Date Night',
        businessMeeting: 'Business Meeting',
        celebration: 'Celebration',
        familyDinner: 'Family Dinner',
      };
      tags.push({ label: labelMap[tagKey], category: 'occasion', confidence });
    }
  });

  // Price tag
  const priceTag = getPriceTag(restaurant.priceLevel);
  if (priceTag) tags.push(priceTag);

  // Time tag
  const timeTag = getTimeTag(restaurant.isOpen);
  if (timeTag) tags.push(timeTag);

  // Cuisine-based tags
  const cuisineTags: Record<string, string> = {
    'afro': 'African Cuisine',
    'italian': 'Italian',
    'thai': 'Thai',
    'asian': 'Asian Fusion',
    'indian': 'Indian',
    'mexican': 'Mexican',
    'japanese': 'Japanese',
  };
  
  Object.entries(cuisineTags).forEach(([keyword, label]) => {
    if (restaurant.cuisine.toLowerCase().includes(keyword)) {
      tags.push({ label, category: 'vibe', confidence: 100 });
    }
  });

  // Sort by confidence and return top tags
  return tags
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);
}

// Get a single "hero" tag for compact displays
export function getHeroTag(restaurant: RestaurantData): RestaurantTag | null {
  const tags = generateRestaurantTags(restaurant);
  return tags.find(t => t.category === 'occasion' || t.category === 'vibe') || tags[0] || null;
}
