import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Upload, Loader2, X, Plus, Clock, Palette, Save } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CUISINE_TYPES = [
  "Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai", "French", "American",
  "Mediterranean", "Middle Eastern", "Korean", "Vietnamese", "Afro-Caribbean", "Fast Food", "Fusion", "Other"
];

const PRICE_RANGES = ["£", "££", "£££", "££££"];

const MOOD_OPTIONS = [
  { label: "Chilled", emoji: "😌" },
  { label: "Lively", emoji: "🎉" },
  { label: "Bubbling", emoji: "🔥" },
  { label: "Romantic", emoji: "💕" },
  { label: "Casual", emoji: "😊" },
  { label: "Upscale", emoji: "✨" },
  { label: "Cosy", emoji: "🏠" },
  { label: "Quiet", emoji: "🤫" },
  { label: "Family-friendly", emoji: "👨‍👩‍👧" },
  { label: "Trendy", emoji: "💫" },
];

const VIBE_OPTIONS = [
  "Romantic", "Date night", "Group dining", "Outdoor seating", "Live music", "Sports viewing",
  "Chilled", "Lively", "Casual", "Upscale", "Family-friendly", "Cosy", "Trendy", "Quiet",
];

const DAY_NAMES = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS: Record<string, string> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday",
  friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};

interface SettingsTabProps {
  restaurant: {
    id: string;
    name: string;
    cuisine_type: string;
    description?: string;
    logo_url?: string;
    cover_image_url?: string;
    gallery_images?: string[];
    phone?: string;
    address?: string;
    city?: string;
    vibes?: string[];
    mood?: string[];
    price_range?: string;
    website?: string;
    hours?: Record<string, string>;
  };
  onUpdate: () => void;
}

