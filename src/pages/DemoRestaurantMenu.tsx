import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, Clock, Star, ShoppingCart, Sparkles, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { demoRestaurants, DemoMenuItem, getTagEmoji, getTagLabel } from "@/data/demoRestaurantMenus";
import AskOutaModal from "@/components/AskOutaModal";
import { vibrate } from "@/utils/haptics";

type OrderItem = DemoMenuItem & { quantity: number };

const DemoRestaurantMenu = () => {
  const { demoId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAskOuta, setShowAskOuta] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const restaurant = demoId ? demoRestaurants[demoId] : null;
  
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
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={restaurant.heroImage} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className={`backdrop-blur-sm shadow-md ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-white/90 hover:bg-white'}`}
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-md relative"
              onClick={handleViewOrder}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
        
        {/* Logo */}
        <div className="absolute bottom-4 left-4">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-lg p-2 border-2 border-white">
            <img 
              src={restaurant.logoUrl} 
              alt={restaurant.name}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>
      </div>
      
      {/* Restaurant Info */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{restaurant.name}</h1>
            <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
          </div>
          <div className="flex items-center gap-1 bg-purple/10 px-2 py-1 rounded-full">
            <Star className="h-4 w-4 text-purple fill-purple" />
            <span className="text-sm font-semibold text-purple">{restaurant.rating}</span>
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {restaurant.vibe.map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs bg-purple/10 text-purple border-0">
              {tag}
            </Badge>
          ))}
          <Badge variant="outline" className="text-xs">
            {restaurant.priceLevel}
          </Badge>
        </div>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {restaurant.description}
        </p>
        
        {/* Quick Info */}
        <div className="flex flex-wrap gap-4 text-sm mb-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{restaurant.distance}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={restaurant.isOpen ? 'text-green-600' : 'text-red-500'}>
              {restaurant.isOpen ? 'Open Now' : 'Closed'}
            </span>
          </div>
        </div>
        
        {/* Ask Outa CTA */}
        <Card 
          className="bg-gradient-to-r from-purple/10 to-purple/5 border-purple/20 cursor-pointer hover:shadow-md transition-all"
          onClick={() => setShowAskOuta(true)}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple/20">
              <Sparkles className="h-5 w-5 text-purple" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">Not sure what to order?</p>
              <p className="text-xs text-muted-foreground">Ask Outa for a personalized recommendation 🤖✨</p>
            </div>
            <Button size="sm" className="bg-purple hover:bg-purple-hover text-white">
              Ask Outa
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Opening Hours & Location */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-purple" />
                <span className="font-semibold text-sm">Hours</span>
              </div>
              <div className="space-y-0.5">
                {Object.entries(restaurant.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{day}</span>
                    <span className="font-medium">{hours}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-purple" />
                <span className="font-semibold text-sm">Location</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {restaurant.address}<br />{restaurant.city}
              </p>
              <Button variant="outline" size="sm" className="w-full text-xs h-7">
                Get Directions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Signature Dishes */}
      {signatureItems.length > 0 && (
        <div className="px-4 py-2">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            👨‍🍳 Signature Dishes
          </h2>
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-2">
              {signatureItems.map((item) => (
                <Card 
                  key={item.id}
                  className="min-w-[200px] overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => handleAddToOrder(item)}
                >
                  {item.image && (
                    <div className="h-28 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Badge className="bg-purple/20 text-purple border-0 text-[10px] h-5">
                        Chef's Pick
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                    <p className="text-lg font-bold text-purple">£{item.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
      
      {/* Menu Section */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-bold mb-3">🍽️ Full Menu</h2>
        
        {/* Category Tabs */}
        <ScrollArea className="w-full mb-4">
          <div className="flex gap-2 pb-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className={`shrink-0 ${selectedCategory === cat ? 'bg-purple text-white hover:bg-purple-hover' : 'border-purple/30 hover:bg-purple/10'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {categoryLabels[cat]}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        
        {/* Menu Items */}
        <div className="space-y-3">
          {filteredMenu.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  {item.image && (
                    <div className="w-24 h-24 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className={`flex-1 p-3 ${!item.image ? 'py-3' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <span className="font-bold text-purple">£{item.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {item.tags.slice(0, 4).map((tag) => (
                          <span 
                            key={tag} 
                            className="text-xs bg-secondary px-1.5 py-0.5 rounded-full"
                            title={getTagLabel(tag)}
                          >
                            {getTagEmoji(tag)}
                          </span>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-purple text-purple hover:bg-purple hover:text-white"
                        onClick={(e) => { e.stopPropagation(); handleAddToOrder(item); }}
                      >
                        Add +
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Fixed Order Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
          <Button 
            className="w-full bg-purple hover:bg-purple-hover text-white h-12"
            onClick={handleViewOrder}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Order ({totalItems} items) · £{totalAmount.toFixed(2)}
          </Button>
        </div>
      )}
      
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
