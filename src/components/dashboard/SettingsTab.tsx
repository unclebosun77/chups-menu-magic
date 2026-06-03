import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Upload, Loader2, X, Plus, Clock, Palette, Save, Camera, Check, ImagePlus, Star, RotateCw } from "lucide-react";
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

  // Safe view of restaurant — never undefined for downstream hook logic
  const r = restaurant || ({} as SettingsTabProps["restaurant"]);

  // ─── Section 1: Profile ───
  const [profile, setProfile] = useState({
    name: r.name || "",
    cuisine_type: r.cuisine_type || "",
    description: r.description || "",
    phone: r.phone || "",
    address: r.address || "",
    city: r.city || "",
    price_range: r.price_range || "",
    website: r.website || "",
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
  type GalleryItem = {
    id: string;
    url: string;
    status: "uploading" | "ready" | "error";
    progress: number;
    file?: File;
  };

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState(r.logo_url || "");
  const [coverUrl, setCoverUrl] = useState(r.cover_image_url || "");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    const raw = Array.isArray(r.gallery_images) ? r.gallery_images : [];
    return raw
      .map((u: any, i: number) => {
        const url = typeof u === "string" ? u : (u && typeof u === "object" ? (u.url || "") : "");
        if (!url) return null;
        return { id: `${i}-${url}`, url, status: "ready" as const, progress: 100 };
      })
      .filter(Boolean) as GalleryItem[];
  });
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoSavedFlash, setLogoSavedFlash] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [brandingSavedFlash, setBrandingSavedFlash] = useState(false);

  const flashSaved = () => {
    setBrandingSavedFlash(true);
    setTimeout(() => setBrandingSavedFlash(false), 1500);
  };

  const uploadImage = async (file: File, bucket: string, path: string): Promise<string | null> => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return null; }
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return `${publicUrl}?t=${Date.now()}`;
  };

  const persistGallery = async (items: GalleryItem[], newCover?: string) => {
    const urls = items.filter(i => i.status === "ready").map(i => i.url);
    const payload: any = { gallery_images: urls };
    if (newCover !== undefined) payload.cover_image_url = newCover;
    await supabase.from("restaurants").update(payload).eq("id", restaurant.id);
    flashSaved();
    onUpdate();
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLogoUploading(false); return; }
    const ext = file.name.split('.').pop() || 'jpg';
    const url = await uploadImage(file, "restaurant-logos", `${session.user.id}/logo.${ext}`);
    if (url) {
      await supabase.from("restaurants").update({ logo_url: url }).eq("id", restaurant.id);
      setLogoUrl(url);
      setLogoSavedFlash(true);
      setTimeout(() => setLogoSavedFlash(false), 2000);
      onUpdate();
    }
    setLogoUploading(false);
    e.target.value = "";
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    setCoverProgress(15);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setCoverUploading(false); return; }
    const ext = file.name.split('.').pop() || 'jpg';
    setCoverProgress(50);
    const url = await uploadImage(file, "restaurant-gallery", `${session.user.id}/cover_${Date.now()}.${ext}`);
    if (url) {
      setCoverProgress(85);
      await supabase.from("restaurants").update({ cover_image_url: url }).eq("id", restaurant.id);
      setCoverUrl(url);
      toast({ title: "Cover updated ✓" });
      flashSaved();
      onUpdate();
    }
    setCoverProgress(100);
    setTimeout(() => { setCoverUploading(false); setCoverProgress(0); }, 400);
    e.target.value = "";
  };

  const uploadGalleryFile = async (item: GalleryItem, session: any): Promise<GalleryItem> => {
    if (!item.file) return { ...item, status: "error" };
    const ext = item.file.name.split('.').pop() || 'jpg';
    const path = `${session.user.id}/gallery_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const url = await uploadImage(item.file, "restaurant-gallery", path);
    if (!url) return { ...item, status: "error", progress: 0 };
    return { ...item, url, status: "ready", progress: 100, file: undefined };
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const allowed = files.filter(f => /image\/(jpeg|png|webp)/.test(f.type)).slice(0, 10);
    if (allowed.length === 0) {
      toast({ title: "Use JPEG, PNG or WEBP images", variant: "destructive" });
      e.target.value = "";
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const placeholders: GalleryItem[] = allowed.map(f => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url: URL.createObjectURL(f),
      status: "uploading",
      progress: 10,
      file: f,
    }));
    setGalleryItems(prev => [...prev, ...placeholders]);

    const results: GalleryItem[] = [];
    for (const p of placeholders) {
      setGalleryItems(prev => prev.map(it => it.id === p.id ? { ...it, progress: 50 } : it));
      const finished = await uploadGalleryFile(p, session);
      results.push(finished);
      setGalleryItems(prev => prev.map(it => it.id === p.id ? finished : it));
    }

    setGalleryItems(prev => {
      const next = prev.map(it => results.find(r => r.id === it.id) || it);
      persistGallery(next);
      return next;
    });
    e.target.value = "";
  };

  const retryGalleryItem = async (id: string) => {
    const item = galleryItems.find(i => i.id === id);
    if (!item?.file) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setGalleryItems(prev => prev.map(it => it.id === id ? { ...it, status: "uploading", progress: 30 } : it));
    const finished = await uploadGalleryFile(item, session);
    setGalleryItems(prev => {
      const next = prev.map(it => it.id === id ? finished : it);
      if (finished.status === "ready") persistGallery(next);
      return next;
    });
  };

  const removeGalleryImage = async (id: string) => {
    setGalleryItems(prev => {
      const next = prev.filter(it => it.id !== id);
      persistGallery(next);
      return next;
    });
    toast({ title: "Photo removed" });
  };

  const setGalleryAsCover = async (id: string) => {
    const item = galleryItems.find(i => i.id === id);
    if (!item || item.status !== "ready") return;
    await supabase.from("restaurants").update({ cover_image_url: item.url }).eq("id", restaurant.id);
    setCoverUrl(item.url);
    toast({ title: "Cover updated ✓" });
    flashSaved();
    onUpdate();
  };

  const moveGalleryToFirst = async (id: string) => {
    setGalleryItems(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.unshift(item);
      const cover = item.status === "ready" ? item.url : undefined;
      if (cover) setCoverUrl(cover);
      persistGallery(next, cover);
      return next;
    });
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

  const [hoursData, setHoursData] = useState<Record<string, DayHours>>(parseHours(r.hours));
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
  const [mood, setMood] = useState<string[]>(Array.isArray(r.mood) ? r.mood : []);
  const [vibes, setVibes] = useState<string[]>(Array.isArray(r.vibes) ? r.vibes : []);
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2"><Palette className="h-5 w-5" /> Branding & Images</CardTitle>
              <CardDescription>Your logo, cover photo, and gallery</CardDescription>
            </div>
            {brandingSavedFlash && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <Check className="h-3.5 w-3.5" /> Saved
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Hidden file inputs */}
          <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
          <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleGalleryUpload} className="hidden" />

          {/* ─ Logo ─ */}
          <div className="space-y-3">
            <Label className="font-semibold">Logo</Label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={logoUploading}
                className="relative h-20 w-20 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple"
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-purple text-white flex items-center justify-center text-2xl font-bold relative">
                    {restaurant.name?.charAt(0).toUpperCase() || "?"}
                    <div className="absolute bottom-0 right-0 h-6 w-6 bg-black/60 rounded-full flex items-center justify-center">
                      <Camera className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                )}
                {logoUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </button>
              <div className="space-y-1">
                <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={logoUploading}>
                  {logoUrl ? "Change logo" : "Upload logo"}
                </Button>
                {logoSavedFlash && (
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="h-3 w-3" /> Logo updated
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ─ Cover Photo ─ */}
          <div className="space-y-3">
            <Label className="font-semibold">Cover photo</Label>
            {coverUrl ? (
              <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-border/40">
                <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={coverUploading}
                  className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-black/75 transition-colors flex items-center gap-1.5"
                >
                  {coverUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                  Change cover
                </button>
                {coverUploading && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                    <div className="h-full bg-purple transition-all" style={{ width: `${coverProgress}%` }} />
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                className="w-full h-40 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-purple/40 hover:text-purple transition-colors"
              >
                {coverUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
                <span className="text-sm font-medium">Add cover photo</span>
              </button>
            )}
          </div>

          {/* ─ Gallery ─ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Gallery</Label>
              {galleryItems.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => galleryInputRef.current?.click()}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" /> Add photos
                </Button>
              )}
            </div>

            {galleryItems.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center space-y-4">
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Add photos of your restaurant, dishes, and atmosphere — customers love seeing the real experience 📸
                </p>
                <Button
                  onClick={() => galleryInputRef.current?.click()}
                  className="bg-purple hover:bg-purple/90 text-white gap-2"
                >
                  <ImagePlus className="h-4 w-4" />
                  Add your first photo
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {galleryItems.map((item, i) => {
                  const isCover = item.status === "ready" && item.url === coverUrl;
                  return (
                    <div key={item.id} className="relative group aspect-square rounded-xl overflow-hidden border border-border/40 bg-muted">
                      <img src={item.url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />

                      {/* Cover badge */}
                      {isCover && (
                        <span className="absolute top-1.5 left-1.5 bg-purple text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="h-2.5 w-2.5 fill-current" /> Cover
                        </span>
                      )}

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(item.id)}
                        className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-white/90 text-foreground flex items-center justify-center shadow hover:bg-white"
                        aria-label="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>

                      {/* Hover actions */}
                      {item.status === "ready" && !isCover && (
                        <div className="absolute inset-x-1.5 bottom-1.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setGalleryAsCover(item.id)}
                            className="w-full bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold py-1 rounded-full hover:bg-black/85"
                          >
                            Set as cover
                          </button>
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => moveGalleryToFirst(item.id)}
                              className="w-full bg-white/85 backdrop-blur-sm text-foreground text-[10px] font-semibold py-1 rounded-full hover:bg-white"
                            >
                              Move to first
                            </button>
                          )}
                        </div>
                      )}

                      {/* Uploading overlay */}
                      {item.status === "uploading" && (
                        <>
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                            <div className="h-full bg-purple transition-all" style={{ width: `${item.progress}%` }} />
                          </div>
                        </>
                      )}

                      {/* Error overlay */}
                      {item.status === "error" && (
                        <div className="absolute inset-0 bg-red-500/70 flex flex-col items-center justify-center gap-2 text-white">
                          <X className="h-5 w-5" />
                          <button
                            type="button"
                            onClick={() => retryGalleryItem(item.id)}
                            className="text-[10px] font-semibold bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full flex items-center gap-1"
                          >
                            <RotateCw className="h-3 w-3" /> Retry
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
