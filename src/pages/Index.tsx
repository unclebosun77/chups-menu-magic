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
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple/5 to-background" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-purple/15 to-primary/10 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-accent/10 to-secondary/5 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      <div className="space-y-3 p-3 pb-20 relative">
        {/* Compact Hero Header */}
        <div className="pt-2">
          <div className="bg-gradient-to-br from-primary via-accent to-secondary p-4 rounded-2xl shadow-hover text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl" />
            
            <div className="relative z-10">
              <h1 className="text-xl font-bold mb-1 animate-fade-in">
                Hungry? Let's find your next spot.
              </h1>
              <p className="text-white/90 text-sm mb-2">Discover amazing food near you</p>
              
              <Button
                onClick={() => navigate("/ai-assistant")}
                size="sm"
                className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Ask CHUPS AI 🍽️
              </Button>
            </div>
          </div>
        </div>

        {/* Compact Map Preview */}
        <div>
          <h2 className="text-base font-bold mb-2 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" />
            Near You
          </h2>
          <div className="h-32">
            <RestaurantMap restaurants={restaurants} />
          </div>
        </div>

        {/* Compact For You Carousel */}
        <div>
          <h2 className="text-base font-bold mb-2 flex items-center gap-1.5">
            <Star className="h-4 w-4 text-primary" />
            For You
          </h2>
          
          {restaurants.length === 0 ? (
            <Card className="p-6 text-center bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-dashed">
              <UtensilsCrossed className="h-10 w-10 text-muted-foreground mx-auto mb-2 animate-pulse" />
              <p className="text-sm font-medium mb-1">Nothing cooking yet 🍜</p>
              <p className="text-xs text-muted-foreground">Check back soon for delicious recommendations!</p>
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
                      className="overflow-hidden hover:shadow-hover transition-all cursor-pointer group"
                      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    >
                      <div className="relative h-24 bg-gradient-warm overflow-hidden">
                        {restaurant.logo_url ? (
                          <img
                            src={restaurant.logo_url}
                            alt={restaurant.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ChefHat className="h-12 w-12 text-white/80" />
                          </div>
                        )}
                        {!restaurant.is_open && (
                          <Badge className="absolute top-2 right-2 bg-destructive text-xs">
                            Closed
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="p-2.5">
                        <h3 className="font-bold text-sm mb-1.5 line-clamp-1">{restaurant.name}</h3>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>2.4 mi</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            <span className="font-medium text-foreground">4.8</span>
                          </div>
                        </div>
                        
                        <Badge variant="secondary" className="text-xs h-5">
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

        {/* Compact All Restaurants */}
        <div>
          <h2 className="text-base font-bold mb-2">All Restaurants</h2>
          
          {restaurants.length === 0 ? (
            <Card className="p-6 text-center bg-gradient-to-br from-purple/5 to-secondary/5 border-2 border-dashed">
              <ChefHat className="h-10 w-10 text-muted-foreground mx-auto mb-2 animate-bounce" 
                       style={{ animationDuration: '2s' }} />
              <p className="text-sm font-medium mb-1">No restaurants on the menu yet 👨‍🍳</p>
              <p className="text-xs text-muted-foreground">Be the first chef to join CHUPS!</p>
            </Card>
          ) : (
            <div className="grid gap-2.5">
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="overflow-hidden hover:shadow-hover transition-all cursor-pointer group"
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                >
                  <div className="flex gap-3 p-2.5">
                    <div className="w-16 h-16 rounded-xl bg-gradient-warm overflow-hidden flex-shrink-0">
                      {restaurant.logo_url ? (
                        <img
                          src={restaurant.logo_url}
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ChefHat className="h-8 w-8 text-white/80" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm mb-0.5 line-clamp-1">{restaurant.name}</h3>
                        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            <span>3.1 mi</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            <span className="font-medium text-foreground">4.6</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="secondary" className="text-xs h-5">
                          {restaurant.cuisine_type}
                        </Badge>
                        {!restaurant.is_open && (
                          <Badge variant="destructive" className="text-xs h-5">Closed</Badge>
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
