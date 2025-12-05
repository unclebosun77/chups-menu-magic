import { useNavigate } from "react-router-dom";
import { Search, Clock, ChefHat, UtensilsCrossed, Sparkles, X } from "lucide-react";
import { useSearch, SearchResult } from "@/context/SearchContext";
import { useUserBehavior } from "@/context/UserBehaviorContext";

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
    // Navigate to discover with the search query
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

  const getTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "restaurant": return "Restaurant";
      case "dish": return "Dish";
      case "cuisine": return "Cuisine";
      case "suggestion": return "AI Suggestion";
    }
  };

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
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

        {/* Recent searches (show when query is empty) */}
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
          <div className="space-y-4">
            {results.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No results found for "{query}"</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Try searching for a restaurant, dish, or cuisine</p>
              </div>
            ) : (
              Object.entries(groupedResults).map(([type, items]) => (
                <div key={type}>
                  <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    {type === "restaurant" ? "Restaurants" :
                     type === "dish" ? "Dishes" :
                     type === "cuisine" ? "Cuisines" : "Suggestions"}
                  </h3>
                  <div className="space-y-1">
                    {items.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40 hover:border-purple/30 hover:bg-secondary/30 transition-all text-left"
                      >
                        {result.image ? (
                          <img 
                            src={result.image} 
                            alt={result.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            {getIcon(result.type)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{result.name}</p>
                          <p className="text-xs text-muted-foreground/70">{result.subtitle}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground/50 bg-secondary/50 px-2 py-0.5 rounded-full">
                          {getTypeLabel(result.type)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSearchOverlay;
