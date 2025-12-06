// Outa Chat Engine - Mock AI for conversational discovery
import { TasteProfile } from '@/context/TasteProfileContext';
import { generateRestaurantTags } from './aiTagging';
import { rankNearbyOptions } from './nearbyEngine';

export interface ChatMessage {
  id: string;
  type: 'user' | 'outa';
  content: string;
  timestamp: Date;
  data?: {
    restaurants?: any[];
    quickFilters?: string[];
    itinerary?: ItineraryStep[];
  };
}

export interface ItineraryStep {
  id: string;
  type: 'pre-drinks' | 'dinner' | 'activity' | 'dessert';
  title: string;
  venue?: string;
  time: string;
  walkingTime?: string;
  description: string;
}

interface ParsedIntent {
  type: 'recommendation' | 'filter' | 'itinerary' | 'general';
  keywords: string[];
  vibes: string[];
  regions: string[];
  cuisines: string[];
  priceLevel?: string;
}

// Keywords for parsing natural language
const VIBE_KEYWORDS = ['romantic', 'cozy', 'fancy', 'casual', 'lively', 'quiet', 'date', 'birthday', 'celebration', 'group', 'intimate'];
const REGION_KEYWORDS = ['mailbox', 'digbeth', 'jewellery quarter', 'broad street', 'soho', 'city centre', 'near me', 'nearby'];
const CUISINE_KEYWORDS = ['afro', 'caribbean', 'italian', 'thai', 'indian', 'chinese', 'japanese', 'mexican', 'british', 'african'];
const PRICE_KEYWORDS = { 'cheap': '£', 'budget': '£', 'affordable': '££', 'mid-range': '££', 'fancy': '£££', 'expensive': '££££', 'luxury': '££££' };
const ITINERARY_TRIGGERS = ['plan', 'evening', 'night out', 'full night', 'itinerary', 'schedule'];

function parseIntent(message: string): ParsedIntent {
  const lower = message.toLowerCase();
  
  const vibes = VIBE_KEYWORDS.filter(v => lower.includes(v));
  const regions = REGION_KEYWORDS.filter(r => lower.includes(r));
  const cuisines = CUISINE_KEYWORDS.filter(c => lower.includes(c));
  const priceLevel = Object.entries(PRICE_KEYWORDS).find(([k]) => lower.includes(k))?.[1];
  
  const isItinerary = ITINERARY_TRIGGERS.some(t => lower.includes(t));
  const hasFilters = vibes.length > 0 || regions.length > 0 || cuisines.length > 0;
  
  return {
    type: isItinerary ? 'itinerary' : hasFilters ? 'filter' : 'recommendation',
    keywords: [...vibes, ...regions, ...cuisines],
    vibes,
    regions,
    cuisines,
    priceLevel,
  };
}

function generatePersonalizedGreeting(tasteProfile: TasteProfile | null): string {
  if (!tasteProfile) {
    return "Hey! 👋 I'm Outa, your personal dining guide. What kind of experience are you looking for tonight?";
  }
  
  const cuisines = tasteProfile.cuisines?.slice(0, 2).join(' and ') || 'good food';
  const spice = tasteProfile.spiceLevel === 'hot' ? 'I know you like it spicy! 🌶️' : '';
  
  return `Hey! 👋 I see you're into ${cuisines}. ${spice} What are we feeling tonight?`;
}

function generateRecommendationResponse(
  intent: ParsedIntent,
  restaurants: any[],
  tasteProfile: TasteProfile | null,
  userLocation: any
): ChatMessage['data'] & { content: string } {
  let filtered = [...restaurants];
  let responseText = '';
  
  // Apply filters based on intent
  if (intent.vibes.length > 0) {
    responseText = `Looking for something ${intent.vibes.join(' and ')}... `;
  }
  
  if (intent.regions.length > 0) {
    const region = intent.regions[0];
    filtered = filtered.filter(r => 
      r.region?.toLowerCase().includes(region) || region.includes('near')
    );
    responseText += `in ${region.charAt(0).toUpperCase() + region.slice(1)} `;
  }
  
  if (intent.cuisines.length > 0) {
    filtered = filtered.filter(r => 
      intent.cuisines.some(c => r.cuisine?.toLowerCase().includes(c))
    );
  }
  
  // Rank by taste + location
  const ranked = rankNearbyOptions(filtered, userLocation, tasteProfile, {
    tasteWeight: 0.7,
    distanceWeight: 0.3,
    maxDistance: 10,
  });
  
  const top3 = ranked.slice(0, 3);
  
  if (top3.length === 0) {
    return {
      content: "Hmm, I couldn't find an exact match for that. Want me to broaden the search? 🔍",
      restaurants: [],
      quickFilters: ['Show all nearby', 'Try different cuisine', 'Surprise me'],
    };
  }
  
  // Generate personalized response
  const topMatch = top3[0];
  responseText += `\n\nI found ${top3.length} great options for you! `;
  
  if (topMatch.tasteScore > 80) {
    responseText += `**${topMatch.name}** is a ${topMatch.tasteScore}% match with your taste. `;
  }
  
  if (topMatch.distance < 1) {
    responseText += `It's only ${topMatch.distanceText} away! 📍`;
  }
  
  return {
    content: responseText,
    restaurants: top3,
    quickFilters: ['See more options', 'Different vibe', 'Book a table'],
  };
}

