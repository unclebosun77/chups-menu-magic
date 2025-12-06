// Restaurant Onboarding Draft Store
// Persists onboarding progress locally for restoration

import { generateRestaurantTags } from './aiTagging';

export interface MenuItemDraft {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  tags: string[];
}

export interface MenuCategoryDraft {
  id: string;
  name: string;
  description: string;
  items: MenuItemDraft[];
}

export interface GalleryImageDraft {
  id: string;
  url: string;
  type: 'interior' | 'exterior' | 'food' | 'staff';
  order: number;
}

export interface OpeningHoursDraft {
  open: string;
  close: string;
  closed: boolean;
  intervals?: { open: string; close: string; label: string }[];
}

export interface RestaurantDraft {
  step: number;
  completedSteps: number[];
  profile: {
    name: string;
    description: string;
    cuisines: string[];
    region: string;
    priceRange: string;
    tags: string[];
    latitude: string;
    longitude: string;
    phone: string;
    website: string;
  };
  branding: {
    logo?: string;
    coverPhoto?: string;
  };
  gallery: GalleryImageDraft[];
  menu: MenuCategoryDraft[];
  hours: Record<string, OpeningHoursDraft>;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'outa_restaurant_onboarding_draft';

const DEFAULT_HOURS: Record<string, OpeningHoursDraft> = {
  monday: { open: '10:00', close: '22:00', closed: false },
  tuesday: { open: '10:00', close: '22:00', closed: false },
  wednesday: { open: '10:00', close: '22:00', closed: false },
  thursday: { open: '10:00', close: '22:00', closed: false },
  friday: { open: '10:00', close: '23:00', closed: false },
  saturday: { open: '11:00', close: '23:00', closed: false },
  sunday: { open: '12:00', close: '21:00', closed: false },
};

const DEFAULT_DRAFT: RestaurantDraft = {
  step: 1,
  completedSteps: [],
  profile: {
    name: '',
    description: '',
    cuisines: [],
    region: '',
    priceRange: '££',
    tags: [],
    latitude: '52.4862',
    longitude: '-1.8904',
    phone: '',
    website: '',
  },
  branding: {},
  gallery: [],
  menu: [
    { id: 'cat-1', name: 'Starters', description: 'Begin your journey', items: [] },
    { id: 'cat-2', name: 'Mains', description: 'Signature dishes', items: [] },
    { id: 'cat-3', name: 'Desserts', description: 'Sweet endings', items: [] },
    { id: 'cat-4', name: 'Drinks', description: 'Beverages', items: [] },
  ],
  hours: DEFAULT_HOURS,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Load draft from localStorage
export function loadRestaurantDraft(): RestaurantDraft {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load restaurant draft:', error);
  }
  return { ...DEFAULT_DRAFT, createdAt: new Date().toISOString() };
}

// Save specific step data
export function saveRestaurantDraft(
  step: keyof Omit<RestaurantDraft, 'step' | 'completedSteps' | 'createdAt' | 'updatedAt'>,
  data: any
): RestaurantDraft {
  const current = loadRestaurantDraft();
  const updated: RestaurantDraft = {
    ...current,
    [step]: data,
    updatedAt: new Date().toISOString(),
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save restaurant draft:', error);
  }
  
  return updated;
}

// Update step progress
export function updateDraftStep(step: number, markComplete: boolean = false): RestaurantDraft {
  const current = loadRestaurantDraft();
  const updated: RestaurantDraft = {
    ...current,
    step,
    completedSteps: markComplete && !current.completedSteps.includes(step - 1)
      ? [...current.completedSteps, step - 1]
      : current.completedSteps,
    updatedAt: new Date().toISOString(),
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update draft step:', error);
  }
  
  return updated;
}

// Clear draft
export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}

// Compile final restaurant profile for submission
export function compileRestaurantProfile(draft: RestaurantDraft) {
  // Generate auto-tags based on menu and profile
  const menuText = draft.menu
    .flatMap(cat => cat.items.map(item => `${item.name} ${item.description}`))
    .join(' ');
  
  const autoTags = generateRestaurantTags({
    name: draft.profile.name,
    cuisine: draft.profile.cuisines.join(', '),
    description: draft.profile.description + ' ' + menuText,
    priceLevel: draft.profile.priceRange,
  });

  return {
    restaurant: {
      name: draft.profile.name,
      description: draft.profile.description,
      cuisine_type: draft.profile.cuisines.join(', '),
      region: draft.profile.region,
      price_level: draft.profile.priceRange,
      phone: draft.profile.phone,
      website: draft.profile.website,
      latitude: parseFloat(draft.profile.latitude) || 52.4862,
      longitude: parseFloat(draft.profile.longitude) || -1.8904,
      logo_url: draft.branding.logo,
      cover_url: draft.branding.coverPhoto,
      hours: draft.hours,
      tags: [...draft.profile.tags, ...autoTags.map(t => t.label)],
    },
    gallery: draft.gallery,
    menu: draft.menu.map(cat => ({
      name: cat.name,
      description: cat.description,
      items: cat.items.map(item => ({
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image,
        tags: item.tags,
      })),
    })),
    autoGeneratedTags: autoTags,
    completeness: calculateCompleteness(draft),
  };
}

// Calculate profile completeness
function calculateCompleteness(draft: RestaurantDraft): number {
  let score = 0;
  const weights = {
    name: 15,
    description: 10,
    cuisines: 10,
    region: 5,
    logo: 10,
    coverPhoto: 10,
    gallery: 10,
    menu: 20,
    hours: 10,
  };

  if (draft.profile.name) score += weights.name;
  if (draft.profile.description) score += weights.description;
  if (draft.profile.cuisines.length > 0) score += weights.cuisines;
  if (draft.profile.region) score += weights.region;
  if (draft.branding.logo) score += weights.logo;
  if (draft.branding.coverPhoto) score += weights.coverPhoto;
  if (draft.gallery.length >= 3) score += weights.gallery;
  if (draft.menu.some(cat => cat.items.length > 0)) score += weights.menu;
  if (Object.values(draft.hours).some(h => !h.closed)) score += weights.hours;

  return score;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
