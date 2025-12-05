import { useNavigate } from "react-router-dom";
import { Search, Clock, ChefHat, UtensilsCrossed, Sparkles, X, MapPin, Star } from "lucide-react";
import { useSearch, SearchResult } from "@/context/SearchContext";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";
import UniversalRestaurantCard from "@/components/restaurant/UniversalRestaurantCard";

const LiveSearchOverlay = () => {
  const navigate = useNavigate();
  const { query, results, isSearching, clearSearch } = useSearch();
  const { behavior, addSearch } = useUserBehavior();

  if (!isSearching) return null;

  const handleResultClick = (result: SearchResult) => {
    addSearch(query);
    clearSearch();
    navigate(result.route);
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    clearSearch();
    navigate(`/discover?q=${encodeURIComponent(searchTerm)}`);
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "restaurant": return <ChefHat className="h-4 w-4 text-purple" />;
      case "dish": return <UtensilsCrossed className="h-4 w-4 text-orange-500" />;
      case "cuisine": return <Search className="h-4 w-4 text-muted-foreground" />;
      case "suggestion": return <Sparkles className="h-4 w-4 text-purple" />;
    }
  };

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Get restaurant data for restaurant results
  const getRestaurantData = (result: SearchResult) => {
    return personalizedRestaurants.find(r => r.id === result.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur-md overflow-y-auto">
      <div className="px-4 pt-4 pb-6">
        {/* Close button */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={clearSearch}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Recent searches */}
        {!query && behavior.recentSearches.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              Recent Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {behavior.recentSearches.map((search, i) => (
                <button
                  key={i}
                  onClick={() => handleRecentSearchClick(search)}
                  className="px-3 py-1.5 bg-card border border-border/60 rounded-full text-sm text-foreground hover:bg-secondary/50 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search results */}
        {query && (
          <div className="space-y-6">
            {results.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No results found for "{query}"</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Try searching for a restaurant, dish, or cuisine</p>
              </div>
            ) : (
              <>
                {/* Restaurant Results - Use Universal Card */}
                {groupedResults.restaurant && groupedResults.restaurant.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                      Restaurants
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                      {groupedResults.restaurant.map((result) => {
                        const restaurantData = getRestaurantData(result);
                        if (restaurantData) {
                          return (
                            <UniversalRestaurantCard
                              key={result.id}
                              restaurant={{
                                id: restaurantData.id,
                                name: restaurantData.name,
                                cuisine: restaurantData.cuisine,
                                description: restaurantData.description,
                                ambience: restaurantData.ambience,
                                priceLevel: restaurantData.priceLevel,
                                matchScore: restaurantData.matchScore,
                                aiReason: restaurantData.aiReason,
                                isOpen: restaurantData.isOpen,
                                distance: restaurantData.distance,
                                rating: restaurantData.rating,
                                logoUrl: restaurantData.logoUrl,
                                imageUrl: restaurantData.imageUrl,
                              }}
                              size="compact"
                            />
                          );
                        }
                        // Fallback for non-demo restaurants
                        return (
                          <UniversalRestaurantCard
                            key={result.id}
                            restaurant={{
                              id: result.id,
                              name: result.name,
                              cuisine: result.subtitle || "Restaurant",
                              imageUrl: result.image,
                            }}
                            size="compact"
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dish Results */}
                {groupedResults.dish && groupedResults.dish.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      Dishes
                    </h3>
                    <div className="space-y-2">
                      {groupedResults.dish.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40 hover:border-purple/30 hover:bg-secondary/30 transition-all text-left"
                        >
                          {result.image ? (
                            <img 
                              src={result.image} 
                              alt={result.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                              <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{result.name}</p>
                            <p className="text-xs text-muted-foreground/70">{result.subtitle}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground/50 bg-secondary/50 px-2 py-0.5 rounded-full">
                            Dish
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cuisine Results */}
                {groupedResults.cuisine && groupedResults.cuisine.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      Cuisines
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {groupedResults.cuisine.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="px-4 py-2 rounded-xl bg-card border border-border/40 hover:border-purple/30 hover:bg-secondary/30 transition-all"
                        >
                          <span className="font-medium text-sm text-foreground">{result.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Suggestions */}
                {groupedResults.suggestion && groupedResults.suggestion.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-purple" />
                      AI Suggestions
                    </h3>
                    <div className="space-y-2">
                      {groupedResults.suggestion.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple/5 border border-purple/20 hover:bg-purple/10 transition-all text-left"
                        >
                          <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-purple" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{result.name}</p>
                            <p className="text-xs text-purple/70">{result.subtitle}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSearchOverlay;
