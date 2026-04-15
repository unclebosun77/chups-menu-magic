import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, User, ChefHat } from "lucide-react";

interface RestaurantData {
  id: string;
  name: string;
  description: string | null;
  cuisine_type: string;
  phone: string | null;
}

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantDesc, setRestaurantDesc] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [restaurantPhone, setRestaurantPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
    setPhone(user.user_metadata?.phone || "");

    const fetchRestaurant = async () => {
      const { data } = await supabase
        .from("restaurants")
        .select("id, name, description, cuisine_type, phone")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setRestaurant(data);
        setRestaurantName(data.name);
        setRestaurantDesc(data.description || "");
        setCuisineType(data.cuisine_type);
        setRestaurantPhone(data.phone || "");
      }
      setIsLoading(false);
    };
    fetchRestaurant();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      // Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: { full_name: displayName, phone },
      });
      if (userError) throw userError;

      // Update restaurant if owner
      if (restaurant) {
        const { error: restError } = await supabase
          .from("restaurants")
          .update({
            name: restaurantName,
            description: restaurantDesc || null,
            cuisine_type: cuisineType,
            phone: restaurantPhone || null,
          })
          .eq("id", restaurant.id);
        if (restError) throw restError;
      }

      toast({ title: "Profile updated ✨" });
      navigate(-1);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold flex-1">Edit Profile</h1>
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="bg-gradient-to-r from-purple to-neon-pink gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Personal Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <User className="h-4 w-4 text-purple" />
            Personal Information
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} disabled className="h-12 bg-secondary/50" />
                <p className="text-xs text-muted-foreground">Email changes require verification</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(optional)" className="h-12" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Restaurant Info (owners only) */}
        {restaurant && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ChefHat className="h-4 w-4 text-purple" />
              Restaurant Details
            </div>
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurantName">Restaurant Name</Label>
                  <Input id="restaurantName" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurantDesc">Description</Label>
                  <Textarea id="restaurantDesc" value={restaurantDesc} onChange={(e) => setRestaurantDesc(e.target.value)} placeholder="Tell diners about your restaurant..." rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuisineType">Cuisine Type</Label>
                  <Input id="cuisineType" value={cuisineType} onChange={(e) => setCuisineType(e.target.value)} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurantPhone">Restaurant Phone</Label>
                  <Input id="restaurantPhone" type="tel" value={restaurantPhone} onChange={(e) => setRestaurantPhone(e.target.value)} className="h-12" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;