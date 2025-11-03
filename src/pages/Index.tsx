import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ChefHat, MapPin, Sparkles, Search, ShoppingBag } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      {/* App Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">CHUPS</h1>
          </div>
          
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/discover")} className="gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Discover</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/ai-assistant")} className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Ask CHUPS</span>
            </Button>
            {user ? (
              <Button variant="ghost" size="sm" onClick={() => navigate("/my-orders")} className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => navigate("/auth")}>
                <User className="h-4 w-4" />
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-hover transition-all" onClick={() => navigate("/discover")}>
            <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
              <Search className="h-6 w-6 text-primary" />
              <span className="font-medium text-sm">Discover</span>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-hover transition-all" onClick={() => navigate("/ai-assistant")}>
            <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-medium text-sm">Ask CHUPS</span>
            </CardContent>
          </Card>
          
          {user && (
            <Card className="cursor-pointer hover:shadow-hover transition-all" onClick={() => navigate("/my-orders")}>
              <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <span className="font-medium text-sm">My Orders</span>
              </CardContent>
            </Card>
          )}
          
          <Card className="cursor-pointer hover:shadow-hover transition-all" onClick={() => navigate("/discover")}>
            <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="font-medium text-sm">Near Me</span>
            </CardContent>
          </Card>
        </div>

        {/* Restaurants Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Restaurants</h2>
          <p className="text-muted-foreground">Browse available restaurants</p>
        </div>

        {restaurants.length === 0 ? (
          <Card className="p-12 text-center">
            <CardDescription className="text-lg">
              No restaurants yet. Be the first to join CHUPS!
            </CardDescription>
            {!user && (
              <Button onClick={() => navigate("/auth")} className="mt-4">
                Sign Up as Restaurant
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="overflow-hidden hover:shadow-hover transition-all cursor-pointer group"
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              >
                <div className="h-48 bg-gradient-warm relative overflow-hidden">
                  {restaurant.logo_url ? (
                    <img
                      src={restaurant.logo_url}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="h-20 w-20 text-white/80" />
                    </div>
                  )}
                  {!restaurant.is_open && (
                    <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Closed
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">{restaurant.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />
                    {restaurant.cuisine_type}
                  </CardDescription>
                </CardHeader>
                {restaurant.description && (
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2">{restaurant.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
