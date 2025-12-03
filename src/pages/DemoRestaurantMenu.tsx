import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, Clock, Star, ShoppingCart, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { demoRestaurants, DemoMenuItem } from "@/data/demoRestaurantMenus";
import AskOutaModal from "@/components/AskOutaModal";
import RestaurantGalleryCarousel from "@/components/restaurant/RestaurantGalleryCarousel";
import FullGalleryModal from "@/components/restaurant/FullGalleryModal";
import PremiumMenuItemCard from "@/components/restaurant/PremiumMenuItemCard";
import SignatureDishCard from "@/components/restaurant/SignatureDishCard";
import StickyMenuTabs from "@/components/restaurant/StickyMenuTabs";
import { vibrate } from "@/utils/haptics";

type OrderItem = DemoMenuItem & { quantity: number };

const DemoRestaurantMenu = () => {
  const { demoId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const menuSectionRef = useRef<HTMLDivElement>(null);
  
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAskOuta, setShowAskOuta] = useState(false);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isTabsSticky, setIsTabsSticky] = useState(false);
  
  const restaurant = demoId ? demoRestaurants[demoId] : null;
  
  // Handle sticky tabs on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (menuSectionRef.current) {
        const rect = menuSectionRef.current.getBoundingClientRect();
        setIsTabsSticky(rect.top <= 0);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Restaurant not found</h1>
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
  
  const totalItems = order.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = order.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const categories = ["all", "starters", "mains", "sides", "desserts", "drinks", "specials"];
  const categoryLabels: Record<string, string> = {
    all: "All",
    starters: "Starters",
    mains: "Mains",
    sides: "Sides",
    desserts: "Desserts",
    drinks: "Drinks",
    specials: "Specials"
  };
  
  const filteredMenu = selectedCategory === "all" 
    ? restaurant.menu 
    : restaurant.menu.filter(item => item.category === selectedCategory);
  
  const signatureItems = restaurant.menu.filter(item => 
    restaurant.signatureDishes.some(sig => item.name.includes(sig.split(" ")[0]))
  );

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Gallery Hero Section */}
      <div className="relative">
        {/* Top Navigation - Floating */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className={`h-10 w-10 rounded-full backdrop-blur-sm shadow-lg ${
                isFavorite ? 'bg-red-50 text-red-500' : 'bg-white/95 hover:bg-white'
              }`}
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-10 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg relative"
              onClick={handleViewOrder}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple text-white text-[11px] rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
        
        {/* Gallery Carousel */}
        <RestaurantGalleryCarousel
          images={restaurant.galleryImages}
          restaurantName={restaurant.name}
          onOpenFullGallery={() => setShowFullGallery(true)}
        />
        
        {/* Restaurant Logo - Overlapping */}
        <div className="absolute -bottom-8 left-5 z-10">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-xl p-1.5 border-2 border-white">
            <img 
              src={restaurant.logoUrl} 
              alt={restaurant.name}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>
      </div>
      
      {/* Restaurant Info Section */}
      <div className="px-5 pt-14 pb-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{restaurant.name}</h1>
            <p className="text-sm text-muted-foreground/70">{restaurant.cuisine}</p>
          </div>
          <div className="flex items-center gap-1 bg-purple/10 px-3 py-1.5 rounded-full">
            <Star className="h-4 w-4 text-purple fill-purple" />
            <span className="text-sm font-bold text-purple">{restaurant.rating}</span>
          </div>
        </div>
        
        {/* Vibe Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {restaurant.vibe.map((tag, idx) => (
            <Badge 
              key={idx} 
              variant="secondary" 
              className="text-[11px] bg-secondary/50 text-muted-foreground border-0 rounded-full px-3 py-1"
            >
              {tag}
            </Badge>
          ))}
          <Badge 
            variant="outline" 
            className="text-[11px] border-border/50 rounded-full px-3 py-1"
          >
            {restaurant.priceLevel}
          </Badge>
        </div>
        
        {/* Description */}
        <p className="text-[14px] text-muted-foreground/80 leading-relaxed mb-5">
          {restaurant.description}
        </p>
        
        {/* Quick Info */}
        <div className="flex flex-wrap gap-4 text-sm mb-5">
          <div className="flex items-center gap-1.5 text-muted-foreground/70">
            <MapPin className="h-4 w-4 text-purple/70" />
            <span>{restaurant.distance}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={restaurant.isOpen ? 'text-green-600 font-medium' : 'text-red-500'}>
              {restaurant.isOpen ? 'Open Now' : 'Closed'}
            </span>
          </div>
        </div>
        
        {/* AI Menu Assistant CTA - Premium */}
        <div 
          className="bg-gradient-to-r from-purple/8 to-purple/4 border border-purple/15 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all"
          onClick={() => setShowAskOuta(true)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-purple/15">
              <Sparkles className="h-5 w-5 text-purple" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-[14px]">Not sure what to get?</p>
              <p className="text-[12px] text-muted-foreground/70">Ask Outa for a perfect recommendation 🍽️✨</p>
            </div>
            <Button 
              size="sm" 
              className="bg-purple hover:bg-purple-hover text-white rounded-full h-9 px-4 text-[13px] font-medium"
            >
              Ask Outa
            </Button>
          </div>
        </div>
      </div>
      
      {/* Hours & Location - Compact Grid */}
      <div className="px-5 pb-6">
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/40 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-purple/80" />
                <span className="font-semibold text-[13px]">Hours</span>
              </div>
              <div className="space-y-1">
                {Object.entries(restaurant.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground/60">{day}</span>
                    <span className="font-medium text-foreground/80">{hours}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-purple/80" />
                <span className="font-semibold text-[13px]">Location</span>
              </div>
              <p className="text-[12px] text-muted-foreground/60 mb-3 leading-relaxed">
                {restaurant.address}<br />{restaurant.city}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-[11px] h-8 rounded-full border-border/50 hover:bg-secondary/50"
              >
                Get Directions
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Signature Dishes Section */}
      {signatureItems.length > 0 && (
        <div className="px-5 pb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 tracking-tight">
            <Star className="h-5 w-5 text-purple fill-purple/30" />
            Signature Picks
          </h2>
          <ScrollArea className="w-full -mx-5 px-5">
            <div className="flex gap-3 pb-2">
              {signatureItems.map((item) => (
                <SignatureDishCard
                  key={item.id}
                  item={item}
                  onAddToOrder={handleAddToOrder}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
      
      {/* Full Menu Section */}
      <div ref={menuSectionRef} className="px-5 pb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 tracking-tight">
          🍽️ Full Menu
        </h2>
        
        {/* Category Tabs */}
        <StickyMenuTabs
          categories={categories}
          categoryLabels={categoryLabels}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          isSticky={isTabsSticky}
        />
        
        {/* Spacer when tabs are sticky */}
        {isTabsSticky && <div className="h-14" />}
        
        {/* Menu Items */}
        <div className="space-y-3 mt-4">
          {filteredMenu.map((item) => (
            <PremiumMenuItemCard
              key={item.id}
              item={item}
              onAddToOrder={handleAddToOrder}
            />
          ))}
        </div>
        
        {filteredMenu.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground/60 text-sm">No items in this category</p>
          </div>
        )}
      </div>
      
      {/* Fixed Order Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/50 p-4 z-50">
          <Button 
            className="w-full bg-purple hover:bg-purple-hover text-white h-14 rounded-2xl shadow-lg text-[15px] font-semibold"
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

export default DemoRestaurantMenu;
