import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ChefHat, MapPin, Sparkles, Search, ShoppingBag } from "lucide-react";
import heroImage from "@/assets/hero-restaurant.jpg";
import globeWatermark from "@/assets/globe-watermark.png";

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 relative">
      {/* Globe Watermark */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none z-0 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${globeWatermark})` }}
      />
      
      {/* Sign In Icon - Top Right */}
      {!user && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => navigate("/auth")}
          className="fixed top-4 right-4 z-50 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background hover:scale-110 transition-all duration-200"
        >
          <User className="h-5 w-5" />
        </Button>
      )}
      
      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden z-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />
        </div>
        <div className="relative h-full container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Welcome to CHUPS
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl animate-fade-in">
            Next-gen restaurant platform with AI-powered discovery, personalized menus & seamless ordering
          </p>
          <div className="flex flex-wrap gap-4 justify-center animate-fade-in">
            <Button size="lg" onClick={() => navigate("/discover")} className="gap-2">
              <Search className="h-5 w-5" />
              Discover Restaurants
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate("/ai-assistant")} className="gap-2">
              <Sparkles className="h-5 w-5" />
              AI Assistant
            </Button>
            {user && (
              <Button size="lg" variant="outline" onClick={() => navigate("/my-orders")} className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20">
                <ShoppingBag className="h-5 w-5" />
                My Orders
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          <Card className="text-center hover:shadow-hover transition-shadow">
            <CardHeader>
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI-Powered Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Let our AI assistant help you plan perfect outings, suggest restaurants, and estimate budgets
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-hover transition-shadow">
            <CardHeader>
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Smart Discovery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Find restaurants by cuisine, location, ratings, and opening hours with advanced filters
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-16 container mx-auto px-4 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold mb-2">Featured Restaurants</h2>
            <p className="text-muted-foreground text-lg">Discover amazing dining experiences</p>
          </div>
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
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-social relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Join Our Global Community</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Connect with people around the world through the universal language of food. 
            CHUPS brings together restaurant owners and food lovers in one vibrant social community.
          </p>
          {!user && (
            <Button size="lg" variant="secondary" onClick={() => navigate("/auth")} className="text-lg">
              Become Part of CHUPS
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
