import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, User, ChefHat, Camera } from "lucide-react";

interface RestaurantData {
  id: string;
  name: string;
  description: string | null;
  cuisine_type: string;
  phone: string | null;
}

const BIO_MAX = 150;

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantDesc, setRestaurantDesc] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [restaurantPhone, setRestaurantPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
    setPhone(user.user_metadata?.phone || "");
    setAvatarUrl(user.user_metadata?.avatar_url || null);

    const fetchData = async () => {
      const [restaurantRes, profileRes] = await Promise.all([
        supabase
          .from("restaurants")
          .select("id, name, description, cuisine_type, phone")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.from("profiles").select("bio").eq("id", user.id).maybeSingle(),
      ]);
      if (restaurantRes.data) {
        setRestaurant(restaurantRes.data);
        setRestaurantName(restaurantRes.data.name);
        setRestaurantDesc(restaurantRes.data.description || "");
        setCuisineType(restaurantRes.data.cuisine_type);
        setRestaurantPhone(restaurantRes.data.phone || "");
      }
      if (profileRes.data?.bio) setBio(profileRes.data.bio);
      setIsLoading(false);
    };
    fetchData();
  }, [user]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please choose an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 5MB", variant: "destructive" });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      // Signed URL valid for ~1 year so the avatar keeps working
      const { data: signed, error: signedError } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signedError || !signed?.signedUrl) throw signedError || new Error("Could not generate URL");

      const publicUrl = signed.signedUrl;
      const { error: metaError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl, avatar_path: path },
      });
      if (metaError) throw metaError;

      setAvatarUrl(publicUrl);
      toast({ title: "Photo updated ✨" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { error: userError } = await supabase.auth.updateUser({
        data: { full_name: displayName, phone },
      });
      if (userError) throw userError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ bio: bio.trim() || null })
        .eq("id", user.id);
      if (profileError) throw profileError;

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

  const initial = (displayName || user?.email || "U")[0].toUpperCase();

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
        {/* Avatar upload */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={isUploadingAvatar}
            className="relative group"
            aria-label="Change profile photo"
          >
            <Avatar className="h-24 w-24 ring-2 ring-purple/20 ring-offset-4 ring-offset-background">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <AvatarFallback className="text-3xl bg-gradient-to-br from-purple to-neon-pink text-white font-bold">
                  {initial}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              {isUploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </div>
          </button>
          <p className="text-xs text-muted-foreground mt-3">Tap to change your photo</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio">Tell us about yourself</Label>
                  <span className="text-xs text-muted-foreground tabular-nums">{bio.length}/{BIO_MAX}</span>
                </div>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
                  placeholder="A short bio (optional)"
                  rows={3}
                  maxLength={BIO_MAX}
                />
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
