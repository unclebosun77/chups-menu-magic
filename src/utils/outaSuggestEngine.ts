// Smart Outa Suggestions Engine
// Generates personalized restaurant recommendations based on taste profile

import { TasteProfile } from '@/context/TasteProfileContext';
import { generateRestaurantTags, RestaurantTag } from './aiTagging';

export interface SuggestionReason {
  text: string;
  icon: '🎯' | '❤️' | '🔥' | '⭐' | '🌶️' | '💰' | '🍽️';
  strength: 'strong' | 'medium' | 'light';
}

export interface SmartSuggestion {
  restaurant: any;
  matchScore: number;
  reasons: SuggestionReason[];
  tags: RestaurantTag[];
  isTopPick: boolean;
}

interface RestaurantData {
  id: string;
  name: string;
  cuisine: string;
  priceLevel?: string;
  ambience?: string[];
  description?: string;
  signatureDishes?: string[];
  rating?: number;
  isOpen?: boolean;
  matchScore?: number;
  aiReason?: string;
}

// Map price level string to preference
function getPricePreference(priceLevel?: string): 'budget' | 'mid' | 'premium' {
  if (!priceLevel) return 'mid';
  const pounds = (priceLevel.match(/£/g) || []).length;
  if (pounds <= 1) return 'budget';
  if (pounds === 2) return 'mid';
  return 'premium';
}

// Calculate match score between restaurant and taste profile
export function calculateTasteMatchScore(
  restaurant: RestaurantData, 
  tasteProfile: TasteProfile | null
): number {
  if (!tasteProfile) {
    // Return base score for non-personalized users
    return restaurant.rating ? Math.round(restaurant.rating * 15) : 70;
  }

  let score = 50; // Base score
  const reasons: string[] = [];

  // Cuisine match (up to +25 points)
  const cuisineMatch = tasteProfile.cuisines.some(c => 
    restaurant.cuisine.toLowerCase().includes(c.toLowerCase()) ||
    c.toLowerCase().includes(restaurant.cuisine.toLowerCase().split(' ')[0])
  );
  if (cuisineMatch) {
    score += 25;
    reasons.push('cuisine');
  }

  // Price preference match (up to +15 points)
  const restaurantPrice = getPricePreference(restaurant.priceLevel);
  if (restaurantPrice === tasteProfile.pricePreference) {
    score += 15;
    reasons.push('price');
  } else if (
    (restaurantPrice === 'mid' && tasteProfile.pricePreference !== 'budget') ||
    (tasteProfile.pricePreference === 'mid')
  ) {
    score += 8;
  }

  // Spice level consideration (+10 points if spicy restaurant matches hot preference)
  const tags = generateRestaurantTags(restaurant);
  const isSpicy = tags.some(t => t.label.includes('Spicy'));
  if (isSpicy && tasteProfile.spiceLevel === 'hot') {
    score += 10;
    reasons.push('spice');
  } else if (!isSpicy && tasteProfile.spiceLevel === 'mild') {
    score += 5;
  }

  // Rating bonus (up to +10 points)
  if (restaurant.rating) {
    score += Math.round((restaurant.rating - 4) * 10);
  }

  // Open status bonus
  if (restaurant.isOpen) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

// Generate reasons for suggestion
function generateSuggestionReasons(
  restaurant: RestaurantData,
  tasteProfile: TasteProfile | null,
  matchScore: number
): SuggestionReason[] {
  const reasons: SuggestionReason[] = [];

  if (!tasteProfile) {
    // Generic reasons for non-personalized users
    if (restaurant.rating && restaurant.rating >= 4.5) {
      reasons.push({ text: 'Highly rated by diners', icon: '⭐', strength: 'strong' });
    }
    if (restaurant.isOpen) {
      reasons.push({ text: 'Open right now', icon: '🍽️', strength: 'medium' });
    }
    return reasons;
  }

  // Cuisine match
  const cuisineMatch = tasteProfile.cuisines.find(c => 
    restaurant.cuisine.toLowerCase().includes(c.toLowerCase())
  );
  if (cuisineMatch) {
    reasons.push({ 
      text: `Matches your love for ${cuisineMatch}`, 
      icon: '❤️', 
      strength: 'strong' 
    });
  }

  // Price match
  const restaurantPrice = getPricePreference(restaurant.priceLevel);
  if (restaurantPrice === tasteProfile.pricePreference) {
    const priceLabels = { budget: 'budget-friendly', mid: 'mid-range', premium: 'premium' };
    reasons.push({ 
      text: `Fits your ${priceLabels[tasteProfile.pricePreference]} preference`, 
      icon: '💰', 
      strength: 'medium' 
    });
  }

  // Spice preference
  const tags = generateRestaurantTags(restaurant);
  const isSpicy = tags.some(t => t.label.includes('Spicy'));
  if (isSpicy && tasteProfile.spiceLevel === 'hot') {
    reasons.push({ text: 'Perfect for spice lovers', icon: '🌶️', strength: 'medium' });
  }

  // Vibe match from ambience
  const vibeTag = tags.find(t => t.category === 'occasion');
  if (vibeTag) {
    reasons.push({ text: `Great for ${vibeTag.label.toLowerCase()}`, icon: '🎯', strength: 'light' });
  }

  // High match score
  if (matchScore >= 85) {
    reasons.push({ text: 'Top match for your taste', icon: '🔥', strength: 'strong' });
  }

  return reasons.slice(0, 3);
}

// Main suggestion engine
export function generateSmartSuggestions(
  restaurants: RestaurantData[],
  tasteProfile: TasteProfile | null,
  limit: number = 5
): SmartSuggestion[] {
  const suggestions = restaurants.map(restaurant => {
    const matchScore = calculateTasteMatchScore(restaurant, tasteProfile);
    const tags = generateRestaurantTags(restaurant);
    const reasons = generateSuggestionReasons(restaurant, tasteProfile, matchScore);

    return {
      restaurant,
      matchScore,
      reasons,
      tags,
      isTopPick: false,
    };
  });

  // Sort by match score
  suggestions.sort((a, b) => b.matchScore - a.matchScore);

  // Mark top pick
  if (suggestions.length > 0) {
    suggestions[0].isTopPick = true;
  }

  return suggestions.slice(0, limit);
}

// Get single best suggestion
export function getTopSuggestion(
  restaurants: RestaurantData[],
  tasteProfile: TasteProfile | null
): SmartSuggestion | null {
  const suggestions = generateSmartSuggestions(restaurants, tasteProfile, 1);
  return suggestions[0] || null;
}

// Get suggestion explanation string
export function getSuggestionExplanation(suggestion: SmartSuggestion): string {
  if (suggestion.reasons.length === 0) {
    return "Outa thinks you'll love this spot";
  }
  return suggestion.reasons[0].text;
}
