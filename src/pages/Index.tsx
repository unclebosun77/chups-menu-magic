import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChefHat, MapPin, Star, Search, UtensilsCrossed, Sparkles, Calendar, Bot, Rocket } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import SkeletonCard from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";

type Restaurant = {
  id: string;
  name: string;
  cuisine_type: string;
  description: string | null;
  logo_url: string | null;
  is_open: boolean;
  latitude: number | null;
  longitude: number | null;
};

const Index = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);
  
  const categories = ["All", "Afro", "Italian", "Asian", "Fast Food", "Desserts"];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadRestaurants = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, cuisine_type, description, logo_url, is_open, latitude, longitude")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error && data) {
        setRestaurants(data);
      }
      setIsLoading(false);
    };

    loadRestaurants();
  }, []);

  // Get display cuisine tag
  const getCuisineTag = (cuisineType: string) => {
    if (cuisineType.toLowerCase().includes('afro') || cuisineType.toLowerCase().includes('nigerian')) {
      return 'Afro';
    }
    return cuisineType;
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="space-y-8 p-5 pb-24">
        {/* Dev: Quick Onboarding Access */}
        {restaurants.length === 0 && (
          <div className="bg-purple/5 border border-purple/20 rounded-2xl p-4 shadow-soft">
            <p className="text-sm text-foreground mb-2">👋 No spots yet!</p>
            <Button 
              onClick={() => navigate("/restaurant/onboarding")}
              className="w-full bg-purple text-primary-foreground hover:bg-purple-hover shadow-soft"
              size="sm"
            >
              <Rocket className="mr-2 h-4 w-4" />
              Add Your First Spot
            </Button>
          </div>
        )}

        {/* Hero Section - Premium Card */}
        <div className="pt-1">
          <div className="bg-card p-5 rounded-2xl shadow-card border border-purple/15 relative overflow-hidden">
            {/* Subtle gradient border glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple/5 via-transparent to-neon-pink/5 pointer-events-none" />
            
            <div className="relative z-10">
              <h1 className="text-xl font-semibold mb-1 text-foreground">
                Where are we heading tonight?
              </h1>
              <p className="text-sm text-muted-foreground mb-4">
                Discover places that match your vibe.
              </p>
              
              {/* AI Suggestion Chips - Horizontal Scroll */}
              <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide -mx-1 px-1">
                <Badge className="flex-shrink-0 bg-card hover:bg-secondary text-foreground border border-purple/25 text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all hover:border-purple/40 shadow-pill">
                  🔥 Vibes match
                </Badge>
                <Badge className="flex-shrink-0 bg-card hover:bg-secondary text-foreground border border-purple/25 text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all hover:border-purple/40 shadow-pill">
                  ⚡ Ready now
                </Badge>
                <Badge className="flex-shrink-0 bg-card hover:bg-secondary text-foreground border border-purple/25 text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all hover:border-purple/40 shadow-pill">
                  🐝 Budget-friendly
                </Badge>
              </div>
              
              {/* Search Bar */}
              <div className="relative mb-4">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple" />
                <Input
                  placeholder="Find your next spot..."
                  className="pl-10 bg-card border border-border focus:border-purple/50 text-foreground placeholder:text-muted-foreground rounded-xl h-11 shadow-soft"
                />
              </div>
              
              {/* Let's goo button */}
              <Button 
                className="w-full bg-purple text-primary-foreground hover:bg-purple-hover rounded-xl h-11 font-medium shadow-soft"
                onClick={() => navigate("/discover")}
              >
                Let's goo 🚀
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions - Pill Buttons */}
        <div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => navigate("/discover")}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-card border border-purple/20 rounded-full text-sm font-medium text-foreground hover:border-purple/40 hover:bg-secondary transition-all shadow-pill"
            >
              <span>🍽️</span>
              <span>Dine-In</span>
            </button>
            <button
              onClick={() => navigate("/services")}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-card border border-purple/20 rounded-full text-sm font-medium text-foreground hover:border-purple/40 hover:bg-secondary transition-all shadow-pill"
            >
              <span>📅</span>
              <span>Reserve</span>
            </button>
            <button
              onClick={() => navigate("/ai-assistant")}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-card border border-purple/20 rounded-full text-sm font-medium text-foreground hover:border-purple/40 hover:bg-secondary transition-all shadow-pill"
            >
              <span>🤖</span>
              <span>Ask Outa</span>
            </button>
            <button
              onClick={() => navigate("/my-bookings")}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-card border border-purple/20 rounded-full text-sm font-medium text-foreground hover:border-purple/40 hover:bg-secondary transition-all shadow-pill"
            >
              <span>📘</span>
              <span>Bookings</span>
            </button>
          </div>
        </div>

        {/* Discover Section */}
        <div>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              🥢 Discover
            </h2>
            <p className="text-sm text-muted-foreground">Trending around you</p>
          </div>
          
          {isLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} type="vertical" className="flex-shrink-0 w-64" />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="Mapping your vibe zone 🗺️"
              description="Hang tight while we scout amazing spots near you!"
              compact
            />
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="flex-shrink-0 w-64 overflow-hidden hover:shadow-hover transition-all cursor-pointer group bg-card rounded-2xl border border-border shadow-card"
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                >
                  <div className="relative h-36 bg-muted overflow-hidden">
                    {restaurant.logo_url ? (
                      <img
                        src={restaurant.logo_url}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary">
                        <ChefHat className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                    
                    {/* Open indicator */}
                    {restaurant.is_open && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span className="text-foreground font-medium">Open</span>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-base mb-2 line-clamp-1 text-foreground">{restaurant.name}</h3>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-purple" />
                        <span>2.4 km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-purple text-purple" />
                        <span className="font-medium text-foreground">4.8</span>
                      </div>
                    </div>
                    
                    <Badge className="text-xs bg-secondary text-foreground border-0 rounded-full px-2.5">
                      {getCuisineTag(restaurant.cuisine_type)}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Your Next Spot Section */}
        <div>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              🌙 Your Next Spot
            </h2>
            <p className="text-sm text-muted-foreground">Based on your vibe ✨</p>
          </div>
          
          {isLoading ? (
            <LoadingState message="Outa's got you... ✨" />
          ) : restaurants.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No vibes matched yet 😎"
              description="Check back soon or ask Outa for personalized picks!"
              compact
            />
          ) : (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent>
                {restaurants.map((restaurant) => (
                  <CarouselItem key={restaurant.id} className="basis-[85%]">
                    <Card
                      className="overflow-hidden hover:shadow-hover transition-all cursor-pointer group bg-card rounded-2xl border border-purple/10 shadow-soft"
                      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    >
                      <div className="relative h-28 bg-muted overflow-hidden">
                        {restaurant.logo_url ? (
                          <img
                            src={restaurant.logo_url}
                            alt={restaurant.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary">
                            <ChefHat className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-3">
                          <p className="text-foreground/90 text-xs font-medium">For you ✨</p>
                        </div>
                      </div>
                      
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-base mb-2 line-clamp-1 text-foreground">{restaurant.name}</h3>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-purple" />
                            <span>2.4 km</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-purple text-purple" />
                            <span className="font-medium text-foreground">4.8</span>
                          </div>
                        </div>
                        
                        <Badge className="text-xs bg-secondary text-foreground border-0 rounded-full px-2.5">
                          {getCuisineTag(restaurant.cuisine_type)}
                        </Badge>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-2 bg-card border-border shadow-soft" />
              <CarouselNext className="-right-2 bg-card border-border shadow-soft" />
            </Carousel>
          )}
        </div>

        {/* Explore Dishes Section */}
        <div>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              🍽️ Explore Dishes
            </h2>
            <p className="text-sm text-muted-foreground">Craving something specific?</p>
          </div>
          
          {/* Category Filters - Compact Chips */}
          <div className="flex gap-2 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category 
                    ? "bg-purple text-primary-foreground shadow-soft" 
                    : "bg-card text-foreground border border-purple/20 hover:border-purple/40"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} type="grid" />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <EmptyState
              icon={ChefHat}
              title="Menu's being curated 👨🏽‍🍳"
              description="Fresh picks are on the way!"
              compact
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="overflow-hidden hover:shadow-hover transition-all cursor-pointer group bg-card rounded-2xl border border-border shadow-card"
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                >
                  <div className="relative h-28 overflow-hidden">
                    {restaurant.logo_url ? (
                      <img
                        src={restaurant.logo_url}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <ChefHat className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <h3 className="font-semibold text-sm text-foreground line-clamp-1 mb-0.5">{restaurant.name}</h3>
                      <div className="flex items-center gap-1.5 text-foreground/80">
                        <Star className="h-3 w-3 fill-purple text-purple" />
                        <span className="text-xs font-medium">4.8</span>
                        <span className="text-xs text-muted-foreground">• {getCuisineTag(restaurant.cuisine_type)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;