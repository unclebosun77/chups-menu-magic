import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  const [dbResults, setDbResults] = useState<SearchResult[]>([]);

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    setIsSearching(newQuery.length > 0);
  }, []);

  // Fetch from Supabase when query changes
  useEffect(() => {
    const searchDatabase = async () => {
      if (!query.trim()) {
        setDbResults([]);
        return;
      }

      setIsLoading(true);
      const q = query.toLowerCase().trim();
      const searchResults: SearchResult[] = [];

      try {
        // Search restaurants
        const { data: restaurants } = await supabase
          .from("restaurants")
          .select("id, name, cuisine_type, logo_url, city")
          .or(`name.ilike.%${q}%,cuisine_type.ilike.%${q}%,description.ilike.%${q}%,city.ilike.%${q}%`)
          .limit(6);

        if (restaurants) {
          restaurants.forEach(restaurant => {
            searchResults.push({
              type: "restaurant",
              id: restaurant.id,
              name: restaurant.name,
              subtitle: `${restaurant.cuisine_type}${restaurant.city ? ` · ${restaurant.city}` : ''}`,
              image: restaurant.logo_url || undefined,
              route: `/restaurant/${restaurant.id}`,
            });
          });
        }

        // Search menu items (dishes)
        const { data: menuItems } = await supabase
          .from("menu_items")
          .select("id, name, category, image_url, restaurant_id")
          .or(`name.ilike.%${q}%,category.ilike.%${q}%,description.ilike.%${q}%`)
          .limit(6);

        if (menuItems) {
          menuItems.forEach(dish => {
            searchResults.push({
              type: "dish",
              id: dish.id,
              name: dish.name,
              subtitle: dish.category,
              image: dish.image_url || undefined,
              route: `/restaurant/${dish.restaurant_id}`,
            });
          });
        }

        // Add cuisine suggestions based on query
        const cuisineKeywords = [
          { key: "italian", label: "Italian" },
          { key: "nigerian", label: "Nigerian" },
          { key: "thai", label: "Thai" },
          { key: "asian", label: "Asian" },
          { key: "afro", label: "Afro Fusion" },
          { key: "chinese", label: "Chinese" },
          { key: "indian", label: "Indian" },
          { key: "mexican", label: "Mexican" },
          { key: "japanese", label: "Japanese" },
        ];

        cuisineKeywords.forEach(({ key, label }) => {
          if (key.includes(q) || q.includes(key)) {
            searchResults.push({
              type: "cuisine",
              id: key,
              name: label,
              subtitle: "Cuisine type",
              route: `/discover?cuisine=${label}`,
            });
          }
        });

        // Add AI suggestions based on common intents
        const aiSuggestions = [
          { keywords: ["spicy", "hot"], suggestion: "Find something spicy", route: "/discover?q=spicy" },
          { keywords: ["cheap", "budget", "affordable"], suggestion: "Budget-friendly options", route: "/discover?price=budget" },
          { keywords: ["best", "top", "rated"], suggestion: "Top-rated restaurants", route: "/discover?sort=rating" },
          { keywords: ["near", "nearby", "close"], suggestion: "Places nearby", route: "/discover?sort=distance" },
          { keywords: ["open", "now"], suggestion: "Open right now", route: "/discover?open=true" },
        ];

        aiSuggestions.forEach(({ keywords, suggestion, route }) => {
          if (keywords.some(kw => q.includes(kw))) {
            searchResults.push({
              type: "suggestion",
              id: `ai-${keywords[0]}`,
              name: suggestion,
              subtitle: "AI suggestion",
              route,
            });
          }
        });

        setDbResults(searchResults.slice(0, 12));
      } catch (error) {
        console.error("Search error:", error);
        setDbResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(searchDatabase, 250);
    return () => clearTimeout(timeoutId);
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
    setDbResults([]);
  }, []);

  return (
    <SearchContext.Provider value={{ 
      query, 
      setQuery, 
      results: dbResults, 
      isSearching,
      isLoading,
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
