import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, MapPin, Star, Sparkles, UtensilsCrossed } from "lucide-react";
import RestaurantMap from "@/components/RestaurantMap";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

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
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, cuisine_type, description, logo_url, is_open, latitude, longitude")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error && data) {
        setRestaurants(data);
      }
    };

    loadRestaurants();
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-cream/50">
        <div className="absolute inset-0 bg-gradient-to-br from-purple/5 via-background to-coral/5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-purple-glow opacity-20 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-gradient-coral opacity-15 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      <div className="space-y-6 p-4 pb-24 relative">
        {/* Hero Header */}
        <div className="pt-4 pb-6">
          <div className="bg-gradient-hero p-8 rounded-3xl shadow-hover text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-3 animate-fade-in leading-tight">
                Hungry? Let's find your next spot.
              </h1>
              <p className="text-white/90 text-sm">Discover amazing food near you</p>
            </div>
          </div>
        </div>

        {/* Map Preview */}
        <div className="relative">
          <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple" />
              Discover 📍
            </h2>
          </div>
          <RestaurantMap restaurants={restaurants} />
        </div>

        {/* Next Visit Carousel */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-coral">❤️</span>
            Next Visit
          </h2>
          
          {restaurants.length === 0 ? (
            <Card className="p-12 text-center bg-gradient-to-br from-purple/5 to-coral/5 border-2 border-dashed rounded-2xl">
              <UtensilsCrossed className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-lg font-medium mb-2">Nothing cooking yet 🍜</p>
              <p className="text-sm text-muted-foreground">Check back soon for delicious recommendations!</p>
            </Card>
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
                      className="overflow-hidden shadow-soft hover:shadow-hover transition-all cursor-pointer group rounded-2xl"
                      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    >
                      <div className="relative h-48 bg-gradient-warm overflow-hidden">
                        {restaurant.logo_url ? (
                          <img
                            src={restaurant.logo_url}
                            alt={restaurant.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ChefHat className="h-20 w-20 text-white/80" />
                          </div>
                        )}
                        {restaurant.is_open && (
                          <Badge className="absolute top-3 right-3 bg-purple text-white rounded-full px-3">
                            Open
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2 line-clamp-1">{restaurant.name}</h3>
                        
                        <div className="flex items-center justify-between text-sm mb-3">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>2.4 mi</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-coral text-coral" />
                            <Star className="h-4 w-4 fill-coral text-coral" />
                            <Star className="h-4 w-4 fill-coral text-coral" />
                            <Star className="h-4 w-4 fill-coral text-coral" />
                            <Star className="h-4 w-4 fill-muted text-muted" />
                          </div>
                        </div>
                        
                        <Badge className="bg-purple/10 text-purple hover:bg-purple/20 rounded-full text-xs">
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

        {/* Explore Dishes */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🍲 Explore Dishes
          </h2>
          
          {restaurants.length === 0 ? (
            <Card className="p-12 text-center bg-gradient-to-br from-coral/5 to-purple/5 border-2 border-dashed rounded-2xl">
              <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-bounce" 
                       style={{ animationDuration: '2s' }} />
              <p className="text-lg font-medium mb-2">No restaurants on the menu yet 👨‍🍳</p>
              <p className="text-sm text-muted-foreground">Be the first chef to join CHUPS!</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="overflow-hidden shadow-soft hover:shadow-hover transition-all cursor-pointer group rounded-2xl"
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                >
                  <div className="flex gap-4 p-4">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-warm overflow-hidden flex-shrink-0 relative">
                      {restaurant.logo_url ? (
                        <img
                          src={restaurant.logo_url}
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ChefHat className="h-12 w-12 text-white/80" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-purple/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg mb-1 line-clamp-1">{restaurant.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>3.1 mi</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-coral text-coral" />
                            <span className="font-medium text-foreground">4.6</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge className="bg-coral/10 text-coral hover:bg-coral/20 rounded-full text-xs">
                          {restaurant.cuisine_type}
                        </Badge>
                        {restaurant.is_open && (
                          <Badge className="bg-purple/10 text-purple rounded-full text-xs">Open Now</Badge>
                        )}
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
