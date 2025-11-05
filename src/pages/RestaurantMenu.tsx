import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Star } from "lucide-react";
import OrderDialog from "@/components/OrderDialog";
import MenuItemDialog from "@/components/MenuItemDialog";
import ReviewsSection from "@/components/ReviewsSection";
import RestaurantHeader from "@/components/RestaurantHeader";
import RestaurantInfo from "@/components/RestaurantInfo";
import RestaurantGallery from "@/components/RestaurantGallery";
import EmptyState from "@/components/EmptyState";

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
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showItemDialog, setShowItemDialog] = useState(false);
  
  const infoAnimation = useScrollAnimation();
  const galleryAnimation = useScrollAnimation();
  const menuAnimation = useScrollAnimation();

  useEffect(() => {
    if (!restaurantId) return;
    
    const loadData = async () => {
      const { data: restaurantData, error: restError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId)
        .single();

      if (restError || !restaurantData) {
        toast({ title: "Restaurant not found", variant: "destructive" });
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

  const handleAddToOrder = (item: MenuItem) => {
    setOrder((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast({ title: `Added ${item.name} to order` });
  };

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setShowItemDialog(true);
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

  if (!restaurant) return null;

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="min-h-screen bg-background">
      <RestaurantHeader
        logoUrl={restaurant.logo_url}
        name={restaurant.name}
        cuisineType={restaurant.cuisine_type}
        description={restaurant.description}
        isOpen={restaurant.is_open}
        orderCount={order.length}
        onCartClick={() => setShowOrderDialog(true)}
      />

      {/* Add padding for fixed header */}
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Restaurant Info Cards */}
        <div 
          ref={infoAnimation.ref}
          className={`mb-8 transition-all duration-700 ${
            infoAnimation.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          <RestaurantInfo
            address={restaurant.address}
            city={restaurant.city}
            phone={restaurant.phone}
            hours={restaurant.hours}
            isOpen={restaurant.is_open}
          />
        </div>

        {/* Gallery Section */}
        <div
          ref={galleryAnimation.ref}
          className={`transition-all duration-700 delay-150 ${
            galleryAnimation.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          <RestaurantGallery />
        </div>

        {/* Menu & Reviews Tabs */}
        <div
          ref={menuAnimation.ref}
          className={`transition-all duration-700 delay-300 ${
            menuAnimation.isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="menu" className="text-base">Menu</TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2 text-base">
              <Star className="h-4 w-4" />
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="mt-6">
            {Object.entries(groupedItems).length === 0 ? (
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
                        <Card
                          key={item.id}
                          className="cursor-pointer hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in-up"
                          style={{ animationDelay: `${(idx * 0.1) + (itemIdx * 0.05)}s` }}
                          onClick={() => handleItemClick(item)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-lg mb-1 truncate">
                                  {item.name}
                                </h4>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                    {item.description}
                                  </p>
                                )}
                                <p className="text-xl font-bold text-primary">
                                  ${item.price.toFixed(2)}
                                </p>
                              </div>
                              {!item.available && (
                                <Badge variant="secondary" className="shrink-0">
                                  Unavailable
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
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

      <OrderDialog
        open={showOrderDialog}
        onOpenChange={setShowOrderDialog}
        order={order}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromOrder}
        totalAmount={totalAmount}
        onSuccess={() => {
          setOrder([]);
          setShowOrderDialog(false);
        }}
      />

      <MenuItemDialog
        item={selectedItem}
        open={showItemDialog}
        onOpenChange={setShowItemDialog}
        onAddToOrder={handleAddToOrder}
      />
    </div>
  );
};

export default RestaurantMenu;
