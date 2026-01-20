import { useNavigate } from "react-router-dom";
import { Search, Clock, ChefHat, UtensilsCrossed, Sparkles, X, Loader2, MapPin, TrendingUp, Compass } from "lucide-react";
import { useSearch, SearchResult } from "@/context/SearchContext";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { cn } from "@/lib/utils";

const LiveSearchOverlay = () => {
  const navigate = useNavigate();
  const { query, results, isSearching, isLoading, clearSearch } = useSearch();
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

  const handleQuickAction = (action: string) => {
    clearSearch();
    if (action === 'ask-outa') {
      navigate('/chat');
    } else if (action === 'near-me') {
      navigate('/discover?filter=nearby');
    } else if (action === 'trending') {
      navigate('/discover?filter=trending');
    }
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "restaurant": return <ChefHat className="h-4 w-4" />;
      case "dish": return <UtensilsCrossed className="h-4 w-4" />;
      case "cuisine": return <Compass className="h-4 w-4" />;
      case "suggestion": return <Sparkles className="h-4 w-4" />;
    }
  };

  const getTypeStyles = (type: SearchResult["type"]) => {
    switch (type) {
      case "restaurant": return "bg-purple/10 text-purple border-purple/20";
      case "dish": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "cuisine": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "suggestion": return "bg-gradient-to-r from-purple/10 to-neon-pink/10 text-purple border-purple/20";
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
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-background via-background to-secondary/20 backdrop-blur-xl animate-fade-in">
      {/* Premium Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple/20 to-neon-pink/10 flex items-center justify-center">
              <Search className="h-5 w-5 text-purple" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Search</h2>
              <p className="text-xs text-muted-foreground">Find restaurants, dishes & more</p>
            </div>
          </div>
          <button 
            onClick={clearSearch}
            className="w-10 h-10 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-6 pb-32 overflow-y-auto max-h-[calc(100vh-80px)]">
        {/* Empty/Initial State */}
        {!query && (
          <div className="space-y-8 animate-slide-up">
            {/* Quick Actions */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-purple" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleQuickAction('ask-outa')}
                  className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-purple/10 to-neon-pink/5 border border-purple/20 hover:border-purple/40 transition-all hover:shadow-lg hover:shadow-purple/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-neon-pink flex items-center justify-center mb-3 shadow-lg shadow-purple/30 group-hover:scale-110 transition-transform">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-semibold text-foreground text-sm">Ask Outa</p>
                    <p className="text-xs text-muted-foreground mt-0.5">AI recommendations</p>
                  </div>
                </button>
                
                <button
                  onClick={() => handleQuickAction('near-me')}
                  className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:shadow-lg hover:shadow-emerald-500/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-semibold text-foreground text-sm">Near Me</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Find nearby spots</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Searches */}
            {behavior.recentSearches.length > 0 && (
              <div className="animate-slide-up" style={{ animationDelay: '50ms' }}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Recent Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {behavior.recentSearches.map((search, i) => (
                    <button
                      key={i}
                      onClick={() => handleRecentSearchClick(search)}
                      className="group px-4 py-2 bg-card/80 border border-border/50 rounded-full text-sm font-medium text-foreground hover:bg-purple/10 hover:border-purple/30 hover:text-purple transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground group-hover:text-purple transition-colors" />
                        {search}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-purple" />
                Trending Now
              </h3>
              <div className="space-y-2">
                {['Italian Fine Dining', 'Afro Fusion', 'Thai Cuisine'].map((trend, i) => (
                  <button
                    key={trend}
                    onClick={() => handleRecentSearchClick(trend)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border/30 hover:border-purple/30 hover:bg-purple/5 transition-all group"
                    style={{ animationDelay: `${150 + i * 50}ms` }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple/10 to-neon-pink/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-purple" />
                    </div>
                    <span className="font-medium text-sm text-foreground group-hover:text-purple transition-colors">
                      {trend}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      #{i + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {query && isLoading && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple/20 to-neon-pink/10 flex items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-purple" />
              </div>
              <div className="absolute -inset-2 rounded-3xl bg-purple/10 animate-pulse" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">Searching...</p>
            <p className="text-xs text-muted-foreground mt-1">Finding the best matches</p>
          </div>
        )}

        {/* No Results State */}
        {query && !isLoading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No results found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
              We couldn't find anything for "{query}". Try a different search.
            </p>
            
            {/* Suggestions */}
            <div className="w-full max-w-sm space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center mb-3">
                Outa suggests
              </p>
              <button
                onClick={() => handleQuickAction('ask-outa')}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple/10 to-neon-pink/5 border border-purple/20 hover:border-purple/40 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-neon-pink flex items-center justify-center shadow-lg shadow-purple/20">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm text-foreground">Ask Outa</p>
                  <p className="text-xs text-muted-foreground">Get personalized recommendations</p>
                </div>
              </button>
              
              <button
                onClick={() => handleQuickAction('near-me')}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card/80 border border-border/50 hover:border-purple/30 hover:bg-purple/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-purple" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm text-foreground">Dine-In near you</p>
                  <p className="text-xs text-muted-foreground">Explore nearby restaurants</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Search Results */}
        {query && !isLoading && results.length > 0 && (
          <div className="space-y-6 animate-slide-up">
            {Object.entries(groupedResults).map(([type, items], groupIndex) => (
              <div key={type} style={{ animationDelay: `${groupIndex * 50}ms` }}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className={cn(
                    "w-5 h-5 rounded-md flex items-center justify-center",
                    type === "restaurant" && "bg-purple/10 text-purple",
                    type === "dish" && "bg-amber-500/10 text-amber-600",
                    type === "cuisine" && "bg-emerald-500/10 text-emerald-600",
                    type === "suggestion" && "bg-purple/10 text-purple"
                  )}>
                    {getIcon(type as SearchResult["type"])}
                  </span>
                  {type === "restaurant" ? "Restaurants" :
                   type === "dish" ? "Dishes" :
                   type === "cuisine" ? "Cuisines" : "AI Suggestions"}
                </h3>
                <div className="space-y-2">
                  {items.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card/80 border border-border/40 hover:border-purple/30 hover:bg-purple/5 hover:shadow-lg hover:shadow-purple/5 transition-all text-left group"
                      style={{ animationDelay: `${(groupIndex * 50) + (index * 30)}ms` }}
                    >
                      {result.image ? (
                        <img 
                          src={result.image} 
                          alt={result.name}
                          className="w-14 h-14 rounded-xl object-cover ring-2 ring-border/50 group-hover:ring-purple/30 transition-all"
                        />
                      ) : (
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center border",
                          getTypeStyles(result.type)
                        )}>
                          {getIcon(result.type)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate group-hover:text-purple transition-colors">
                          {result.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{result.subtitle}</p>
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium px-2.5 py-1 rounded-full border",
                        getTypeStyles(result.type)
                      )}>
                        {getTypeLabel(result.type)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSearchOverlay;