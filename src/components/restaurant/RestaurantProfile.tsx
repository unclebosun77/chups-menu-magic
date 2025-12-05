import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Heart, MapPin, Clock, Star, ShoppingCart, Sparkles, 
  Phone, Navigation, UtensilsCrossed, ChevronRight, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { demoRestaurants, DemoMenuItem } from "@/data/demoRestaurantMenus";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";
import AskOutaModal from "@/components/AskOutaModal";
import FullGalleryModal from "@/components/restaurant/FullGalleryModal";
import PremiumMenuItemCard from "@/components/restaurant/PremiumMenuItemCard";
import SignatureDishCard from "@/components/restaurant/SignatureDishCard";
import StickyMenuTabs from "@/components/restaurant/StickyMenuTabs";
import { vibrate } from "@/utils/haptics";

type OrderItem = DemoMenuItem & { quantity: number };

const RestaurantProfile = () => {
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
  const personalizedData = personalizedRestaurants.find(r => r.id === demoId);
  
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
      <div className="min-h-screen bg-gradient-dark-premium flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-white">Restaurant not found</h1>
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

  const handleCall = () => {
    toast({ title: "Calling restaurant..." });
  };

  const handleDirections = () => {
    const address = encodeURIComponent(`${restaurant.address}, ${restaurant.city}`);
    window.open(`https://maps.google.com/?q=${address}`, '_blank');
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
    <div className="min-h-screen bg-gradient-dark-premium pb-28">
      {/* Hero Section */}
      <div className="relative">
        {/* Top Navigation - Floating */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 text-white border border-white/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className={`h-10 w-10 rounded-full backdrop-blur-md border border-white/10 ${
                isFavorite ? 'bg-red-500/80 text-white' : 'bg-black/40 hover:bg-black/60 text-white'
              }`}
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 text-white border border-white/10 relative"
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
        
        {/* Hero Banner Image */}
        <div className="relative h-72 overflow-hidden">
          <img 
            src={restaurant.heroImage} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(260,30%,8%)] via-[hsl(260,30%,8%,0.4)] to-transparent" />
          
          {/* View Gallery Button */}
          <button
            onClick={() => setShowFullGallery(true)}
            className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20 hover:bg-black/70 transition-colors"
          >
            <span>View Gallery</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
        
        {/* Restaurant Logo - Overlapping */}
        <div className="absolute bottom-0 left-5 transform translate-y-1/2 z-10">
          <div className="w-20 h-20 rounded-2xl bg-[hsl(260,25%,12%)] shadow-xl p-1.5 border-2 border-purple/30">
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
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{restaurant.name}</h1>
            <p className="text-sm text-purple/80">{restaurant.cuisine}</p>
          </div>
          <div className="flex items-center gap-1 bg-purple/20 px-3 py-1.5 rounded-full border border-purple/30">
            <Star className="h-4 w-4 text-purple fill-purple" />
            <span className="text-sm font-bold text-purple">{restaurant.rating}</span>
          </div>
        </div>

        {/* Powered by Outa */}
        <p className="text-[10px] text-white/40 mb-3 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-purple/60" />
          Powered by Outa Intelligence
        </p>
        
        {/* Vibe Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {restaurant.vibe.map((tag, idx) => (
            <Badge 
              key={idx} 
              variant="secondary" 
              className="text-[11px] bg-white/5 text-white/70 border border-white/10 rounded-full px-3 py-1"
            >
              {tag}
            </Badge>
          ))}
          <Badge 
            variant="outline" 
            className="text-[11px] border-purple/30 text-purple/80 rounded-full px-3 py-1"
          >
            {restaurant.priceLevel}
          </Badge>
        </div>
        
        {/* Description */}
        <p className="text-[14px] text-white/60 leading-relaxed mb-5">
          {restaurant.description}
        </p>
        
        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 text-sm mb-6">
          <div className="flex items-center gap-1.5 text-white/50">
            <MapPin className="h-4 w-4 text-purple/70" />
            <span>{restaurant.distance}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={restaurant.isOpen ? 'text-green-400 font-medium' : 'text-red-400'}>
              {restaurant.isOpen ? 'Open Now' : 'Closed'}
            </span>
          </div>
        </div>

        {/* Smart Action Row */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <button 
            onClick={handleCall}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <Phone className="h-5 w-5 text-purple" />
            <span className="text-[10px] text-white/70">Call</span>
          </button>
          <button 
            onClick={handleDirections}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <Navigation className="h-5 w-5 text-purple" />
            <span className="text-[10px] text-white/70">Directions</span>
          </button>
          <button 
            onClick={() => menuSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <UtensilsCrossed className="h-5 w-5 text-purple" />
            <span className="text-[10px] text-white/70">Menu</span>
          </button>
          <button 
            onClick={() => setShowAskOuta(true)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-purple/20 border border-purple/30 hover:bg-purple/30 transition-colors"
          >
            <Sparkles className="h-5 w-5 text-purple" />
            <span className="text-[10px] text-white/70">Ask Outa</span>
          </button>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="px-5 pb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 tracking-tight text-white">
          📸 Gallery
        </h2>
        <ScrollArea className="w-full -mx-5 px-5">
          <div className="flex gap-3 pb-2">
            {restaurant.galleryImages.slice(0, 6).map((image, idx) => (
              <div 
                key={idx} 
                className="flex-shrink-0 w-32 h-24 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setShowFullGallery(true)}
              >
                <img 
                  src={image} 
                  alt={`${restaurant.name} gallery ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      
      {/* Signature Dishes Section */}
      {signatureItems.length > 0 && (
        <div className="px-5 pb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 tracking-tight text-white">
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
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 tracking-tight text-white">
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
            <p className="text-white/40 text-sm">No items in this category</p>
          </div>
        )}
      </div>

      {/* About Section */}
      <div className="px-5 pb-6">
        <h2 className="text-lg font-bold mb-4 text-white">About</h2>
        
        <div className="space-y-4">
          {/* Hours */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-purple" />
                <span className="font-semibold text-[13px] text-white">Opening Hours</span>
              </div>
              <div className="space-y-1.5">
                {Object.entries(restaurant.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-[12px]">
                    <span className="text-white/50">{day}</span>
                    <span className="font-medium text-white/80">{hours}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Location */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-purple" />
                <span className="font-semibold text-[13px] text-white">Location</span>
              </div>
              <p className="text-[12px] text-white/50 mb-3 leading-relaxed">
                {restaurant.address}<br />{restaurant.city}
              </p>
              
              {/* Map Preview Placeholder */}
              <div className="w-full h-32 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <span className="text-white/30 text-xs">Map Preview</span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-[11px] h-8 rounded-full border-purple/30 text-purple hover:bg-purple/10"
                onClick={handleDirections}
              >
                Get Directions
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Dietary Tags */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <span className="font-semibold text-[13px] text-white mb-3 block">Dietary Options</span>
              <div className="flex flex-wrap gap-2">
                {["Vegetarian", "Vegan Options", "Gluten-Free", "Halal"].map((tag) => (
                  <Badge 
                    key={tag}
                    className="text-[10px] bg-purple/10 text-purple border border-purple/20 rounded-full"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews Section (Placeholder) */}
      <div className="px-5 pb-6">
        <h2 className="text-lg font-bold mb-4 text-white">Reviews</h2>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl font-bold text-white">{restaurant.rating}</div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 ${star <= Math.floor(restaurant.rating) ? 'text-purple fill-purple' : 'text-white/20'}`} 
                    />
                  ))}
                </div>
                <p className="text-[11px] text-white/50 mt-0.5">Based on 128 reviews</p>
              </div>
            </div>
            
            {/* Sample Reviews */}
            <div className="space-y-3">
              {[
                { name: "Sarah M.", rating: 5, comment: "Amazing food and atmosphere! Will definitely be back." },
                { name: "James T.", rating: 4, comment: "Great flavors, authentic experience. Service was excellent." },
              ].map((review, idx) => (
                <div key={idx} className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium text-white">{review.name}</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-3 w-3 ${star <= review.rating ? 'text-purple fill-purple' : 'text-white/20'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-white/60">{review.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Fixed Order Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[hsl(260,30%,8%,0.95)] backdrop-blur-md border-t border-white/10 p-4 z-50">
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

export default RestaurantProfile;