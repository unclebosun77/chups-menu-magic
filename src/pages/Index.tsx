import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChefHat, MapPin, Star, Search, UtensilsCrossed, Sparkles, Calendar, ShoppingBag, PartyPopper, Bot } from "lucide-react";
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
      <div className="space-y-5 p-4 pb-20 relative">{/* Increased spacing from space-y-4 to space-y-5 */}
        {/* Dev: Quick Onboarding Access */}
        {restaurants.length === 0 && (
          <div className="bg-purple/10 border border-purple/20 rounded-xl p-3 mb-3">
            <p className="text-sm text-foreground mb-2">👋 No restaurants yet!</p>
            <Button 
              onClick={() => navigate("/restaurant/onboarding")}
              className="w-full bg-purple text-white hover:bg-purple-hover"
              size="sm"
            >
              Add Your First Restaurant
            </Button>
          </div>
        )}

        {/* Hero Section */}
        <div className="pt-2">
          <div className="bg-gradient-hero p-6 rounded-3xl shadow-hover text-white relative overflow-hidden">
            {/* Black overlay for contrast */}
            <div className="absolute inset-0 bg-black/15" />
            
            {/* Decorative blurred elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/20 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <h1 className="text-2xl font-bold mb-2 animate-fade-in text-white">
                Discover your next bite 🍴
              </h1>
              <p className="text-white/95 text-sm mb-4">CHUPS knows where to take you.</p>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search nearby restaurants 📍"
                  className="pl-10 bg-white border-2 border-transparent focus:border-purple text-foreground placeholder:text-muted-foreground rounded-xl h-12 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
            <span className="text-purple">⚡</span> Quick Actions
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <IconTile
              icon={UtensilsCrossed}
              label="Dine-In"
              onClick={() => navigate("/discover")}
            />
            <IconTile
              icon={Calendar}
              label="Reservations"
              onClick={() => navigate("/services")}
            />
            <IconTile
              icon={Bot}
              label="Ask CHUPS"
              onClick={() => navigate("/ai-assistant")}
            />
            <IconTile
              icon={Calendar}
              label="Bookings"
              onClick={() => navigate("/my-bookings")}
            />
          </div>
        </div>

        {/* Discover Section */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
            <span className="text-purple">🍽️</span> Discover
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
              title="We're mapping your flavor zone 🗺️"
              description="Hang tight while we discover amazing restaurants near you!"
              compact
            />
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="flex-shrink-0 w-64 overflow-hidden hover:shadow-hover transition-all cursor-pointer group bg-white rounded-2xl border border-border shadow-soft"
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                >
                  <div className="relative h-40 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                    {restaurant.logo_url ? (
                      <img
                        src={restaurant.logo_url}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="h-16 w-16 text-muted-foreground/40" />
                      </div>
                    )}
                    {restaurant.is_open && (
                      <Badge className="absolute top-3 right-3 bg-purple text-white text-xs shadow-lg">
                        Open now
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-bold text-base mb-2 line-clamp-1 text-foreground">{restaurant.name}</h3>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-purple" />
                        <span>2.4 km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-purple text-purple" />
                        <span className="font-medium text-foreground">4.8</span>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="text-xs bg-muted text-foreground">
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
            <span className="text-purple">🔮</span> Next Visit
          </h2>
          
          {isLoading ? (
            <LoadingState message="Curating your recommendations… ✨" />
          ) : restaurants.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No bites matched your cravings yet 😋"
              description="Check back soon or use our AI assistant for personalized recommendations!"
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
                      className="overflow-hidden hover:shadow-hover transition-all cursor-pointer group bg-white rounded-2xl border border-border shadow-soft relative"
                      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    >
                      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-purple/3 to-transparent bg-[length:1000px_100%]" />
                      <div className="relative h-32 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                        {restaurant.logo_url ? (
                          <img
                            src={restaurant.logo_url}
                            alt={restaurant.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ChefHat className="h-14 w-14 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <p className="text-white text-xs italic font-medium">Based on your taste</p>
                        </div>
                      </div>
                      
                      <CardContent className="p-3 relative">
                        <h3 className="font-bold text-base mb-2 line-clamp-1 text-foreground">{restaurant.name}</h3>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-purple" />
                            <span>2.4 km</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-purple text-purple" />
                            <span className="font-medium text-foreground">4.8</span>
                          </div>
                        </div>
                        
                        <Badge variant="secondary" className="text-xs bg-muted text-foreground">
                          {restaurant.cuisine_type}
                        </Badge>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-2" />
              <CarouselNext className="-right-2" />
            </Carousel>
          )}
        </div>

        {/* Explore Dishes Section */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
            <span className="text-purple">🍲</span> Explore Dishes
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
                    ? "bg-purple text-white hover:bg-purple-hover shadow-sm" 
                    : "border-border text-foreground hover:bg-muted"
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
              title="The menu's being updated by our chefs 👨🏽‍🍳🍛"
              description="Exciting new dishes are on the way!"
              compact
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="overflow-hidden hover:shadow-hover transition-all cursor-pointer group bg-white rounded-2xl border border-border shadow-soft"
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
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <ChefHat className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <h3 className="font-bold text-sm text-white line-clamp-2 mb-1">{restaurant.name}</h3>
                      <div className="flex items-center gap-1 text-white/95">
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
