import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search as SearchIcon, X, Clock, Sparkles, TrendingUp, MapPin, Heart, Utensils } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";
import { useUserBehavior } from "@/context/UserBehaviorContext";

const suggestionChips = [
  { label: "Thai restaurants", icon: Utensils },
  { label: "Nigerian food near me", icon: MapPin },
  { label: "Top date night spots", icon: Heart },
  { label: "Highly rated this week", icon: TrendingUp },
  { label: "Budget-friendly (££)", icon: Sparkles },
  { label: "Cozy vibes", icon: Sparkles },
];

const Search = () => {
  const navigate = useNavigate();
  const { behavior, addSearch } = useUserBehavior();
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Filter restaurants based on search query
  const filteredRestaurants = query.trim()
    ? personalizedRestaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.cuisine.toLowerCase().includes(query.toLowerCase()) ||
          r.description.toLowerCase().includes(query.toLowerCase()) ||
          r.ambience.some((a) => a.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    setHasSearched(true);
    addSearch(searchTerm);
  };

  const handleChipClick = (label: string) => {
    handleSearch(label);
  };

  const handleClear = () => {
    setQuery("");
    setHasSearched(false);
  };

  const handleRecentSearchClick = (term: string) => {
    handleSearch(term);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/30">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full bg-card/80 hover:bg-card"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Search</h1>
              <p className="text-xs text-muted-foreground">Find your perfect spot</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search restaurants, cuisines, vibes…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.length > 0) setHasSearched(true);
              }}
              className="w-full pl-12 pr-12 py-6 rounded-2xl bg-card border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:border-purple/50 focus:ring-purple/20 text-base"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Before searching - show suggestions and recent */}
        {!hasSearched && (
          <>
            {/* Quick Suggestion Chips */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple" />
                Quick suggestions
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestionChips.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => handleChipClick(chip.label)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border/60 hover:border-purple/50 hover:bg-purple/5 transition-all text-sm text-foreground"
                  >
                    <chip.icon className="h-3.5 w-3.5 text-purple" />
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            {behavior.recentSearches.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Recent searches
                </h3>
                <div className="space-y-2">
                  {behavior.recentSearches.slice(0, 5).map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handleRecentSearchClick(term)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border/40 hover:border-purple/30 hover:bg-card/80 transition-all text-left"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground/60" />
                      <span className="text-sm text-foreground">{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple" />
                Trending now
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {personalizedRestaurants.slice(0, 2).map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={{
                      id: restaurant.id,
                      name: restaurant.name,
                      cuisine: restaurant.cuisine,
                      rating: restaurant.rating,
                      price_level: restaurant.priceLevel,
                      description: restaurant.description,
                      imageUrl: restaurant.imageUrl,
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Search Results */}
        {hasSearched && (
          <div>
            {filteredRestaurants.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {filteredRestaurants.length} result{filteredRestaurants.length !== 1 ? "s" : ""} for "{query}"
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={{
                        id: restaurant.id,
                        name: restaurant.name,
                        cuisine: restaurant.cuisine,
                        rating: restaurant.rating,
                        price_level: restaurant.priceLevel,
                        description: restaurant.description,
                        imageUrl: restaurant.imageUrl,
                      }}
                    />
                  ))}
                </div>
              </>
            ) : query.trim() ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-card flex items-center justify-center">
                  <SearchIcon className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Try refining your search or explore our suggestions above.
                </p>
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="mt-4 rounded-full border-purple/30 text-purple hover:bg-purple/10"
                >
                  Clear search
                </Button>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-sm text-muted-foreground">Start typing to search...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
