import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { generateRestaurantTags } from "@/utils/aiTagging";

export type TasteProfile = {
  spiceLevel: "mild" | "medium" | "hot";
  cuisines: string[];
  pricePreference: "budget" | "mid" | "premium";
  proteins: string[];
  // New fields for enhanced taste modeling
  savedRestaurants: string[];
  visitedRestaurants: string[];
  preferredVibes: string[];
  lastInteraction: string | null;
};

interface RestaurantInteraction {
  id: string;
  name: string;
  cuisine: string;
  priceLevel?: string;
  ambience?: string[];
}

interface TasteProfileContextValue {
  profile: TasteProfile | null;
  setProfile: (profile: TasteProfile) => void;
  resetProfile: () => void;
  isComplete: boolean;
  // New methods for taste modeling
  updateTasteFromInteraction: (restaurant: RestaurantInteraction, interactionType: 'view' | 'save' | 'order') => void;
  getTasteScoreForRestaurant: (restaurant: RestaurantInteraction) => number;
  saveRestaurant: (restaurantId: string) => void;
  unsaveRestaurant: (restaurantId: string) => void;
  isRestaurantSaved: (restaurantId: string) => boolean;
}

const TasteProfileContext = createContext<TasteProfileContextValue | undefined>(undefined);

const STORAGE_KEY = "outa_taste_profile";

const defaultProfile: TasteProfile = {
  spiceLevel: "medium",
  cuisines: [],
  pricePreference: "mid",
  proteins: [],
  savedRestaurants: [],
  visitedRestaurants: [],
  preferredVibes: [],
  lastInteraction: null,
};

export const TasteProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfileState] = useState<TasteProfile | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProfileState(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load taste profile:", error);
    }
  }, []);

  const setProfile = useCallback((newProfile: TasteProfile) => {
    setProfileState(newProfile);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    } catch (error) {
      console.error("Failed to save taste profile:", error);
    }
  }, []);

  const resetProfile = useCallback(() => {
    setProfileState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to reset taste profile:", error);
    }
  }, []);

  // Update taste profile based on restaurant interaction
  const updateTasteFromInteraction = useCallback((
    restaurant: RestaurantInteraction, 
    interactionType: 'view' | 'save' | 'order'
  ) => {
    setProfileState(prev => {
      const current = prev || defaultProfile;
      const newProfile = { ...current };

      // Update visited restaurants
      if (!newProfile.visitedRestaurants.includes(restaurant.id)) {
        newProfile.visitedRestaurants = [...newProfile.visitedRestaurants, restaurant.id].slice(-20);
      }

      // Learn cuisine preference from interactions
      if (interactionType === 'save' || interactionType === 'order') {
        const cuisineType = restaurant.cuisine.split(' ')[0].toLowerCase();
        if (!newProfile.cuisines.some(c => c.toLowerCase() === cuisineType)) {
          // Stronger signal for save/order
          const cuisineLabel = restaurant.cuisine.split(' ')[0];
          if (newProfile.cuisines.length < 5) {
            newProfile.cuisines = [...newProfile.cuisines, cuisineLabel];
          }
        }
      }

      // Learn vibe preferences from ambience
      if (restaurant.ambience && interactionType !== 'view') {
        restaurant.ambience.forEach(vibe => {
          if (!newProfile.preferredVibes.includes(vibe)) {
            newProfile.preferredVibes = [...newProfile.preferredVibes, vibe].slice(-8);
          }
        });
      }

      newProfile.lastInteraction = new Date().toISOString();

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      } catch (error) {
        console.error("Failed to save taste profile:", error);
      }

      return newProfile;
    });
  }, []);

  // Calculate taste match score for a restaurant
  const getTasteScoreForRestaurant = useCallback((restaurant: RestaurantInteraction): number => {
    if (!profile) return 70; // Default score for new users

    let score = 50;

    // Cuisine match (+25)
    const cuisineMatch = profile.cuisines.some(c => 
      restaurant.cuisine.toLowerCase().includes(c.toLowerCase())
    );
    if (cuisineMatch) score += 25;

    // Price preference match (+15)
    const priceLevel = restaurant.priceLevel || '';
    const pounds = (priceLevel.match(/£/g) || []).length;
    const restaurantPrice = pounds <= 1 ? 'budget' : pounds === 2 ? 'mid' : 'premium';
    if (restaurantPrice === profile.pricePreference) score += 15;

    // Vibe match (+10)
    const vibeMatch = restaurant.ambience?.some(a => 
      profile.preferredVibes.includes(a)
    );
    if (vibeMatch) score += 10;

    // Previously visited bonus (+5)
    if (profile.visitedRestaurants.includes(restaurant.id)) score += 5;

    // Saved restaurant bonus (+10)
    if (profile.savedRestaurants.includes(restaurant.id)) score += 10;

    return Math.min(100, Math.max(0, score));
  }, [profile]);

  // Save/unsave restaurant
  const saveRestaurant = useCallback((restaurantId: string) => {
    setProfileState(prev => {
      const current = prev || defaultProfile;
      if (current.savedRestaurants.includes(restaurantId)) return current;
      
      const newProfile = {
        ...current,
        savedRestaurants: [...current.savedRestaurants, restaurantId],
      };
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      } catch (error) {
        console.error("Failed to save restaurant:", error);
      }
      
      return newProfile;
    });
  }, []);

  const unsaveRestaurant = useCallback((restaurantId: string) => {
    setProfileState(prev => {
      if (!prev) return prev;
      
      const newProfile = {
        ...prev,
        savedRestaurants: prev.savedRestaurants.filter(id => id !== restaurantId),
      };
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      } catch (error) {
        console.error("Failed to unsave restaurant:", error);
      }
      
      return newProfile;
    });
  }, []);

  const isRestaurantSaved = useCallback((restaurantId: string): boolean => {
    return profile?.savedRestaurants.includes(restaurantId) ?? false;
  }, [profile]);

  const isComplete = profile !== null && 
    profile.cuisines.length > 0 && 
    profile.proteins.length > 0;

  return (
    <TasteProfileContext.Provider value={{ 
      profile, 
      setProfile, 
      resetProfile, 
      isComplete,
      updateTasteFromInteraction,
      getTasteScoreForRestaurant,
      saveRestaurant,
      unsaveRestaurant,
      isRestaurantSaved,
    }}>
      {children}
    </TasteProfileContext.Provider>
  );
};

export const useTasteProfile = () => {
  const context = useContext(TasteProfileContext);
  if (context === undefined) {
    throw new Error("useTasteProfile must be used within a TasteProfileProvider");
  }
  return context;
};