function generateItinerary(
  restaurants: any[],
  tasteProfile: TasteProfile | null
): ChatMessage['data'] & { content: string } {
  const itinerary: ItineraryStep[] = [
    {
      id: '1',
      type: 'pre-drinks',
      title: '🍸 Pre-Dinner Drinks',
      venue: 'The Alchemist',
      time: '6:30 PM',
      walkingTime: '5 min walk to dinner',
      description: 'Start with craft cocktails in a vibrant atmosphere',
    },
    {
      id: '2',
      type: 'dinner',
      title: '🍽️ Main Course',
      venue: restaurants[0]?.name || 'Yakoyo',
      time: '7:30 PM',
      walkingTime: '3 min walk',
      description: `Perfect ${tasteProfile?.cuisines?.[0] || 'dining'} experience matched to your taste`,
    },
    {
      id: '3',
      type: 'dessert',
      title: '🍰 Dessert & Coffee',
      venue: 'Damascena',
      time: '9:30 PM',
      walkingTime: '4 min walk',
      description: 'Wind down with artisan pastries and specialty coffee',
    },
    {
      id: '4',
      type: 'activity',
      title: '🎵 Late Night Vibes',
      venue: 'The Night Owl',
      time: '10:30 PM',
      description: 'Live jazz and cocktails to end the evening',
    },
  ];
  
  return {
    content: "I've planned the perfect evening for you! Here's your personalized itinerary: ✨",
    itinerary,
    quickFilters: ['Adjust timing', 'Different venues', 'Save this plan'],
  };
}

// Pre-defined conversational responses for common queries
const CONVERSATIONAL_RESPONSES: Record<string, string> = {
  'hello': "Hey! 👋 Ready to discover something amazing tonight?",
  'hi': "Hi there! What kind of dining experience are you looking for? 🍽️",
  'thanks': "You're welcome! Enjoy your meal! 🎉 Let me know if you need anything else.",
  'thank you': "My pleasure! Have an amazing time! 💜",
  'help': "I can help you find restaurants, plan your evening, or discover new experiences. Just tell me what you're in the mood for!",
};

export function processUserMessage(
  message: string,
  tasteProfile: TasteProfile | null,
  userLocation: any,
  restaurants: any[]
): ChatMessage['data'] & { content: string } {
  const lower = message.toLowerCase().trim();
  
  // Check for simple conversational responses
  for (const [trigger, response] of Object.entries(CONVERSATIONAL_RESPONSES)) {
    if (lower.includes(trigger)) {
      return { content: response };
    }
  }
  
  // Parse user intent
  const intent = parseIntent(message);
  
  // Generate appropriate response
  switch (intent.type) {
    case 'itinerary':
      return generateItinerary(restaurants, tasteProfile);
    
    case 'filter':
    case 'recommendation':
      return generateRecommendationResponse(intent, restaurants, tasteProfile, userLocation);
    
    default:
      return {
        content: "I'm not quite sure what you're looking for. Could you tell me more about the vibe you want? 🤔",
        quickFilters: ['Romantic dinner', 'Casual bites', 'Group celebration', 'Date night'],
      };
  }
}

export function getInitialMessage(tasteProfile: TasteProfile | null): ChatMessage {
  return {
    id: 'initial',
    type: 'outa',
    content: generatePersonalizedGreeting(tasteProfile),
    timestamp: new Date(),
    data: {
      quickFilters: [
        'Find a romantic restaurant 💕',
        'Show me something nearby 📍',
        'Best Afro-Caribbean places 🌍',
        'Plan my evening ✨',
        'Surprise me! 🎲',
      ],
    },
  };
}

export function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
