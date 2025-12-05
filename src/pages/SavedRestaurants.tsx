import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Bookmark, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";

const SavedRestaurants = () => {
  const navigate = useNavigate();
  
  // Mock saved restaurants - in a real app, this would come from context or database
  const [savedRestaurants] = useState(() => {
    // For demo, show first 2 restaurants as "saved"
    return personalizedRestaurants.slice(0, 2);
  });

  const hasSaved = savedRestaurants.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/30">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full bg-card/80 hover:bg-card"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Saved Restaurants</h1>
              <p className="text-xs text-muted-foreground">Your favourites in one place</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {hasSaved ? (
          <>
            {/* Stats Header */}
            <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple/10 to-card border border-purple/20">
              <div className="w-12 h-12 rounded-full bg-purple/20 flex items-center justify-center">
                <Bookmark className="h-6 w-6 text-purple" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {savedRestaurants.length} saved spot{savedRestaurants.length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ready for your next visit
                </p>
              </div>
            </div>

            {/* Saved List */}
            <div className="space-y-4">
              {savedRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="relative">
                  <div className="w-full">
                    <RestaurantCard
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
                  </div>
                  {/* Saved Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="w-8 h-8 rounded-full bg-purple/90 flex items-center justify-center shadow-lg">
                      <Heart className="h-4 w-4 text-white fill-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Discover More CTA */}
            <div className="mt-8 p-6 rounded-2xl bg-card border border-border/40 text-center">
              <Sparkles className="h-8 w-8 text-purple mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-2">
                Discover more spots
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Explore restaurants and save your favourites
              </p>
              <Button
                onClick={() => navigate("/discover")}
                className="rounded-full bg-purple hover:bg-purple/90 text-white px-6"
              >
                Explore restaurants
              </Button>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-card border border-border/40 flex items-center justify-center mb-6">
              <Heart className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Nothing here yet
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              Save a spot you love by tapping the heart icon on any restaurant card.
            </p>
            <Button
              onClick={() => navigate("/discover")}
              className="rounded-full bg-purple hover:bg-purple/90 text-white px-8 py-6"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Start exploring
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedRestaurants;
