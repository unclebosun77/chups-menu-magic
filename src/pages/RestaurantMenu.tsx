import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, ArrowLeft, Star } from "lucide-react";
import MenuItemCard from "@/components/MenuItemCard";
import OrderDialog from "@/components/OrderDialog";
import ReviewsSection from "@/components/ReviewsSection";

type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  cuisine_type: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  is_open: boolean;
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
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

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

      setRestaurant(restaurantData);

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
      {/* Restaurant Header */}
      <div className="border-b bg-card sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/discover")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {restaurant?.logo_url && (
              <img 
                src={restaurant.logo_url} 
                alt={restaurant.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{restaurant?.name}</h1>
              <div className="flex gap-2 items-center flex-wrap">
                <Badge>{restaurant?.cuisine_type}</Badge>
                <Badge variant={restaurant?.is_open ? "default" : "secondary"}>
                  {restaurant?.is_open ? "Open" : "Closed"}
                </Badge>
              </div>
              {restaurant?.description && (
                <p className="text-muted-foreground mt-3">{restaurant.description}</p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="relative"
              onClick={() => setShowOrderDialog(true)}
            >
              <ShoppingCart className="h-4 w-4" />
              {order.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {order.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <Star className="h-4 w-4" />
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="mt-6">
            {Object.entries(groupedItems).length === 0 ? (
              <p className="text-center text-muted-foreground">No menu items available yet.</p>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category}>
                    <h2 className="text-2xl font-bold mb-4 capitalize">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          onAddToOrder={handleAddToOrder}
                        />
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
    </div>
  );
};

export default RestaurantMenu;
