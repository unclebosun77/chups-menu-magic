import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type UserBehavior = {
  recentSearches: string[];
  visitedRestaurants: { id: string; name: string; cuisine: string; timestamp: number }[];
  viewedDishes: { id: string; name: string; category: string; timestamp: number }[];
  preferredCuisines: string[];
  likesSpicy: boolean;
  searchFrequency: number;
};

interface UserBehaviorContextValue {
  behavior: UserBehavior;
  addSearch: (query: string) => void;
  addRestaurantVisit: (restaurant: { id: string; name: string; cuisine: string }) => void;
  addDishView: (dish: { id: string; name: string; category: string }) => void;
  getRecommendedCuisines: () => string[];
  shouldBoostCuisine: (cuisine: string) => boolean;
  shouldBoostSpicy: () => boolean;
  clearHistory: () => void;
}

const UserBehaviorContext = createContext<UserBehaviorContextValue | undefined>(undefined);

const STORAGE_KEY = "outa_user_behavior";

const defaultBehavior: UserBehavior = {
  recentSearches: [],
  visitedRestaurants: [],
  viewedDishes: [],
  preferredCuisines: [],
  likesSpicy: false,
  searchFrequency: 0,
};

export const UserBehaviorProvider = ({ children }: { children: ReactNode }) => {
  const [behavior, setBehavior] = useState<UserBehavior>(defaultBehavior);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBehavior(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load user behavior:", error);
    }
  }, []);

  // Save to localStorage whenever behavior changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(behavior));
    } catch (error) {
      console.error("Failed to save user behavior:", error);
    }
  }, [behavior]);

  const addSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setBehavior(prev => ({
      ...prev,
      recentSearches: [query, ...prev.recentSearches.filter(s => s !== query)].slice(0, 5),
      searchFrequency: prev.searchFrequency + 1,
    }));
  }, []);

  const addRestaurantVisit = useCallback((restaurant: { id: string; name: string; cuisine: string }) => {
    setBehavior(prev => {
      const newVisits = [
        { ...restaurant, timestamp: Date.now() },
        ...prev.visitedRestaurants.filter(r => r.id !== restaurant.id),
      ].slice(0, 20);
      
      // Update preferred cuisines based on visits
      const cuisineCounts: Record<string, number> = {};
      newVisits.forEach(v => {
        cuisineCounts[v.cuisine] = (cuisineCounts[v.cuisine] || 0) + 1;
      });
      const sortedCuisines = Object.entries(cuisineCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([cuisine]) => cuisine);

      return {
        ...prev,
        visitedRestaurants: newVisits,
        preferredCuisines: sortedCuisines,
      };
    });
  }, []);

  const addDishView = useCallback((dish: { id: string; name: string; category: string }) => {
    setBehavior(prev => {
      const newViews = [
        { ...dish, timestamp: Date.now() },
        ...prev.viewedDishes.filter(d => d.id !== dish.id),
      ].slice(0, 30);
      
      // Detect spicy preference from dish names/categories
      const spicyKeywords = ['spicy', 'hot', 'pepper', 'chili', 'suya'];
      const hasSpicyViews = newViews.filter(d => 
        spicyKeywords.some(k => d.name.toLowerCase().includes(k) || d.category.toLowerCase().includes(k))
      ).length >= 2;

      return {
        ...prev,
        viewedDishes: newViews,
        likesSpicy: hasSpicyViews,
      };
    });
  }, []);

  const getRecommendedCuisines = useCallback(() => {
    return behavior.preferredCuisines;
  }, [behavior.preferredCuisines]);

  const shouldBoostCuisine = useCallback((cuisine: string) => {
    return behavior.preferredCuisines.some(
      c => c.toLowerCase().includes(cuisine.toLowerCase()) || 
           cuisine.toLowerCase().includes(c.toLowerCase())
    );
  }, [behavior.preferredCuisines]);

  const shouldBoostSpicy = useCallback(() => {
    return behavior.likesSpicy;
  }, [behavior.likesSpicy]);

  const clearHistory = useCallback(() => {
    setBehavior(defaultBehavior);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <UserBehaviorContext.Provider value={{ 
      behavior, 
      addSearch, 
      addRestaurantVisit, 
      addDishView,
      getRecommendedCuisines,
      shouldBoostCuisine,
      shouldBoostSpicy,
      clearHistory,
    }}>
      {children}
    </UserBehaviorContext.Provider>
  );
};

export const useUserBehavior = () => {
  const context = useContext(UserBehaviorContext);
  if (context === undefined) {
    throw new Error("useUserBehavior must be used within a UserBehaviorProvider");
  }
  return context;
};
