import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChefHat, MapPin, Star, Search, UtensilsCrossed, Sparkles, Calendar, ShoppingBag, PartyPopper, Bot, Rocket } from "lucide-react";
import { IconTile } from "@/components/IconTile";
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
  const [aiModalOpen, setAiModalOpen] = useState(false);
  
  const categories = ["All", "Nigerian", "Italian", "Asian Fusion", "Fast Food", "Desserts"];

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

  return (
    <div className="relative min-h-screen bg-gradient-app">
      <div className="space-y-6 p-4 pb-20 relative">
        {/* Dev: Quick Onboarding Access */}
        {restaurants.length === 0 && (
          <div className="bg-purple/10 border border-purple/30 rounded-xl p-4 mb-3 backdrop-blur-sm">
            <p className="text-sm text-foreground mb-2">👋 No spots yet!</p>
            <Button 
              onClick={() => navigate("/restaurant/onboarding")}
              className="w-full bg-gradient-warm text-white hover:opacity-90 shadow-glow"
              size="sm"
            >
              <Rocket className="mr-2 h-4 w-4" />
              Add Your First Spot
            </Button>
          </div>
        )}

        {/* Hero Section */}
        <div className="pt-2">
          <div className="bg-gradient-hero p-6 rounded-3xl shadow-hover relative overflow-hidden border border-purple/20">
            {/* Decorative blurred elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl animate-bounce-gentle">🚀</span>
                <Badge className="bg-gradient-neon text-white border-0 text-xs px-3 py-1 shadow-neon">
                  Let's goo
                </Badge>
              </div>
              
              <h1 className="text-2xl font-bold mb-2 animate-fade-in text-foreground">
                Where we heading tonight?
              </h1>
              
              {/* AI Suggestion Chips */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <Badge className="bg-secondary hover:bg-secondary-hover text-foreground border border-purple/30 text-xs backdrop-blur-sm cursor-pointer transition-all hover:scale-105">
                  🔥 Vibes match
                </Badge>
                <Badge className="bg-secondary hover:bg-secondary-hover text-foreground border border-purple/30 text-xs backdrop-blur-sm cursor-pointer transition-all hover:scale-105">
                  ⚡ Ready now
                </Badge>
                <Badge className="bg-secondary hover:bg-secondary-hover text-foreground border border-purple/30 text-xs backdrop-blur-sm cursor-pointer transition-all hover:scale-105">
                  💸 Budget-friendly
                </Badge>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Find your next spot 📍"
                  className="pl-10 bg-card border border-border focus:border-purple text-foreground placeholder:text-muted-foreground rounded-xl h-12 shadow-soft"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
            <span className="text-gradient-neon">⚡</span> Quick Actions
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <IconTile
              icon={UtensilsCrossed}
              emoji="🍽️"
              label="Dine-In"
              onClick={() => navigate("/discover")}
            />
            <IconTile
              icon={Calendar}
              emoji="📅"
              label="Reserve"
              onClick={() => navigate("/services")}
            />
            <IconTile
              icon={Bot}
              emoji="🤖"
              label="Ask Outa"
              onClick={() => navigate("/ai-assistant")}
            />
            <IconTile
              icon={Calendar}
              emoji="📖"
              label="Bookings"
              onClick={() => navigate("/my-bookings")}
            />
          </div>
        </div>

        {/* Discover Section */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
            <span className="text-gradient-neon">🍽️</span> Discover
          </h2>
          
          {isLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
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
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="flex-shrink-0 w-64 overflow-hidden hover:shadow-hover transition-all cursor-pointer group bg-card rounded-2xl border border-border shadow-soft hover:border-purple/30"
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                >
                  <div className="relative h-40 bg-gradient-to-br from-muted to-secondary overflow-hidden">
                    {restaurant.logo_url ? (
                      <img
                        src={restaurant.logo_url}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="h-12 w-12 text-muted-foreground/40" />
                      </div>
                    )}
                    {restaurant.is_open && (
                      <Badge className="absolute top-3 right-3 bg-gradient-warm text-white text-xs shadow-glow">
                        Open now
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-bold text-base mb-2 line-clamp-1 text-foreground">{restaurant.name}</h3>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-accent" />
                        <span>2.4 km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-purple text-purple" />
                        <span className="font-medium text-foreground">4.8</span>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="text-xs bg-secondary text-foreground">
                      {restaurant.cuisine_type}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Next Visit Section */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
            <span className="text-gradient-neon">🔮</span> Your Next Spot
          </h2>
          
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
                  <CarouselItem key={restaurant.id} className="basis-4/5">
                    <Card
                      className="overflow-hidden hover:shadow-hover transition-all cursor-pointer group bg-card rounded-2xl border border-border shadow-soft relative hover:border-purple/30"
                      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    >
                      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-purple/5 to-transparent bg-[length:1000px_100%]" />
                      <div className="relative h-32 bg-gradient-to-br from-muted to-secondary overflow-hidden">
                        {restaurant.logo_url ? (
                          <img
                            src={restaurant.logo_url}
                            alt={restaurant.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ChefHat className="h-10 w-10 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-2">
                          <p className="text-foreground text-xs italic font-medium">Based on your vibe ✨</p>
                        </div>
                      </div>
                      
                      <CardContent className="p-3 relative">
                        <h3 className="font-bold text-base mb-2 line-clamp-1 text-foreground">{restaurant.name}</h3>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-accent" />
                            <span>2.4 km</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-purple text-purple" />
                            <span className="font-medium text-foreground">4.8</span>
                          </div>
                        </div>
                        
                        <Badge variant="secondary" className="text-xs bg-secondary text-foreground">
                          {restaurant.cuisine_type}
                        </Badge>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-2 bg-card border-border" />
              <CarouselNext className="-right-2 bg-card border-border" />
            </Carousel>
          )}
        </div>

        {/* Explore Dishes Section */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
            <span className="text-gradient-neon">🍲</span> Explore Dishes
          </h2>
          
          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide mb-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 rounded-full ${
                  selectedCategory === category 
                    ? "bg-gradient-warm text-white hover:opacity-90 shadow-glow" 
                    : "border-border text-foreground hover:bg-secondary hover:border-purple/30"
                }`}
              >
                {category}
              </Button>
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
                  className="overflow-hidden hover:shadow-hover transition-all cursor-pointer group bg-card rounded-2xl border border-border shadow-soft hover:border-purple/30"
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                >
                  <div className="relative h-32 overflow-hidden">
                    {restaurant.logo_url ? (
                      <img
                        src={restaurant.logo_url}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center">
                        <ChefHat className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <h3 className="font-bold text-sm text-foreground line-clamp-2 mb-1">{restaurant.name}</h3>
                      <div className="flex items-center gap-1 text-foreground/80">
                        <Star className="h-3 w-3 fill-purple text-purple" />
                        <span className="text-xs font-medium">4.8</span>
                        <span className="text-xs">• {restaurant.cuisine_type}</span>
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
