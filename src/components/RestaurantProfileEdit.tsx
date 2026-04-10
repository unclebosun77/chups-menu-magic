// Storage bucket: "restaurant-logos" — public read, authenticated upload
// Upload path: {userId}/logo.{ext}

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const cuisineTypes = [
  "Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai", "French", "American",
  "Mediterranean", "Middle Eastern", "Korean", "Vietnamese", "Afro-Caribbean", "Fast Food", "Fusion", "Other"
];

const VIBE_OPTIONS = [
  'chilled', 'lively', 'romantic', 'casual', 'upscale', 'family-friendly',
  'date-night', 'group-dining', 'outdoor-seating', 'cosy', 'trendy', 'quiet',
];

interface RestaurantProfileEditProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: {
    id: string;
    name: string;
    cuisine_type: string;
    description?: string;
    logo_url?: string;
    phone?: string;
    address?: string;
    city?: string;
    vibes?: string[];
  };
  onSuccess: () => void;
}

const RestaurantProfileEdit = ({ isOpen, onClose, restaurant, onSuccess }: RestaurantProfileEditProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: restaurant.name,
    cuisine_type: restaurant.cuisine_type,
    description: restaurant.description || "",
    logo: restaurant.logo_url || "",
    phone: restaurant.phone || "",
    address: restaurant.address || "",
    city: restaurant.city || "",
    vibes: restaurant.vibes || [],
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      setUploadProgress(10);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please log in to upload", variant: "destructive" });
        return;
      }

      const userId = session.user.id;
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${userId}/logo.${ext}`;

      setUploadProgress(30);

      const { error } = await supabase.storage
        .from('restaurant-logos')
        .upload(path, file, { upsert: true });

      if (error) {
        toast({ title: "Logo upload failed", description: error.message, variant: "destructive" });
        return;
      }

      setUploadProgress(80);

      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-logos')
        .getPublicUrl(path);

      setUploadProgress(100);
      setFormData(prev => ({ ...prev, logo: publicUrl }));
      toast({ title: "Logo uploaded successfully" });
    } catch (err: any) {
      toast({ title: "Upload error", description: err.message, variant: "destructive" });
    } finally {
      setTimeout(() => {
        setIsUploadingLogo(false);
        setUploadProgress(0);
      }, 500);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("restaurants")
        .update({
          name: formData.name,
          cuisine_type: formData.cuisine_type,
          description: formData.description,
          logo_url: formData.logo,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          vibes: formData.vibes,
        })
        .eq("id", restaurant.id);

      if (error) throw error;

      toast({ title: "Profile updated successfully" });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Restaurant Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Restaurant Logo</Label>
            <div className="flex flex-col gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload-edit"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full h-32 border-2 border-dashed"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingLogo}
              >
                {isUploadingLogo ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                ) : formData.logo ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={formData.logo} alt="Logo Preview" className="h-20 w-20 object-contain rounded" />
                    <span className="text-sm">Change Logo</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8" />
                    <span>Upload Restaurant Logo</span>
                  </div>
                )}
              </Button>
              {isUploadingLogo && <Progress value={uploadProgress} className="h-1.5" />}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-base font-semibold">Restaurant Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-cuisine" className="text-base font-semibold">Cuisine Type *</Label>
            <Select value={formData.cuisine_type} onValueChange={(value) => setFormData({ ...formData, cuisine_type: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {cuisineTypes.map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-base font-semibold">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone" className="text-base font-semibold">Phone</Label>
            <Input
              id="edit-phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-address" className="text-base font-semibold">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main St"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city" className="text-base font-semibold">City</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="New York"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">Vibes & Atmosphere</Label>
            <p className="text-sm text-muted-foreground">Select up to 5 that describe your venue</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {VIBE_OPTIONS.map(vibe => {
                const selected = formData.vibes.includes(vibe);
                return (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => {
                      if (selected) {
                        setFormData(prev => ({ ...prev, vibes: prev.vibes.filter(v => v !== vibe) }));
                      } else if (formData.vibes.length < 5) {
                        setFormData(prev => ({ ...prev, vibes: [...prev.vibes, vibe] }));
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      selected
                        ? 'bg-purple text-white border-purple'
                        : 'bg-secondary/50 text-foreground border-border hover:border-purple/40'
                    } ${!selected && formData.vibes.length >= 5 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {vibe}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading || isUploadingLogo}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantProfileEdit;
