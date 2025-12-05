import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Phone, Navigation, Sparkles, Bookmark, Star, Clock, MapPin, ChevronRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { demoRestaurants, DemoMenuItem, DemoRestaurant } from "@/data/demoRestaurantMenus";
import { supabase } from "@/integrations/supabase/client";
import AskOutaModal from "@/components/AskOutaModal";
import FullGalleryModal from "@/components/restaurant/FullGalleryModal";
import { MenuSection } from "@/components/restaurant/menu";
import { vibrate } from "@/utils/haptics";

// Restaurant profile component types
type OrderItem = DemoMenuItem & { quantity: number };

const RestaurantProfile = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showAskOuta, setShowAskOuta] = useState(false);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [restaurant, setRestaurant] = useState<DemoRestaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Load restaurant data
  useEffect(() => {
    const loadRestaurant = async () => {
      setIsLoading(true);
      
      // Check if it's a demo restaurant
      if (restaurantId && demoRestaurants[restaurantId]) {
        setRestaurant(demoRestaurants[restaurantId]);
        setIsLoading(false);
        return;
      }

      // Try loading from Supabase
      if (restaurantId) {
        const { data, error } = await supabase
          .from("restaurants")
          .select("*")
          .eq("id", restaurantId)
          .single();

        if (data && !error) {
          // Convert Supabase restaurant to DemoRestaurant format
          setRestaurant({
            id: data.id,
            name: data.name,
            cuisine: data.cuisine_type,
            address: data.address || "",
            city: data.city || "",
            priceLevel: "££",
            description: data.description || "",
            vibe: ["Modern", "Cozy"],
            openingHours: data.hours as Record<string, string> || {},
            signatureDishes: [],
            logoUrl: data.logo_url || "",
            heroImage: data.logo_url || "",
            galleryImages: data.logo_url ? [data.logo_url] : [],
            galleryTheme: "light",
            rating: 4.5,
            distance: "1.0 km",
            isOpen: data.is_open,
            menu: []
          });
        }
      }
      
      setIsLoading(false);
    };

    loadRestaurant();
  }, [restaurantId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Restaurant not found</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleAddToOrder = (item: DemoMenuItem, quantity: number = 1) => {
    vibrate(20);
    setOrder(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...item, quantity }];
    });
    toast({ title: `Added ${item.name} to order ✨` });
  };

  const handleViewOrder = () => {
    navigate("/order-summary", {
      state: {
        restaurantName: restaurant.name,
        restaurantId: restaurant.id,
        items: order.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          description: item.description
        }))
      }
    });
  };

  const handleToggleFavorite = () => {
    vibrate(20);
    setIsFavorite(!isFavorite);
    toast({ title: isFavorite ? "Removed from favorites" : "Added to favorites ❤️" });
  };

  const handleToggleSaved = () => {
    vibrate(20);
    setIsSaved(!isSaved);
    toast({ title: isSaved ? "Removed from saved" : "Saved for later 📌" });
  };

  const totalItems = order.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Get signature items for recommendation
  const signatureItems = restaurant.menu.filter(item => 
    restaurant.signatureDishes.some(sig => item.name.toLowerCase().includes(sig.toLowerCase().split(" ")[0]))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 pb-28">
      {/* Hero Section with Gallery */}
      <div className="relative">
        {/* Top Navigation - Floating */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md hover:bg-background shadow-lg border border-border/30"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className={`h-10 w-10 rounded-full backdrop-blur-md shadow-lg border border-border/30 ${
                isSaved ? 'bg-purple/20 text-purple' : 'bg-background/80 hover:bg-background'
              }`}
              onClick={handleToggleSaved}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className={`h-10 w-10 rounded-full backdrop-blur-md shadow-lg border border-border/30 ${
                isFavorite ? 'bg-red-50 text-red-500' : 'bg-background/80 hover:bg-background'
              }`}
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            {totalItems > 0 && (
              <Button 
                variant="ghost" 
                size="icon"
                className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md hover:bg-background shadow-lg border border-border/30 relative"
                onClick={handleViewOrder}
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-purple text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Banner Image */}
        <div 
          className="relative h-72 overflow-hidden cursor-pointer"
          onClick={() => setShowFullGallery(true)}
        >
          <img
            src={restaurant.galleryImages[galleryIndex] || restaurant.heroImage}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          
          {/* Gallery dots */}
          {restaurant.galleryImages.length > 1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
              {restaurant.galleryImages.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setGalleryIndex(idx); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === galleryIndex ? "bg-white w-5" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Restaurant Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-end gap-4">
              {/* Logo */}
              <div className="w-16 h-16 rounded-2xl bg-background shadow-xl p-1 border border-border/50 flex-shrink-0">
                <img 
                  src={restaurant.logoUrl} 
                  alt={restaurant.name}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div className="flex-1 pb-1">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">{restaurant.name}</h1>
                <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
              </div>
              <div className="flex items-center gap-1 bg-purple/15 px-3 py-1.5 rounded-full">
                <Star className="h-4 w-4 text-purple fill-purple" />
                <span className="text-sm font-bold text-purple">{restaurant.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Powered by Outa tag */}
        <div className="absolute bottom-2 right-4">
          <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Powered by Outa Intelligence
          </span>
        </div>
      </div>

      {/* Action Row */}
      <div className="px-5 py-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl border-border/50 hover:bg-secondary/50"
            onClick={() => window.open(`tel:+441234567890`)}
          >
            <Phone className="h-4 w-4 mr-2 text-purple" />
            Call
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl border-border/50 hover:bg-secondary/50"
            onClick={() => window.open(`https://maps.google.com?q=${restaurant.address}`)}
          >
            <Navigation className="h-4 w-4 mr-2 text-purple" />
            Directions
          </Button>
          <Button
            className="flex-1 h-12 rounded-xl bg-purple hover:bg-purple/90 text-white"
            onClick={() => setShowAskOuta(true)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Ask Outa
          </Button>
        </div>
      </div>

      {/* Gallery Carousel */}
      {restaurant.galleryImages.length > 1 && (
        <div className="px-5 pb-4">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {restaurant.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setGalleryIndex(idx); setShowFullGallery(true); }}
                  className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    idx === galleryIndex ? "border-purple shadow-lg" : "border-transparent opacity-70"
                  }`}
                >
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* Vibe Tags & Price */}
      <div className="px-5 pb-4">
        <div className="flex flex-wrap gap-2 items-center">
          {restaurant.vibe.map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-[11px] bg-secondary/50 text-muted-foreground border-0 rounded-full px-3 py-1">
              {tag}
            </Badge>
          ))}
          <Badge variant="outline" className="text-[11px] border-border/50 rounded-full px-3 py-1">
            {restaurant.priceLevel}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <div className="px-5 pb-4">
        <p className="text-[14px] text-muted-foreground/80 leading-relaxed">
          {restaurant.description}
        </p>
      </div>

      {/* Outa Intelligence Recommendation */}
      <div className="px-5 pb-4">
        <Card className="border-purple/20 bg-gradient-to-r from-purple/5 to-purple/10 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-purple/15">
                <Sparkles className="h-5 w-5 text-purple" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground mb-1">Outa's Pick for You</p>
                {signatureItems.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Try the <span className="font-medium text-purple">{signatureItems[0]?.name}</span> — it's one of their best dishes and matches your taste profile.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    This restaurant matches your preference for <span className="font-medium text-purple">{restaurant.cuisine}</span> cuisine.
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  {["Date Night", "Cozy Vibes", "Great Service"].map((vibe, idx) => (
                    <span key={idx} className="text-[10px] text-purple/70 bg-purple/10 px-2 py-0.5 rounded-full">
                      {vibe}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* About Section */}
      <div className="px-5 pb-6">
        <h2 className="text-lg font-bold mb-3 tracking-tight">About</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Hours */}
          <Card className="border-border/40 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-purple" />
                <span className="font-semibold text-[13px]">Hours</span>
              </div>
              <div className="space-y-1">
                {Object.entries(restaurant.openingHours).slice(0, 3).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground/60">{day}</span>
                    <span className="font-medium text-foreground/80">{hours}</span>
                  </div>
                ))}
                {Object.keys(restaurant.openingHours).length > 3 && (
                  <button className="text-[10px] text-purple mt-1">View all hours</button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="border-border/40 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-purple" />
                <span className="font-semibold text-[13px]">Location</span>
              </div>
              <p className="text-[11px] text-muted-foreground/60 mb-2 leading-relaxed">
                {restaurant.address}<br />{restaurant.city}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-[10px] h-7 rounded-full border-border/50"
              >
                Get Directions
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Unified Menu Section */}
      <MenuSection
        menu={restaurant.menu}
        signatureDishes={restaurant.signatureDishes}
        onAddToOrder={handleAddToOrder}
      />

      {/* Reviews Placeholder */}
      <div className="px-5 pb-6">
        <h2 className="text-lg font-bold mb-3 tracking-tight">Reviews</h2>
        <Card className="border-border/40">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground/60 text-sm">Reviews coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/50 p-4 z-50">
          <Button 
            className="w-full bg-purple hover:bg-purple/90 text-white h-14 rounded-2xl shadow-lg text-[15px] font-semibold"
            onClick={handleViewOrder}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Order ({totalItems} items) · £{totalAmount.toFixed(2)}
          </Button>
        </div>
      )}

      {/* Full Gallery Modal */}
      <FullGalleryModal
        open={showFullGallery}
        onOpenChange={setShowFullGallery}
        images={restaurant.galleryImages}
        restaurantName={restaurant.name}
        theme={restaurant.galleryTheme}
      />

      {/* Ask Outa Modal */}
      <AskOutaModal
        open={showAskOuta}
        onOpenChange={setShowAskOuta}
        restaurantName={restaurant.name}
        menu={restaurant.menu}
        onAddToOrder={handleAddToOrder}
      />
    </div>
  );
};

export default RestaurantProfile;
