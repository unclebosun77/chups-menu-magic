import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, Eye, Settings } from "lucide-react";
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

const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

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
