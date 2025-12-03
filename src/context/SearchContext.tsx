import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";
import { seedDishes } from "@/data/dishes";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";

export type SearchResult = {
  type: "restaurant" | "dish" | "cuisine" | "suggestion";
  id: string;
  name: string;
  subtitle?: string;
  image?: string;
  route: string;
};

export type SearchFilter = {
  cuisine?: string;
  priceRange?: string;
  openNow?: boolean;
  rating?: number;
  distance?: number;
  sortBy?: "popularity" | "rating" | "distance" | "price";
};

interface SearchContextValue {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isSearching: boolean;
  activeFilter: SearchFilter;
  setActiveFilter: (filter: SearchFilter) => void;
  clearSearch: () => void;
  highlightedCuisine: string | null;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [query, setQueryState] = useState("");
  const [activeFilter, setActiveFilter] = useState<SearchFilter>({});
  const [isSearching, setIsSearching] = useState(false);

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    setIsSearching(newQuery.length > 0);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const q = query.toLowerCase().trim();
    const searchResults: SearchResult[] = [];

    // Search restaurants
    personalizedRestaurants.forEach(restaurant => {
      if (
        restaurant.name.toLowerCase().includes(q) ||
        restaurant.cuisine.toLowerCase().includes(q) ||
        restaurant.aiReason?.toLowerCase().includes(q)
      ) {
        searchResults.push({
          type: "restaurant",
          id: restaurant.id,
          name: restaurant.name,
          subtitle: restaurant.cuisine,
          image: restaurant.logoUrl,
          route: `/restaurant/demo/${restaurant.id}`,
        });
      }
    });

    // Search dishes
    seedDishes.forEach(dish => {
      if (
        dish.name.toLowerCase().includes(q) ||
        dish.category.toLowerCase().includes(q)
      ) {
        searchResults.push({
          type: "dish",
          id: dish.id,
          name: dish.name,
          subtitle: dish.category,
          image: dish.image,
          route: dish.restaurants.length > 0 
            ? `/restaurant/demo/${dish.restaurants[0].id}`
            : "/discover",
        });
      }
    });

    // Search cuisines
    const cuisines = ["Italian", "Nigerian", "Thai", "Asian", "Afro Fusion"];
    cuisines.forEach(cuisine => {
      if (cuisine.toLowerCase().includes(q)) {
        searchResults.push({
          type: "cuisine",
          id: cuisine.toLowerCase(),
          name: cuisine,
          subtitle: "Cuisine type",
          route: `/discover?cuisine=${cuisine}`,
        });
      }
    });

    // AI suggestions based on query
    const aiSuggestions = [
      { query: "spicy", suggestion: "Find something spicy near me", route: "/discover?spicy=true" },
      { query: "cheap", suggestion: "Budget-friendly options", route: "/discover?price=budget" },
      { query: "best", suggestion: "Top-rated restaurants", route: "/discover?sort=rating" },
      { query: "near", suggestion: "Places nearby", route: "/discover?sort=distance" },
    ];

    aiSuggestions.forEach(({ query: keyword, suggestion, route }) => {
      if (q.includes(keyword)) {
        searchResults.push({
          type: "suggestion",
          id: `ai-${keyword}`,
          name: suggestion,
          subtitle: "AI suggestion",
          route,
        });
      }
    });

    return searchResults.slice(0, 10);
  }, [query]);

  // Determine if a cuisine should be highlighted based on search
  const highlightedCuisine = useMemo(() => {
    const q = query.toLowerCase();
    if (q.includes("italian") || q.includes("pasta")) return "Italian";
    if (q.includes("nigerian") || q.includes("jollof") || q.includes("afro")) return "Nigerian";
    if (q.includes("thai") || q.includes("curry")) return "Thai";
    if (q.includes("asian")) return "Asian";
    return null;
  }, [query]);

  const clearSearch = useCallback(() => {
    setQueryState("");
    setActiveFilter({});
    setIsSearching(false);
  }, []);

  return (
    <SearchContext.Provider value={{ 
      query, 
      setQuery, 
      results, 
      isSearching,
      activeFilter,
      setActiveFilter,
      clearSearch,
      highlightedCuisine,
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
