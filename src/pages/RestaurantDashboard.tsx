import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, Eye, Settings, TrendingUp, DollarSign, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import MenuItemForm from "@/components/MenuItemForm";
import MenuItemCard from "@/components/MenuItemCard";
import RestaurantProfileEdit from "@/components/RestaurantProfileEdit";

type Restaurant = {
  id: string;
  name: string;
  cuisine_type: string;
  description?: string;
  logo_url?: string;
  phone?: string;
  address?: string;
  city?: string;
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

type Order = {
  id: string;
  restaurant_id: string;
  items: any;
  total: number;
  status: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  created_at: string;
};

type Insights = {
  totalOrders: number;
  totalRevenue: number;
  mostPopularDish?: string;
  topDishes: { name: string; count: number }[];
};

const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insights, setInsights] = useState<Insights | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("id, name, cuisine_type, description, logo_url, phone, address, city")
        .eq("user_id", session.user.id)
        .single();

      if (!restaurantData) {
        navigate("/restaurant/onboarding");
        return;
      }

      setRestaurant(restaurantData);
      loadMenuItems(restaurantData.id);
      loadOrdersAndInsights(restaurantData.id);
    };

    checkAuth();
  }, [navigate]);

  const loadMenuItems = async (restaurantId: string) => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("category", { ascending: true });

    if (error) {
      toast({ title: "Error loading menu items", description: error.message, variant: "destructive" });
    } else {
      setMenuItems(data || []);
    }
  };

  const loadOrdersAndInsights = async (restaurantId: string) => {
    setIsLoadingInsights(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const ordersData = data || [];
      setOrders(ordersData);

      // Calculate insights
      const totalOrders = ordersData.length;
      const totalRevenue = ordersData.reduce((sum, order) => sum + Number(order.total), 0);

      // Aggregate dish counts
      const dishCounts: Record<string, number> = {};
      ordersData.forEach((order) => {
        if (Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const name = item.name || "Unknown";
            const quantity = item.quantity || 1;
            dishCounts[name] = (dishCounts[name] || 0) + quantity;
          });
        }
      });

      // Sort dishes by count
      const sortedDishes = Object.entries(dishCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      const topDishes = sortedDishes.slice(0, 3);
      const mostPopularDish = topDishes[0]?.name;

      setInsights({
        totalOrders,
        totalRevenue,
        mostPopularDish,
        topDishes,
      });
    } catch (error: any) {
      toast({
        title: "Error loading insights",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting item", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Item deleted" });
      if (restaurant) loadMenuItems(restaurant.id);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingItem(null);
    if (restaurant) loadMenuItems(restaurant.id);
  };

  const handleProfileUpdate = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("id, name, cuisine_type, description, logo_url, phone, address, city")
        .eq("user_id", session.user.id)
        .single();
      
      if (restaurantData) {
        setRestaurant(restaurantData);
      }
    }
  };

  if (!restaurant) return null;

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {restaurant.logo_url && (
              <img src={restaurant.logo_url} alt={restaurant.name} className="h-12 w-12 object-contain rounded" />
            )}
            <div>
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              <p className="text-sm text-muted-foreground">{restaurant.cuisine_type}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowProfileEdit(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <Button variant="outline" onClick={() => navigate(`/restaurant/${restaurant.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview Menu
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <RestaurantProfileEdit
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        restaurant={restaurant}
        onSuccess={handleProfileUpdate}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Insights Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Insights</h2>
          {isLoadingInsights ? (
            <div className="grid gap-6 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Most Popular Dish</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            </div>
          ) : orders.length === 0 ? (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">
                  No orders yet. Once customers start ordering, you'll see trends here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-3 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{insights?.totalOrders || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      All-time orders placed through CHUPS
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      £{insights?.totalRevenue.toFixed(2) || "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Across all recorded orders
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Most Popular Dish</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold truncate">
                      {insights?.mostPopularDish || "Not enough data yet"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on order frequency
                    </p>
                  </CardContent>
                </Card>
              </div>

              {insights && insights.topDishes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Dishes</CardTitle>
                    <CardDescription>Your most ordered items</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {insights.topDishes.map((dish, index) => {
                        const maxCount = insights.topDishes[0].count;
                        const percentage = (dish.count / maxCount) * 100;
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{dish.name}</span>
                              <span className="text-muted-foreground">{dish.count} orders</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Menu Summary Cards */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{menuItems.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(groupedItems).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {menuItems.filter(item => item.available).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Menu Items</h2>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</CardTitle>
            </CardHeader>
            <CardContent>
              <MenuItemForm
                restaurantId={restaurant.id}
                item={editingItem}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
              />
            </CardContent>
          </Card>
        )}

        {Object.keys(groupedItems).length === 0 ? (
          <Card className="p-12 text-center">
            <CardDescription className="text-lg">
              No menu items yet. Add your first item to get started!
            </CardDescription>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-2xl font-semibold mb-4 capitalize">{category}</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isOwner
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RestaurantDashboard;