const SettingsTab = ({ restaurant, onUpdate }: SettingsTabProps) => {
  const { toast } = useToast();

  // ─── Section 1: Profile ───
  const [profile, setProfile] = useState({
    name: restaurant.name,
    cuisine_type: restaurant.cuisine_type,
    description: restaurant.description || "",
    phone: restaurant.phone || "",
    address: restaurant.address || "",
    city: restaurant.city || "",
    price_range: restaurant.price_range || "",
    website: restaurant.website || "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const saveProfile = async () => {
    setIsSavingProfile(true);
    const { error } = await supabase.from("restaurants").update({
      name: profile.name,
      cuisine_type: profile.cuisine_type,
      description: profile.description,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      price_range: profile.price_range || null,
      website: profile.website || null,
    } as any).eq("id", restaurant.id);
    setIsSavingProfile(false);
    if (error) { toast({ title: "Error saving profile", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Profile saved ✓" });
    onUpdate();
  };

  // ─── Section 2: Branding & Images ───
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState(restaurant.logo_url || "");
  const [coverUrl, setCoverUrl] = useState(restaurant.cover_image_url || "");
  const [galleryUrls, setGalleryUrls] = useState<string[]>(restaurant.gallery_images || []);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file: File, bucket: string, path: string): Promise<string | null> => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return null; }
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingTarget("logo");
    setUploadProgress(30);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const ext = file.name.split('.').pop() || 'jpg';
    const url = await uploadImage(file, "restaurant-logos", `${session.user.id}/logo.${ext}`);
    if (url) {
      setUploadProgress(80);
      await supabase.from("restaurants").update({ logo_url: url }).eq("id", restaurant.id);
      setLogoUrl(url);
      toast({ title: "Logo updated ✓" });
      onUpdate();
    }
    setUploadProgress(100);
    setTimeout(() => { setUploadingTarget(null); setUploadProgress(0); }, 400);
    e.target.value = "";
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingTarget("cover");
    setUploadProgress(30);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const ext = file.name.split('.').pop() || 'jpg';
    const url = await uploadImage(file, "restaurant-gallery", `${session.user.id}/cover.${ext}`);
    if (url) {
      setUploadProgress(80);
      await supabase.from("restaurants").update({ cover_image_url: url }).eq("id", restaurant.id);
      setCoverUrl(url);
      toast({ title: "Cover photo updated ✓" });
      onUpdate();
    }
    setUploadProgress(100);
    setTimeout(() => { setUploadingTarget(null); setUploadProgress(0); }, 400);
    e.target.value = "";
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingTarget("gallery");
    setUploadProgress(10);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const newUrls: string[] = [];
    for (let i = 0; i < Math.min(files.length, 10); i++) {
      const file = files[i];
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${session.user.id}/gallery_${Date.now()}_${i}.${ext}`;
      const url = await uploadImage(file, "restaurant-gallery", path);
      if (url) newUrls.push(url);
      setUploadProgress(10 + ((i + 1) / files.length) * 80);
    }
    const updated = [...galleryUrls, ...newUrls];
    await supabase.from("restaurants").update({ gallery_images: updated } as any).eq("id", restaurant.id);
    setGalleryUrls(updated);
    toast({ title: `${newUrls.length} photo(s) added ✓` });
    onUpdate();
    setUploadProgress(100);
    setTimeout(() => { setUploadingTarget(null); setUploadProgress(0); }, 400);
    e.target.value = "";
  };

  const removeGalleryImage = async (index: number) => {
    const updated = galleryUrls.filter((_, i) => i !== index);
    await supabase.from("restaurants").update({ gallery_images: updated } as any).eq("id", restaurant.id);
    setGalleryUrls(updated);
    toast({ title: "Photo removed" });
    onUpdate();
  };

  // ─── Section 3: Opening Hours ───
  type DayHours = { open: string; close: string; closed: boolean };
  const parseHours = (hours?: Record<string, string>): Record<string, DayHours> => {
    const result: Record<string, DayHours> = {};
    DAY_NAMES.forEach(day => {
      const val = hours?.[day] || "";
      if (!val || val.toLowerCase() === "closed") {
        result[day] = { open: "09:00", close: "22:00", closed: true };
      } else {
        const [open, close] = val.split("-");
        result[day] = { open: open || "09:00", close: close || "22:00", closed: false };
      }
    });
    return result;
  };

  const [hoursData, setHoursData] = useState<Record<string, DayHours>>(parseHours(restaurant.hours));
  const [isSavingHours, setIsSavingHours] = useState(false);

  const saveHours = async () => {
    setIsSavingHours(true);
    const hoursObj: Record<string, string> = {};
    DAY_NAMES.forEach(day => {
      const d = hoursData[day];
      hoursObj[day] = d.closed ? "closed" : `${d.open}-${d.close}`;
    });
    const { error } = await supabase.from("restaurants").update({ hours: hoursObj }).eq("id", restaurant.id);
    setIsSavingHours(false);
    if (error) { toast({ title: "Error saving hours", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Opening hours saved ✓" });
    onUpdate();
  };

  // ─── Section 4: Atmosphere & Mood ───
  const [mood, setMood] = useState<string[]>(restaurant.mood || []);
  const [vibes, setVibes] = useState<string[]>(restaurant.vibes || []);
  const [isSavingAtmos, setIsSavingAtmos] = useState(false);

  const saveAtmosphere = async () => {
    setIsSavingAtmos(true);
    const { error } = await supabase.from("restaurants").update({ mood, vibes } as any).eq("id", restaurant.id);
    setIsSavingAtmos(false);
    if (error) { toast({ title: "Error saving", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Atmosphere saved ✓" });
    onUpdate();
  };

  return (
    <div className="space-y-8">
      {/* ─── SECTION 1: Profile ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
          <CardDescription>Basic information about your restaurant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Restaurant Name *</Label>
              <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Cuisine Type *</Label>
              <Select value={profile.cuisine_type} onValueChange={v => setProfile(p => ({ ...p, cuisine_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CUISINE_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={profile.description} onChange={e => setProfile(p => ({ ...p, description: e.target.value }))} className="min-h-[80px]" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Price Range</Label>
              <Select value={profile.price_range} onValueChange={v => setProfile(p => ({ ...p, price_range: v }))}>
                <SelectTrigger><SelectValue placeholder="Select price range" /></SelectTrigger>
                <SelectContent>
                  {PRICE_RANGES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+44 20 1234 5678" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Website</Label>
            <Input value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} placeholder="https://myrestaurant.com" />
          </div>

          <Button onClick={saveProfile} disabled={isSavingProfile}>
            {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* ─── SECTION 2: Branding & Images ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Palette className="h-5 w-5" /> Branding & Images</CardTitle>
          <CardDescription>Your logo, cover photo, and gallery</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hidden file inputs */}
          <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
          <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />

          {/* Logo */}
          <div className="space-y-2">
            <Label className="font-semibold">Logo</Label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-16 w-16 object-contain rounded-lg border" />
              ) : (
                <div className="h-16 w-16 rounded-lg border border-dashed flex items-center justify-center bg-muted"><Upload className="h-5 w-5 text-muted-foreground" /></div>
              )}
              <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={uploadingTarget === "logo"}>
                {uploadingTarget === "logo" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {logoUrl ? "Change logo" : "Upload logo"}
              </Button>
            </div>
            {uploadingTarget === "logo" && <Progress value={uploadProgress} className="h-1.5" />}
          </div>

          {/* Cover Photo */}
          <div className="space-y-2">
            <Label className="font-semibold">Cover Photo</Label>
            <div className="space-y-2">
              {coverUrl ? (
                <img src={coverUrl} alt="Cover" className="w-full h-32 object-cover rounded-lg border" />
              ) : (
                <div className="w-full h-32 rounded-lg border border-dashed flex items-center justify-center bg-muted">
                  <span className="text-sm text-muted-foreground">No cover photo</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => coverInputRef.current?.click()} disabled={uploadingTarget === "cover"}>
                {uploadingTarget === "cover" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {coverUrl ? "Change cover" : "Upload cover"}
              </Button>
            </div>
            {uploadingTarget === "cover" && <Progress value={uploadProgress} className="h-1.5" />}
          </div>

          {/* Gallery */}
          <div className="space-y-2">
            <Label className="font-semibold">Gallery</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {galleryUrls.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt={`Gallery ${i + 1}`} className="h-24 w-full object-cover rounded-lg border" />
                  <button
                    onClick={() => removeGalleryImage(i)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/40 transition-colors"
                disabled={uploadingTarget === "gallery"}
              >
                {uploadingTarget === "gallery" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                <span className="text-xs">Add photos</span>
              </button>
            </div>
            {uploadingTarget === "gallery" && <Progress value={uploadProgress} className="h-1.5" />}
          </div>
        </CardContent>
      </Card>

      {/* ─── SECTION 3: Opening Hours ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5" /> Opening Hours</CardTitle>
          <CardDescription>Set your weekly schedule</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {DAY_NAMES.map(day => {
            const d = hoursData[day];
            return (
              <div key={day} className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium">{DAY_LABELS[day]}</span>
                <Switch
                  checked={!d.closed}
                  onCheckedChange={checked => setHoursData(prev => ({ ...prev, [day]: { ...prev[day], closed: !checked } }))}
                />
                {d.closed ? (
                  <span className="text-sm text-muted-foreground">Closed</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={d.open}
                      onChange={e => setHoursData(prev => ({ ...prev, [day]: { ...prev[day], open: e.target.value } }))}
                      className="w-28 h-8 text-sm"
                    />
                    <span className="text-muted-foreground">—</span>
                    <Input
                      type="time"
                      value={d.close}
                      onChange={e => setHoursData(prev => ({ ...prev, [day]: { ...prev[day], close: e.target.value } }))}
                      className="w-28 h-8 text-sm"
                    />
                  </div>
                )}
              </div>
            );
          })}
          <Button onClick={saveHours} disabled={isSavingHours} className="mt-2">
            {isSavingHours ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Hours
          </Button>
        </CardContent>
      </Card>

      {/* ─── SECTION 4: Atmosphere & Mood ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Atmosphere & Mood</CardTitle>
          <CardDescription>Help diners know what to expect</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Mood */}
          <div className="space-y-2">
            <Label className="font-semibold">Current Mood (select up to 3)</Label>
            <p className="text-xs text-muted-foreground">How does your restaurant feel right now?</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {MOOD_OPTIONS.map(({ label, emoji }) => {
                const selected = mood.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      if (selected) setMood(prev => prev.filter(m => m !== label));
                      else if (mood.length < 3) setMood(prev => [...prev, label]);
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary/50 text-foreground border-border hover:border-primary/40'
                    } ${!selected && mood.length >= 3 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {emoji} {label}
                  </button>
                );
              })}
            </div>
            {mood.length > 0 && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setMood([])}>
                Clear mood
              </Button>
            )}
          </div>

          {/* Permanent Vibes */}
          <div className="space-y-2">
            <Label className="font-semibold">Atmosphere (select up to 5)</Label>
            <p className="text-xs text-muted-foreground">Permanent tags that describe your venue</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {VIBE_OPTIONS.map(vibe => {
                const selected = vibes.includes(vibe);
                return (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => {
                      if (selected) setVibes(prev => prev.filter(v => v !== vibe));
                      else if (vibes.length < 5) setVibes(prev => [...prev, vibe]);
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary/50 text-foreground border-border hover:border-primary/40'
                    } ${!selected && vibes.length >= 5 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {vibe}
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={saveAtmosphere} disabled={isSavingAtmos}>
            {isSavingAtmos ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Atmosphere
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
