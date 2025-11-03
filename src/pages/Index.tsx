import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, MapPin, TrendingUp } from "lucide-react";

type Restaurant = {
  id: string;
  name: string;
  cuisine_type: string;
  description: string | null;
  logo_url: string | null;
  is_open: boolean;
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
        .select("id, name, cuisine_type, description, logo_url, is_open")
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
      {/* Layered Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple/5 to-background" />
        
        {/* Large geometric circles */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-purple/15 to-primary/10 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-accent/10 to-secondary/5 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '12s', animationDelay: '4s' }} />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
             style={{
               backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
               backgroundSize: '32px 32px'
             }} />
      </div>

      <div className="space-y-6 p-4 relative">
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-3xl font-bold">Discover</h1>
          <p className="text-muted-foreground mt-1">Find your next favorite spot</p>
        </div>

      {/* Personalized Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">For You</h2>
        </div>
        
        {restaurants.length === 0 ? (
          <Card className="p-8 text-center">
            <CardDescription>
              No restaurants available yet
            </CardDescription>
          </Card>
        ) : (
          <div className="space-y-4">
            {restaurants.slice(0, 3).map((restaurant) => (
              <Card
                key={restaurant.id}
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              >
                <div className="flex gap-4 p-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-warm overflow-hidden flex-shrink-0">
                    {restaurant.logo_url ? (
                      <img
                        src={restaurant.logo_url}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="h-10 w-10 text-white/80" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-1 truncate">{restaurant.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{restaurant.cuisine_type}</span>
                    </div>
                    {!restaurant.is_open && (
                      <span className="text-xs text-destructive font-medium">Closed</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* All Restaurants */}
      <div>
        <h2 className="text-xl font-bold mb-4">All Restaurants</h2>
        
        {restaurants.length === 0 ? (
          <Card className="p-12 text-center">
            <CardDescription className="text-lg">
              No restaurants yet
            </CardDescription>
          </Card>
        ) : (
          <div className="grid gap-4">
            {restaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              >
                <div className="h-40 bg-gradient-warm relative overflow-hidden">
                  {restaurant.logo_url ? (
                    <img
                      src={restaurant.logo_url}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="h-16 w-16 text-white/80" />
                    </div>
                  )}
                  {!restaurant.is_open && (
                    <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-medium">
                      Closed
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {restaurant.cuisine_type}
                  </CardDescription>
                </CardHeader>
                {restaurant.description && (
                  <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-2">{restaurant.description}</p>
                  </CardContent>
                )}
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
