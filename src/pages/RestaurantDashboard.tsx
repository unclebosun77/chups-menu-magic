import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, Eye, Settings, TrendingUp, DollarSign, ShoppingBag, AlertTriangle, QrCode, ArrowLeft, ChevronDown, Loader2, Info, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MenuItemForm from "@/components/MenuItemForm";
import MenuItemCard from "@/components/MenuItemCard";
import RestaurantProfileEdit from "@/components/RestaurantProfileEdit";
import OrderManagement from "@/components/dashboard/OrderManagement";
import TableQRManager from "@/components/dashboard/TableQRManager";
import CrowdLevelControl from "@/components/dashboard/CrowdLevelControl";

type Restaurant = {
  id: string;
  name: string;
  cuisine_type: string;
  description?: string;
  logo_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  is_temporarily_closed?: boolean;
  crowd_level?: string | null;
  crowd_updated_at?: string | null;
  vibes?: string[];
};

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  available: boolean;
  sold_out_today?: boolean;
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
  table_number?: string | null;
};

type Insights = {
  totalOrders: number;
  totalRevenue: number;
  mostPopularDish?: string;
  topDishes: { name: string; count: number }[];
};

type WeeklyDay = { day: string; orders: number; revenue: number };

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
  const [activeTab, setActiveTab] = useState("orders");
  const [weeklyData, setWeeklyData] = useState<WeeklyDay[]>([]);
  const [quickAddCategory, setQuickAddCategory] = useState<string | null>(null);
  const [quickAddName, setQuickAddName] = useState("");
  const [quickAddPrice, setQuickAddPrice] = useState("");
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [addToCategoryName, setAddToCategoryName] = useState<string | null>(null);
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("id, name, cuisine_type, description, logo_url, phone, address, city, is_temporarily_closed, crowd_level, crowd_updated_at")
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
      // Build weekly chart data from completed orders in last 7 days
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const now = new Date();
      const weekly: WeeklyDay[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const dayOrders = ordersData.filter(o => {
          const t = new Date(o.created_at);
          return t >= dayStart && t < dayEnd && o.status === 'completed';
        });
        weekly.push({
          day: dayNames[dayStart.getDay()],
          orders: dayOrders.length,
          revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0),
        });
      }
      setWeeklyData(weekly);
    } catch (error: any) {
      const msg = (error.message || "Unknown error").toLowerCase();
      if (msg.includes("permission") || msg.includes("policy") || msg.includes("rls")) {
        toast({
          title: "Setting up permissions — please refresh the page",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error loading insights",
          description: error.message,
          variant: "destructive",
        });
      }
      setInsights({ totalOrders: 0, totalRevenue: 0, mostPopularDish: undefined, topDishes: [] });
      setOrders([]);
      setWeeklyData([]);
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
    setAddToCategoryName(null);
    if (restaurant) loadMenuItems(restaurant.id);
  };

  const handleQuickAdd = async (category: string) => {
    if (!quickAddName.trim() || !quickAddPrice.trim() || !restaurant) return;
    const price = parseFloat(quickAddPrice);
    if (isNaN(price) || price < 0) {
      toast({ title: "Invalid price", variant: "destructive" });
      return;
    }
    setIsQuickAdding(true);
    const { error } = await supabase.from("menu_items").insert({
      restaurant_id: restaurant.id,
      name: quickAddName.trim(),
      price,
      category,
    });
    if (error) {
      toast({ title: "Error adding item", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${quickAddName.trim()} added` });
      setQuickAddName("");
      setQuickAddPrice("");
      setQuickAddCategory(null);
      loadMenuItems(restaurant.id);
    }
    setIsQuickAdding(false);
  };

  const handleItemUpdate = (updatedItem: MenuItem) => {
    setMenuItems(prev => prev.map(i => i.id === updatedItem.id ? { ...i, ...updatedItem } : i));
  };

  const handleProfileUpdate = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("id, name, cuisine_type, description, logo_url, phone, address, city, is_temporarily_closed, crowd_level, crowd_updated_at")
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
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full mr-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
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
        {/* Temporarily Closed Toggle */}
        <Card className="mb-8">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-5 w-5 ${restaurant.is_temporarily_closed ? 'text-red-500' : 'text-muted-foreground'}`} />
              <div>
                <p className="font-medium text-sm">Temporarily closed today</p>
                <p className="text-xs text-muted-foreground">Override opening hours and appear as closed to customers</p>
              </div>
            </div>
            <Switch
              checked={restaurant.is_temporarily_closed || false}
              onCheckedChange={async (checked) => {
                const { error } = await supabase
                  .from("restaurants")
                  .update({ is_temporarily_closed: checked })
                  .eq("id", restaurant.id);
                
                if (error) {
                  toast({ title: "Error", description: error.message, variant: "destructive" });
                } else {
                  setRestaurant(prev => prev ? { ...prev, is_temporarily_closed: checked } : prev);
                  toast({ title: checked ? "Restaurant marked as temporarily closed" : "Restaurant reopened" });
                }
              }}
            />
          </CardContent>
        </Card>
        {/* Crowd Level Control */}
        <div className="mb-8">
          <CrowdLevelControl
            restaurantId={restaurant.id}
            currentLevel={restaurant.crowd_level || null}
            updatedAt={restaurant.crowd_updated_at || null}
            orders={orders.map(o => ({ created_at: o.created_at, status: o.status }))}
            onUpdate={(level, updatedAt) => {
              setRestaurant(prev => prev ? { ...prev, crowd_level: level, crowd_updated_at: updatedAt } : prev);
            }}
          />
        </div>

        {/* Order Management Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="tables" className="flex items-center gap-1.5">
              <QrCode className="h-3.5 w-3.5" />
              Tables
            </TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrderManagement 
              orders={orders} 
              onOrderUpdate={() => restaurant && loadOrdersAndInsights(restaurant.id)}
              restaurantId={restaurant?.id}
            />
          </TabsContent>

          <TabsContent value="tables">
            <TableQRManager restaurantId={restaurant.id} restaurantName={restaurant.name} />
          </TabsContent>

          <TabsContent value="insights">
        <div className="mb-8 space-y-6">
          <h2 className="text-2xl font-bold">Insights</h2>
          {isLoadingInsights ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
                  <CardContent><Skeleton className="h-8 w-20" /></CardContent>
                </Card>
              ))}
            </div>
          ) : orders.filter(o => o.status === 'completed').length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="flex flex-col items-center gap-4">
                <BarChart3 className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-lg font-semibold">No completed orders yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Share your table QR codes to start receiving orders</p>
                </div>
                <Button onClick={() => setActiveTab('tables')}>
                  <QrCode className="h-4 w-4 mr-2" />
                  View QR Codes
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{insights?.totalOrders || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">All-time completed orders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">£{insights?.totalRevenue.toFixed(2) || "0.00"}</div>
                    <p className="text-xs text-muted-foreground mt-1">Across all recorded orders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Most Popular Dish</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold truncate">{insights?.mostPopularDish || "—"}</div>
                    <p className="text-xs text-muted-foreground mt-1">Based on order frequency</p>
                  </CardContent>
                </Card>
              </div>

              {/* Orders bar chart */}
              {weeklyData.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Orders this week</CardTitle>
                    <CardDescription>
                      {weeklyData.reduce((s, d) => s + d.orders, 0)} orders · £{weeklyData.reduce((s, d) => s + d.revenue, 0).toFixed(2)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={weeklyData}>
                        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={30} />
                        <Tooltip formatter={(v: number) => [`${v} orders`]} />
                        <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Revenue area chart */}
              {weeklyData.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Revenue trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={weeklyData}>
                        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} width={50} tickFormatter={(v) => `£${v}`} />
                        <Tooltip formatter={(v: number) => [`£${Number(v).toFixed(2)}`]} />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Top dishes ranked */}
              {insights && insights.topDishes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Dishes</CardTitle>
                    <CardDescription>Your most ordered items</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.topDishes.map((dish, i) => {
                        const pct = Math.round((dish.count / insights.topDishes[0].count) * 100);
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-sm font-bold text-muted-foreground w-5 text-center">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium truncate">{dish.name}</span>
                                <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">{dish.count}×</span>
                              </div>
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                            {i === 0 && <span className="text-lg">🏆</span>}
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
          </TabsContent>

          <TabsContent value="menu">
        {/* Menu Summary Cards */}
        <div className="grid gap-4 mb-6 md:grid-cols-3">
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

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Menu Items</h2>
          <div className="flex gap-2">
            {menuItems.some(i => (i as any).sold_out_today) && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!restaurant) return;
                  const { error } = await (supabase
                    .from("menu_items")
                    .update({ sold_out_today: false } as any)
                    .eq("restaurant_id", restaurant.id) as any)
                    .eq("sold_out_today", true);
                  if (error) {
                    toast({ title: "Error resetting", description: error.message, variant: "destructive" });
                  } else {
                    toast({ title: "All items restocked ✓" });
                    loadMenuItems(restaurant.id);
                  }
                }}
                className="text-xs"
              >
                Reset all sold out
              </Button>
            )}
            <Button onClick={() => { setEditingItem(null); setAddToCategoryName(null); setShowForm(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-muted/50 border">
          <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">Changes go live instantly for customers browsing your menu</p>
        </div>

        {/* Edit dialog */}
        <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingItem(null); setAddToCategoryName(null); } }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
            </DialogHeader>
            <MenuItemForm
              restaurantId={restaurant.id}
              item={editingItem ? editingItem : addToCategoryName ? { id: '', name: '', description: null, price: 0, category: addToCategoryName, image_url: null, available: true } as any : null}
              onSuccess={handleFormSuccess}
              onCancel={() => { setShowForm(false); setEditingItem(null); setAddToCategoryName(null); }}
            />
          </DialogContent>
        </Dialog>

        {Object.keys(groupedItems).length === 0 ? (
          <Card className="p-12 text-center">
            <CardDescription className="text-lg">
              No menu items yet. Add your first item to get started!
            </CardDescription>
          </Card>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedItems).map(([category, items]) => (
              <Collapsible key={category} defaultOpen>
                <Card>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                      <div className="flex items-center gap-3">
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=closed]_&]:rotate-[-90deg]" />
                        <CardTitle className="text-lg capitalize">{category}</CardTitle>
                        <Badge variant="secondary" className="text-xs">{items.length} items</Badge>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 px-4 pb-4 space-y-2">
                      {items.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onItemUpdate={handleItemUpdate}
                          isOwner
                        />
                      ))}

                      {/* Quick add inline */}
                      {quickAddCategory === category ? (
                        <div className="flex items-center gap-2 p-2 rounded-lg border border-dashed bg-muted/30">
                          <Input
                            placeholder="Item name"
                            value={quickAddName}
                            onChange={e => setQuickAddName(e.target.value)}
                            className="h-8 text-sm flex-1"
                            onKeyDown={e => { if (e.key === "Enter") handleQuickAdd(category); }}
                            autoFocus
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">£</span>
                            <Input
                              placeholder="0.00"
                              value={quickAddPrice}
                              onChange={e => setQuickAddPrice(e.target.value)}
                              className="h-8 text-sm w-20"
                              type="number"
                              step="0.01"
                              min="0"
                              onKeyDown={e => { if (e.key === "Enter") handleQuickAdd(category); }}
                            />
                          </div>
                          <Button size="sm" className="h-8" onClick={() => handleQuickAdd(category)} disabled={isQuickAdding}>
                            {isQuickAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8" onClick={() => { setQuickAddCategory(null); setQuickAddName(""); setQuickAddPrice(""); }}>
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground h-7"
                            onClick={() => setQuickAddCategory(category)}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Quick add
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground h-7"
                            onClick={() => { setAddToCategoryName(category); setEditingItem(null); setShowForm(true); }}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Full add
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default RestaurantDashboard;
