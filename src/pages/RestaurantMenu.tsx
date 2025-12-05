import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Star, Sparkles, Search } from "lucide-react";
import { useTasteProfile } from "@/context/TasteProfileContext";
import ReviewsSection from "@/components/ReviewsSection";
import RestaurantHeader from "@/components/RestaurantHeader";
import RestaurantInfo from "@/components/RestaurantInfo";
import RestaurantGallery from "@/components/RestaurantGallery";
import SectionNavigation from "@/components/SectionNavigation";
import EmptyState from "@/components/EmptyState";
import DishQuickView from "@/components/menu/DishQuickView";
import SkeletonCard from "@/components/SkeletonCard";
import { getMenuImage } from "@/utils/menuImageMapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SwipeableDishRow } from "@/components/menu/SwipeableDishRow";
import { vibrate } from "@/utils/haptics";

type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  cuisine_type: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  is_open: boolean;
  address: string | null;
  city: string | null;
  phone: string | null;
  hours: Record<string, string> | null;
  story?: string | null;
};

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  available: boolean;
};

type OrderItem = MenuItem & { quantity: number };

const RestaurantMenu = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useTasteProfile();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (!restaurantId) return;
    
    const loadData = async () => {
      setIsLoading(true);
      const { data: restaurantData, error: restError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId)
        .single();

      if (restError || !restaurantData) {
        toast({ title: "Restaurant not found", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      setRestaurant(restaurantData as Restaurant);

      // Apply theme colors
      document.documentElement.style.setProperty("--primary", hexToHSL(restaurantData.primary_color));
      document.documentElement.style.setProperty("--secondary", hexToHSL(restaurantData.secondary_color));

      const { data: menuData, error: menuError } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("available", true)
        .order("category", { ascending: true });

      if (menuError) {
        toast({ title: "Error loading menu", description: menuError.message, variant: "destructive" });
      } else {
        setMenuItems(menuData || []);
      }
      
      setIsLoading(false);
    };

    loadData();

    return () => {
      // Reset colors on unmount
      document.documentElement.style.removeProperty("--primary");
      document.documentElement.style.removeProperty("--secondary");
    };
  }, [restaurantId, toast]);

  const hexToHSL = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "14 100% 60%";
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const isItemRecommended = (item: MenuItem): boolean => {
    if (!profile) return false;
    
    let isMatch = false;
    const itemName = item.name.toLowerCase();
    const itemDesc = (item.description || "").toLowerCase();
    
    // Check spice preference
    if (profile.spiceLevel === "hot" && item.category.toLowerCase().includes("spicy")) {
      isMatch = true;
    }
    
    // Check protein preferences
    profile.proteins.forEach(protein => {
      const p = protein.toLowerCase();
      if (itemName.includes(p) || itemDesc.includes(p)) {
        isMatch = true;
      }
      // Handle seafood variations
      if (p === "seafood" && (itemName.includes("shrimp") || itemName.includes("fish") || 
          itemName.includes("salmon") || itemDesc.includes("seafood"))) {
        isMatch = true;
      }
    });
    
    // Boost if restaurant cuisine matches profile
    if (restaurant && profile.cuisines.includes(restaurant.cuisine_type)) {
      isMatch = true;
    }
    
    return isMatch;
  };

  const getMatchExplanation = (item: MenuItem): string | null => {
    if (!profile) return null;

    const reasons: string[] = [];
    const itemName = item.name.toLowerCase();
    const itemDesc = (item.description || "").toLowerCase();

    // Check spice match
    if (profile.spiceLevel === "hot" && item.category.toLowerCase().includes("spicy")) {
      reasons.push("spicy");
    } else if (profile.spiceLevel === "mild" && !item.category.toLowerCase().includes("spicy")) {
      reasons.push("mild");
    }

    // Check protein match
    const matchedProteins: string[] = [];
    profile.proteins.forEach(protein => {
      const p = protein.toLowerCase();
      if (itemName.includes(p) || itemDesc.includes(p)) {
        matchedProteins.push(protein);
      }
      if (p === "seafood" && (itemName.includes("shrimp") || itemName.includes("fish") || 
          itemName.includes("salmon") || itemDesc.includes("seafood"))) {
        matchedProteins.push("seafood");
      }
    });

    // Check cuisine match
    const cuisineMatch = restaurant && profile.cuisines.includes(restaurant.cuisine_type);

    // Build explanation
    if (reasons.length === 0 && matchedProteins.length === 0 && !cuisineMatch) {
      return null;
    }

    let explanation = "Matches your love for ";
    const parts: string[] = [];

    if (reasons.length > 0) parts.push(reasons[0]);
    if (matchedProteins.length > 0) parts.push(matchedProteins[0]);
    if (cuisineMatch) parts.push(restaurant!.cuisine_type);

    if (parts.length === 1) {
      explanation += parts[0];
    } else if (parts.length === 2) {
      explanation += `${parts[0]} ${parts[1]}`;
    } else {
      explanation += `${parts[0]}, ${parts[1]} ${parts[2]}`;
    }

    return explanation;
  };

  const handleAddToOrder = (item: MenuItem, quantity: number = 1) => {
    vibrate(20);
    setOrder((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...item, quantity }];
    });
    toast({ title: `Added ${quantity}x ${item.name} to order` });
  };

  const handleItemClick = (item: MenuItem) => {
    vibrate(20);
    setSelectedItem(item);
    setShowItemDialog(true);
  };

  const handleViewOrder = () => {
    navigate("/order-summary", {
      state: {
        restaurantName: restaurant?.name,
        restaurantId: restaurant?.id,
        items: order,
      },
    });
  };

  const handleNavigate = (section: "info" | "gallery" | "menu" | "reviews") => {
    const element = document.getElementById(section);
    if (element) {
      const headerOffset = 120;
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleRemoveFromOrder = (itemId: string) => {
    setOrder((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromOrder(itemId);
      return;
    }
    setOrder((prev) => prev.map((i) => i.id === itemId ? { ...i, quantity } : i));
  };

  const totalAmount = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Skeleton Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-muted rounded w-48 animate-pulse" />
                <div className="h-4 bg-muted rounded w-32 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pt-8 pb-8">
          {/* Skeleton Menu Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} type="grid" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  const categories = ["All", "Popular", "Spicy", "Vegan", "Chef's Special", "Comfort Food", "Seafood", "Chicken", "Beef"];

  const filterDishByCategory = (item: MenuItem): boolean => {
    if (selectedCategory === "All") return true;
    
    const itemName = item.name.toLowerCase();
    const itemCategory = item.category.toLowerCase();
    
    if (selectedCategory === "Seafood") {
      return itemName.includes("shrimp") || itemName.includes("fish") || itemName.includes("salmon") || itemName.includes("seafood");
    }
    if (selectedCategory === "Chicken") {
      return itemName.includes("chicken");
    }
    if (selectedCategory === "Beef") {
      return itemName.includes("beef");
    }
    if (selectedCategory === "Comfort Food") {
      return itemName.includes("rice") || itemName.includes("pasta") || itemName.includes("noodles");
    }
    
    return itemCategory.includes(selectedCategory.toLowerCase());
  };

  const filterDishBySearch = (item: MenuItem): boolean => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase().trim();
    const itemName = item.name.toLowerCase();
    const itemDesc = (item.description || "").toLowerCase();
    const itemCategory = item.category.toLowerCase();
    
    return itemName.includes(query) || 
           itemDesc.includes(query) || 
           itemCategory.includes(query) ||
           (itemName.includes("shrimp") && query.includes("shrimp")) ||
           (itemName.includes("chicken") && query.includes("chicken")) ||
           (itemName.includes("beef") && query.includes("beef")) ||
           (itemName.includes("vegan") && query.includes("vegan")) ||
           (itemName.includes("fish") && query.includes("fish"));
  };

  const filteredMenuItems = menuItems.filter(item => 
    filterDishByCategory(item) && filterDishBySearch(item)
  );

  const groupedItems = filteredMenuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Get Today's Specials
  const todaysSpecials = menuItems.filter(item => {
    const tags = item.category.toLowerCase();
    return tags.includes("popular") || tags.includes("chef's special") || tags.includes("spicy") || tags.includes("trending");
  }).slice(0, 3);

  const specialsToShow = todaysSpecials.length > 0 ? todaysSpecials : menuItems.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <RestaurantHeader
        logoUrl={restaurant.logo_url}
        name={restaurant.name}
        cuisineType={restaurant.cuisine_type}
        description={restaurant.description}
        isOpen={restaurant.is_open}
        orderCount={order.length}
        onCartClick={handleViewOrder}
      />

      <SectionNavigation onNavigate={handleNavigate} />

      {/* Add padding for fixed header + navigation */}
      <div className="container mx-auto px-4 pt-8 pb-8">
        {/* Restaurant Story */}
        {restaurant.story && (
          <Card className="mb-6 border border-border/50">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Our Story</h3>
              <p className="text-sm text-muted-foreground line-clamp-4">{restaurant.story}</p>
            </CardContent>
          </Card>
        )}

        {/* Today's Specials */}
        {specialsToShow.length > 0 && (
          <div className="mb-6">
            <div className="mb-3">
              <h3 className="text-xl font-bold text-foreground">🔥 Today's Specials</h3>
              <p className="text-sm text-muted-foreground">Handpicked highlights from the kitchen.</p>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {specialsToShow.map((item) => (
                <Card
                  key={item.id}
                  className="min-w-[200px] cursor-pointer hover:shadow-lg transition-all duration-300 hover-scale flex-shrink-0"
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-base mb-1 truncate">{item.name}</h4>
                    <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                    <p className="text-lg font-bold text-primary mt-2">${item.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggestion Banner */}
        <div className="mb-6 bg-gradient-to-r from-purple/10 to-secondary/10 border border-purple/20 rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="text-2xl">✨</div>
            <div>
              <p className="font-semibold text-foreground">Chef's Special 추천 for your vibe today</p>
              <p className="text-sm text-muted-foreground">CHUPS AI picked these just for you</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search this menu…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Category Filters */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-min">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-purple text-white hover:bg-purple-hover" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Restaurant Info Cards */}
        <div 
          id="info"
          className="mb-8 opacity-100 translate-y-0"
        >
          <RestaurantInfo
            address={restaurant.address}
            city={restaurant.city}
            phone={restaurant.phone}
            hours={restaurant.hours}
            isOpen={restaurant.is_open}
            description={restaurant.description}
          />
        </div>

        {/* Gallery Section */}
        <div
          id="gallery"
          className="mb-8 opacity-100 translate-y-0"
        >
          <RestaurantGallery />
        </div>

        {/* Menu & Reviews Tabs */}
        <div
          id="menu"
          className="opacity-100 translate-y-0"
        >
          <Tabs defaultValue="menu" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="menu" className="text-base">Menu</TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                id="reviews"
                className="gap-2 text-base"
              >
              <Star className="h-4 w-4" />
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="mt-6">
            {filteredMenuItems.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No dishes match your search"
                description="Try adjusting your filters or search terms."
              />
            ) : Object.entries(groupedItems).length === 0 ? (
              <EmptyState
                icon="🍽️"
                title="No menu items available yet"
                description="The menu is being updated by our chefs. Check back soon!"
              />
            ) : (
              <div className="space-y-12">
                {Object.entries(groupedItems).map(([category, items], idx) => (
                  <div 
                    key={category}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                      <h2 className="text-3xl font-bold capitalize bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">
                        {category}
                      </h2>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((item, itemIdx) => (
                        <SwipeableDishRow
                          key={item.id}
                          onAddToOrder={() => handleAddToOrder(item)}
                          onView={() => handleItemClick(item)}
                        >
                          <Card
                            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in-up overflow-hidden"
                            style={{ animationDelay: `${(idx * 0.1) + (itemIdx * 0.05)}s` }}
                            onClick={() => handleItemClick(item)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-lg truncate">
                                      {item.name}
                                    </h4>
                                    {isItemRecommended(item) && (
                                      <Badge variant="default" className="bg-purple text-purple-foreground shrink-0 gap-1">
                                        <Sparkles className="h-3 w-3" />
                                        For you
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-2">Tap to view dish</p>
                                  {item.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                      {item.description}
                                    </p>
                                  )}
                                  <p className="text-xl font-bold text-primary">
                                    ${item.price.toFixed(2)}
                                  </p>
                                  {getMatchExplanation(item) && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {getMatchExplanation(item)}
                                    </p>
                                  )}
                                </div>
                                {!item.available && (
                                  <Badge variant="secondary" className="shrink-0">
                                    Unavailable
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </SwipeableDishRow>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            {restaurantId && <ReviewsSection restaurantId={restaurantId} />}
          </TabsContent>
          </Tabs>
        </div>
      </div>

      <DishQuickView
        dish={selectedItem}
        isOpen={showItemDialog}
        onClose={() => setShowItemDialog(false)}
        onAddToOrder={handleAddToOrder}
      />
    </div>
  );
};

export default RestaurantMenu;
