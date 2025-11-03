import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const brandStyles = [
  { value: "playful", label: "Playful & Fun", colors: { primary: "#FF6B35", secondary: "#F7931E" } },
  { value: "elegant", label: "Elegant & Sophisticated", colors: { primary: "#1F2937", secondary: "#D4AF37" } },
  { value: "rustic", label: "Rustic & Cozy", colors: { primary: "#8B4513", secondary: "#CD853F" } },
  { value: "modern", label: "Modern & Minimal", colors: { primary: "#2563EB", secondary: "#10B981" } },
  { value: "vibrant", label: "Vibrant & Energetic", colors: { primary: "#EC4899", secondary: "#F59E0B" } },
];

const cuisineTypes = [
  "Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai", "French", "American",
  "Mediterranean", "Middle Eastern", "Korean", "Vietnamese", "Other"
];

const RestaurantOnboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("playful");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
        
        // Check if restaurant already exists
        const { data: restaurant } = await supabase
          .from("restaurants")
          .select("id")
          .eq("user_id", session.user.id)
          .single();
        
        if (restaurant) {
          navigate("/restaurant/dashboard");
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const style = brandStyles.find(s => s.value === selectedStyle);

    const { error } = await supabase.from("restaurants").insert({
      user_id: userId,
      name: formData.get("name") as string,
      cuisine_type: formData.get("cuisine") as string,
      brand_style: selectedStyle,
      primary_color: style?.colors.primary || "#FF6B35",
      secondary_color: style?.colors.secondary || "#10B981",
      description: formData.get("description") as string,
      logo_url: formData.get("logo") as string || null,
    });

    if (error) {
      toast({ title: "Error creating restaurant", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Restaurant created!", description: "Welcome to CHUPS" });
      navigate("/restaurant/dashboard");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome to CHUPS! 👋</CardTitle>
          <CardDescription>Let's set up your restaurant profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input id="name" name="name" required placeholder="The Gourmet Kitchen" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuisine">Cuisine Type *</Label>
              <Select name="cuisine" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select cuisine type" />
                </SelectTrigger>
                <SelectContent>
                  {cuisineTypes.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL (optional)</Label>
              <Input id="logo" name="logo" type="url" placeholder="https://example.com/logo.png" />
            </div>

            <div className="space-y-2">
              <Label>Brand Style *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {brandStyles.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setSelectedStyle(style.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedStyle === style.value
                        ? "border-primary shadow-hover"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: style.colors.primary }}
                        />
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: style.colors.secondary }}
                        />
                      </div>
                      <span className="font-medium">{style.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                required
                placeholder="Tell customers about your restaurant..."
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Restaurant"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantOnboarding;
