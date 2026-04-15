import { useState, useEffect, useMemo } from "react";
import { isRestaurantOpen, getOpeningStatus } from "@/utils/openingHours";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Heart, Phone, Navigation, Sparkles, Bookmark, Star, Clock, MapPin, ChevronRight, ShoppingCart, Flame, Award, Zap, Calendar, UtensilsCrossed, MessageCircle, Info, Share2, ChevronDown } from "lucide-react";
import { useTasteProfile } from "@/context/TasteProfileContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { DemoMenuItem, DemoRestaurant } from "@/data/demoRestaurantMenus";
import { supabase } from "@/integrations/supabase/client";
import AskOutaModal from "@/components/AskOutaModal";
import FullGalleryModal from "@/components/restaurant/FullGalleryModal";
import { MenuSection } from "@/components/restaurant/menu";
import { vibrate } from "@/utils/haptics";
import { getSupabaseId } from "@/utils/restaurantMapping";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import ReviewsSection from "@/components/ReviewsSection";
import { ReservationDialog } from "@/components/ReservationDialog";

type OrderItem = DemoMenuItem & { quantity: number };

const CROWD_COLORS: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  quiet: { dot: "bg-green-500", bg: "bg-green-100 dark:bg-green-950/40", text: "text-green-700 dark:text-green-300", label: "Quiet" },
  moderate: { dot: "bg-amber-500", bg: "bg-amber-100 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", label: "Moderate" },
  busy: { dot: "bg-orange-500", bg: "bg-orange-100 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-300", label: "Busy" },
  very_busy: { dot: "bg-red-500", bg: "bg-red-100 dark:bg-red-950/40", text: "text-red-700 dark:text-red-300", label: "Very Busy" },
};

const CrowdPill = ({ level }: { level: string }) => {
  const config = CROWD_COLORS[level];
  if (!config) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
    </span>
  );
};

/* ─── Quick Info: Hours row with expandable week ─── */
const QuickInfoHoursRow = ({ status, todayDisplay, openingHours }: { status: any; todayDisplay: string | null; openingHours: any }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-3 px-4 py-3 w-full hover:bg-secondary/30 transition-colors active:scale-[0.99]"
      >
        <div className="w-8 h-8 rounded-lg bg-purple/10 flex items-center justify-center flex-shrink-0">
          <Clock className="h-4 w-4 text-purple" strokeWidth={1.5} />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-emerald-500' : 'bg-red-400'}`} />
            <span className={`text-[13px] font-semibold ${status.isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {status.label}
            </span>
          </div>
          {todayDisplay && (
            <p className="text-[11px] text-muted-foreground mt-0.5">Today: {todayDisplay}</p>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground/40 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && openingHours && (
        <div className="px-4 pb-3 pl-[60px] space-y-1">
          {Object.entries(openingHours).map(([day, hours]: [string, any]) => {
            const display = typeof hours === 'object' && hours !== null
              ? (hours.closed ? 'Closed' : `${hours.open} – ${hours.close}`)
              : String(hours);
            return (
              <div key={day} className="flex justify-between text-[11px]">
                <span className="text-muted-foreground capitalize">{day}</span>
                <span className="font-medium text-foreground/75">{display}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─── Quick Info Section ─── */
const QuickInfoSection = ({ restaurant, priceStats }: { restaurant: DemoRestaurant; priceStats: { min: number; avg: number; max: number } | null }) => {
  const status = getOpeningStatus(restaurant.openingHours as any);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayHours = (restaurant.openingHours as any)?.[today];
  const todayDisplay = todayHours
    ? (typeof todayHours === 'object' && todayHours !== null
        ? (todayHours.closed ? 'Closed' : `${todayHours.open} – ${todayHours.close}`)
        : String(todayHours))
    : null;

  const { profile } = useTasteProfile();
  const budgetPrefMap: Record<string, number> = { budget: 10, mid: 20, premium: 40, luxury: 80 };
  const userBudget = profile?.pricePreference ? budgetPrefMap[profile.pricePreference] : null;
  const fitsbudget = priceStats && userBudget ? priceStats.avg <= userBudget : false;

  return (
    <div
      className="px-5 pt-4 pb-3 animate-[sectionSlide_0.45s_ease-out_forwards]"
      style={{ opacity: 0, animationDelay: '300ms' }}
    >
      <Card className="border-border/30 shadow-sm overflow-hidden">
        <CardContent className="p-0 divide-y divide-border/30">
          {restaurant.address && (
            <a
              href={`https://maps.google.com?q=${encodeURIComponent(restaurant.address + (restaurant.city ? ', ' + restaurant.city : ''))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors active:scale-[0.99]"
            >
              <div className="w-8 h-8 rounded-lg bg-purple/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-purple" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-foreground truncate">{restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}</p>
              </div>
              {restaurant.distance && (
                <span className="text-[11px] text-muted-foreground font-medium flex-shrink-0">{restaurant.distance}</span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
            </a>
          )}

          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors active:scale-[0.99]"
            >
              <div className="w-8 h-8 rounded-lg bg-purple/10 flex items-center justify-center flex-shrink-0">
                <Phone className="h-4 w-4 text-purple" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] text-foreground flex-1">{restaurant.phone}</p>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
            </a>
          )}

          <QuickInfoHoursRow status={status} todayDisplay={todayDisplay} openingHours={restaurant.openingHours} />

          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-purple/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[13px] font-bold text-purple">{restaurant.priceLevel?.[0] || '£'}</span>
            </div>
            <p className="text-[13px] text-foreground flex-1">Price level: <span className="font-semibold">{restaurant.priceLevel || '££'}</span></p>
          </div>

          {priceStats && (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-purple/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[13px]">💰</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-foreground">
                  From <span className="font-semibold">£{priceStats.min.toFixed(2)}</span> · Avg <span className="font-semibold">£{priceStats.avg.toFixed(2)}</span> per dish
                </p>
              </div>
              {fitsbudget && (
                <span className="text-[10px] font-semibold text-green-600 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                  Fits your budget ✓
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Main Component ───

const RestaurantProfile = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isSaved: checkIsSaved, toggleSave } = useSavedRestaurants();
  
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [showAskOuta, setShowAskOuta] = useState(false);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [restaurant, setRestaurant] = useState<DemoRestaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  const [fallbackCrowdLevel, setFallbackCrowdLevel] = useState<string | null>(null);
  const [priceStats, setPriceStats] = useState<{ min: number; avg: number; max: number } | null>(null);
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table");

  const supabaseId = restaurantId ? getSupabaseId(restaurantId) : "";
  const isFavorite = checkIsSaved(supabaseId);

  // Load restaurant data
  useEffect(() => {
    const loadRestaurant = async () => {
      setIsLoading(true);
      if (!restaurantId) { setIsLoading(false); return; }

      const supabaseId = getSupabaseId(restaurantId);
      
      try {
        const { data, error } = await supabase
          .from("restaurants")
          .select("*, is_temporarily_closed, crowd_level, crowd_updated_at, vibes")
          .eq("id", supabaseId)
          .maybeSingle();

        if (data && !error) {
          const { data: menuData } = await supabase
            .from("menu_items")
            .select("id, name, description, price, category, image_url, available, sold_out_today")
            .eq("restaurant_id", data.id);

          const supabaseMenu: DemoMenuItem[] = (menuData || []).map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || "",
            price: Number(item.price),
            category: (item.category?.toLowerCase() || "mains") as DemoMenuItem["category"],
            image: item.image_url || undefined,
            tags: [],
            available: item.available,
            sold_out_today: (item as any).sold_out_today ?? false,
          }));

          const galleryRaw = data.gallery_images as any[];
          const galleryUrls: string[] = Array.isArray(galleryRaw)
            ? galleryRaw.map((g: any) => (typeof g === 'string' ? g : g?.url)).filter(Boolean)
            : [];

          setRestaurant({
            id: data.id,
            name: data.name,
            cuisine: data.cuisine_type,
            address: data.address || "",
            city: data.city || "",
            priceLevel: "££",
            description: data.description || "",
            vibe: (data.vibes as string[])?.length ? (data.vibes as string[]) : [],
            openingHours: (data.hours as Record<string, string>) || {},
            signatureDishes: [],
            logoUrl: data.logo_url || "",
            heroImage: (data as any).cover_image_url || galleryUrls[0] || data.logo_url || "",
            galleryImages: galleryUrls.length > 0 ? galleryUrls : (data.logo_url ? [data.logo_url] : []),
            galleryTheme: "light",
            rating: 4.5,
            distance: "1.0 km",
            isOpen: isRestaurantOpen(data.hours as any, data.is_temporarily_closed),
            menu: supabaseMenu,
            crowdLevel: data.crowd_level,
            crowdUpdatedAt: data.crowd_updated_at,
            phone: data.phone,
          });
        }

        // Fetch price stats
        const { data: priceData } = await supabase
          .from('menu_items')
          .select('price')
          .eq('restaurant_id', supabaseId)
          .eq('available', true);

        if (priceData && priceData.length > 0) {
          const prices = priceData.map(i => Number(i.price));
          setPriceStats({
            min: Math.min(...prices),
            avg: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100,
            max: Math.max(...prices),
          });
        }
      } catch (err) {
        console.error('Failed to load restaurant:', err);
        toast({ title: "Couldn't load restaurant data", variant: "destructive" });
      }

      setIsLoading(false);
    };
    loadRestaurant();
  }, [restaurantId]);

  // Fallback crowd level from recent orders when no Supabase crowd data
  useEffect(() => {
    if (!supabaseId) return;
    const hasFreshCrowd = restaurant?.crowdLevel && restaurant?.crowdUpdatedAt && (Date.now() - new Date(restaurant.crowdUpdatedAt).getTime()) < 2 * 60 * 60 * 1000;
    if (hasFreshCrowd) {
      setFallbackCrowdLevel(null);
      return;
    }
    const fetchRecentOrders = async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", supabaseId)
        .gte("created_at", oneHourAgo);
      const c = count || 0;
      if (c === 0) setFallbackCrowdLevel("quiet");
      else if (c <= 3) setFallbackCrowdLevel("moderate");
      else setFallbackCrowdLevel("busy");
    };
    fetchRecentOrders();
  }, [supabaseId, restaurant?.crowdLevel, restaurant?.crowdUpdatedAt]);

  // Real-time menu updates — refresh menu when owner changes availability/sold_out
  useEffect(() => {
    if (!supabaseId) return;
    const channel = supabase
      .channel(`menu-updates-${supabaseId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'menu_items',
        filter: `restaurant_id=eq.${supabaseId}`,
      }, (payload) => {
        const updated = payload.new as any;
        setRestaurant(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            menu: prev.menu.map(item =>
              item.id === updated.id
                ? { ...item, available: updated.available, sold_out_today: updated.sold_out_today, price: Number(updated.price), name: updated.name }
                : item
            ),
          };
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabaseId]);

  // Real-time crowd level updates
  useEffect(() => {
    if (!supabaseId) return;
    const channel = supabase
      .channel(`restaurant-${supabaseId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'restaurants',
        filter: `id=eq.${supabaseId}`,
      }, (payload) => {
        const updated = payload.new as any;
        setRestaurant(prev => prev ? {
          ...prev,
          crowdLevel: updated.crowd_level,
          crowdUpdatedAt: updated.crowd_updated_at,
          isOpen: isRestaurantOpen(updated.hours, updated.is_temporarily_closed),
        } : prev);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabaseId]);

  const effectiveCrowdLevel = useMemo(() => {
    if (restaurant?.crowdLevel && restaurant?.crowdUpdatedAt && (Date.now() - new Date(restaurant.crowdUpdatedAt).getTime()) < 2 * 60 * 60 * 1000) {
      return restaurant.crowdLevel;
    }
    return fallbackCrowdLevel;
  }, [restaurant?.crowdLevel, restaurant?.crowdUpdatedAt, fallbackCrowdLevel]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple/15 to-purple/25 flex items-center justify-center animate-pulse">
            <Sparkles className="h-5 w-5 text-purple" />
          </div>
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Restaurant not found</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleAddToOrder = (item: DemoMenuItem, quantity: number = 1) => {
    vibrate(20);
    setOrder(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { ...item, quantity }];
    });
    toast({ title: `Added ${item.name} to order ✨` });
  };

  const handleViewOrder = () => {
    navigate("/order-summary", {
      state: {
        restaurantName: restaurant.name,
        restaurantId: restaurant.id,
        tableNumber: tableNumber || null,
        items: order.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity, description: item.description }))
      }
    });
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({ title: "Sign in to save restaurants", description: "Create an account to save your favorites" });
      navigate("/auth");
      return;
    }
    vibrate(20);
    setIsSaving(true);
    const result = await toggleSave(supabaseId);
    setIsSaving(false);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: isFavorite ? "Removed from favorites" : "Added to favorites ❤️" });
    }
  };

  const totalItems = order.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const signatureItems = restaurant.menu.filter(item => 
    restaurant.signatureDishes.some(sig => item.name.toLowerCase().includes(sig.toLowerCase().split(" ")[0]))
  );

  const isOwnerPreview = user && restaurant && user.id === (restaurant as any).userId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 pb-28 animate-[pageEnter_0.35s_ease-out_forwards]" style={{ opacity: 0 }}>
      {/* Owner preview banner */}
      {isOwnerPreview && (
        <div className="sticky top-0 z-50 bg-primary/90 text-primary-foreground text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 backdrop-blur-sm">
          <Eye className="h-4 w-4" />
          Viewing as customer
          <Button size="sm" variant="secondary" className="ml-3 h-7 text-xs" onClick={() => navigate('/restaurant/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      )}
      {/* ─── HERO SECTION ─── */}
      <div className="relative">
        <div 
          className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center animate-[navFloat_0.4s_ease-out_forwards]"
          style={{ opacity: 0 }}
        >
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-background/85 backdrop-blur-md hover:bg-background shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] border border-border/30 transition-all duration-200 hover:scale-105 active:scale-95" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Button>
          <div className="flex gap-2.5">
            <Button variant="ghost" size="icon" disabled={isSaving} className={`h-10 w-10 rounded-full backdrop-blur-md shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] border border-border/30 transition-all duration-200 hover:scale-105 active:scale-95 ${isFavorite ? 'bg-red-50 text-red-500 border-red-200' : 'bg-background/85 hover:bg-background'}`} onClick={handleToggleFavorite}>
              <Heart className={`h-5 w-5 transition-all ${isFavorite ? 'fill-current scale-110' : ''}`} strokeWidth={1.5} />
            </Button>
            {totalItems > 0 && (
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-background/85 backdrop-blur-md hover:bg-background shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] border border-border/30 relative transition-all duration-200 hover:scale-105 active:scale-95" onClick={handleViewOrder}>
                <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
                <span className="absolute -top-1 -right-1 bg-purple text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-[badgePop_0.3s_ease-out]">{totalItems}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Smart Banner */}
        {(() => {
          const currentImage = restaurant.galleryImages[galleryIndex] || restaurant.heroImage;
          const isLogoMode = currentImage === restaurant.logoUrl || currentImage.toLowerCase().includes('logo') || restaurant.galleryImages.length === 0;
          
          if (isLogoMode) {
            return (
              <div className="relative min-h-[280px] overflow-hidden animate-[bannerReveal_0.6s_ease-out_forwards] bg-gradient-to-b from-secondary/50 via-secondary/30 to-background" style={{ opacity: 0 }}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(139,92,246,0.08),transparent_60%)]" />
                <div className="flex flex-col items-center justify-center pt-16 pb-24 px-8">
                  <div className="w-[65%] max-w-[200px] aspect-square rounded-3xl bg-background shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] p-4 border border-border/40 animate-[logoFloat_0.6s_ease-out_forwards]" style={{ opacity: 0, animationDelay: '150ms' }}>
                    <img src={restaurant.logoUrl} alt={restaurant.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.svg'; }} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background via-background/80 to-transparent animate-[titleReveal_0.5s_ease-out_forwards]" style={{ opacity: 0, animationDelay: '250ms' }}>
                  <div className="flex items-end justify-between">
                    <div className="flex-1">
                      <h1 className="text-[26px] font-bold text-foreground tracking-tight leading-tight">{restaurant.name}</h1>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[14px] text-muted-foreground/70">{restaurant.cuisine}</p>
                        {effectiveCrowdLevel && <CrowdPill level={effectiveCrowdLevel} />}
                      </div>
                      {restaurant.vibe?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {restaurant.vibe.slice(0, 5).map(v => (
                            <span key={v} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple/10 text-purple border border-purple/20">{v}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 bg-purple/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-purple/20 shadow-sm">
                      <Star className="h-4 w-4 text-purple fill-purple" strokeWidth={1.5} />
                      <span className="text-[14px] font-bold text-purple">{restaurant.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="relative h-80 overflow-hidden cursor-pointer animate-[bannerReveal_0.6s_ease-out_forwards]" style={{ opacity: 0 }} onClick={() => setShowFullGallery(true)}>
              <img src={currentImage} alt={restaurant.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.svg'; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              {restaurant.galleryImages.length > 1 && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
                  {restaurant.galleryImages.slice(0, 5).map((_, idx) => (
                    <button key={idx} onClick={(e) => { e.stopPropagation(); setGalleryIndex(idx); }} className={`h-2 rounded-full transition-all duration-300 ${idx === galleryIndex ? "bg-white w-6 shadow-lg" : "bg-white/50 w-2 hover:bg-white/70"}`} />
                  ))}
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-5 animate-[titleReveal_0.5s_ease-out_forwards]" style={{ opacity: 0, animationDelay: '200ms' }}>
                <div className="flex items-end gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-background shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] p-1.5 border border-border/50 flex-shrink-0">
                    <img src={restaurant.logoUrl} alt={restaurant.name} className="w-full h-full object-contain rounded-xl" />
                  </div>
                  <div className="flex-1 pb-1">
                    <h1 className="text-[26px] font-bold text-foreground tracking-tight leading-tight">{restaurant.name}</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[14px] text-muted-foreground/80">{restaurant.cuisine}</p>
                      {effectiveCrowdLevel && <CrowdPill level={effectiveCrowdLevel} />}
                    </div>
                    {restaurant.vibe?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {restaurant.vibe.slice(0, 5).map(v => (
                          <span key={v} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple/10 text-purple border border-purple/20">{v}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 bg-purple/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-purple/20 shadow-sm">
                    <Star className="h-4 w-4 text-purple fill-purple" strokeWidth={1.5} />
                    <span className="text-[14px] font-bold text-purple">{restaurant.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ─── 3. QUICK INFO ─── */}
      <QuickInfoSection restaurant={restaurant} priceStats={priceStats} />

      {/* ─── 4. ACTION BUTTONS ─── */}
      <div className="px-5 pb-5 animate-[sectionSlide_0.45s_ease-out_forwards]" style={{ opacity: 0, animationDelay: '380ms' }}>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Calendar, label: "Book", onClick: () => setShowReservation(true), primary: true },
            { icon: UtensilsCrossed, label: "Order", onClick: () => {}, primary: true },
            { icon: Bookmark, label: isFavorite ? "Saved" : "Save", onClick: handleToggleFavorite, primary: false },
            { icon: Share2, label: "Share", onClick: () => { navigator.share?.({ title: restaurant.name, url: window.location.href }).catch(() => {}); }, primary: false },
          ].map((btn, i) => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] animate-[actionButtonPop_0.35s_ease-out_forwards] ${
                btn.primary ? 'bg-purple text-white shadow-[0_4px_16px_-4px_rgba(139,92,246,0.4)]' : 'bg-secondary/60 text-foreground border border-border/40'
              }`}
              style={{ opacity: 0, animationDelay: `${400 + i * 60}ms` }}
            >
              <btn.icon className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[11px] font-medium">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Vibe Tags */}
      <div className="px-5 pb-4 animate-[sectionSlide_0.4s_ease-out_forwards]" style={{ opacity: 0, animationDelay: '480ms' }}>
        <div className="flex flex-wrap gap-2 items-center">
          {restaurant.vibe.map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-[11px] bg-secondary/60 text-muted-foreground border-0 rounded-full px-3.5 py-1.5 font-medium shadow-sm">{tag}</Badge>
          ))}
        </div>
      </div>

      {/* Why you'll like this */}
      {(() => {
        const hasSignature = signatureItems.length > 0;
        const moodChips = [
          ...(restaurant.vibe.includes("Romantic") || restaurant.vibe.includes("Elegant") ? [{ label: "Date Night", icon: Heart }] : []),
          ...(restaurant.vibe.includes("Cozy") || restaurant.vibe.includes("Warm") ? [{ label: "Cozy Vibes", icon: Flame }] : []),
          ...(restaurant.priceLevel === "£" || restaurant.priceLevel === "££" ? [{ label: "Great Value", icon: Zap }] : []),
          ...(restaurant.rating >= 4.5 ? [{ label: "Top Rated", icon: Award }] : []),
          ...(!restaurant.vibe.includes("Romantic") && !restaurant.vibe.includes("Cozy") ? [{ label: "Perfect Tonight", icon: Star }] : []),
        ].slice(0, 3);
        const copy = hasSignature
          ? { headline: "Why you'll like this place", body: (<>The <span className="font-semibold text-purple">{signatureItems[0]?.name}</span> is their signature.</>) }
          : { headline: "Why you'll like this place", body: (<>Based on your taste, you'll love their <span className="font-semibold text-purple">{restaurant.cuisine}</span> dishes.</>) };

        return (
          <div className="px-5 pb-5 animate-[recommendationReveal_0.5s_ease-out_forwards]" style={{ opacity: 0, animationDelay: '520ms' }}>
            <Card className="border-purple/15 bg-gradient-to-br from-purple/[0.07] via-purple/[0.04] to-neon-pink/[0.03] shadow-[0_6px_24px_-8px_rgba(139,92,246,0.18)] overflow-hidden">
              <CardContent className="p-5 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-purple/12 to-transparent rounded-full blur-2xl" />
                <div className="flex items-start gap-4 relative">
                  <div className="relative p-3 rounded-xl bg-gradient-to-br from-purple/20 to-purple/30">
                    <Sparkles className="h-5 w-5 text-purple" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[15px] text-foreground mb-1">{copy.headline}</p>
                    <p className="text-[13px] text-muted-foreground/70 leading-relaxed">{copy.body}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {moodChips.map((chip, idx) => {
                        const ChipIcon = chip.icon;
                        return (
                          <span key={idx} className="flex items-center gap-1.5 text-[10px] text-purple/90 bg-purple/10 px-3 py-1.5 rounded-full font-semibold border border-purple/15">
                            <ChipIcon className="h-3 w-3" strokeWidth={2} />{chip.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Description */}
      <div className="px-5 pb-5 animate-[sectionSlide_0.4s_ease-out_forwards]" style={{ opacity: 0, animationDelay: '580ms' }}>
        <p className="text-[14px] text-muted-foreground/75 leading-relaxed font-light">{restaurant.description}</p>
      </div>

      {/* ─── 5. MENU ─── */}
      <div className="animate-[sectionSlide_0.5s_ease-out_forwards]" style={{ opacity: 0, animationDelay: '640ms' }}>
        {restaurant.menu.length > 0 ? (
          <MenuSection menu={restaurant.menu} signatureDishes={restaurant.signatureDishes} onAddToOrder={handleAddToOrder} />
        ) : (
          <div className="px-5 py-8 text-center">
            <UtensilsCrossed className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-foreground font-semibold mb-1">Menu coming soon 🍽️</p>
            <p className="text-sm text-muted-foreground">This restaurant is finishing their setup</p>
          </div>
        )}
      </div>

      {/* ─── 6. GALLERY ─── */}
      {restaurant.galleryImages.length > 1 && (
        <div className="px-5 py-6 animate-[sectionSlide_0.45s_ease-out_forwards]" style={{ opacity: 0, animationDelay: '720ms' }}>
          <h2 className="text-lg font-bold mb-4 tracking-tight">Gallery</h2>
          <ScrollArea className="w-full">
            <div className="flex gap-2.5 pb-2">
              {restaurant.galleryImages.map((img, idx) => (
                <button key={idx} onClick={() => { setGalleryIndex(idx); setShowFullGallery(true); }} className={`flex-shrink-0 w-28 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${idx === galleryIndex ? "border-purple shadow-[0_4px_12px_-4px_rgba(139,92,246,0.3)]" : "border-transparent opacity-80 hover:opacity-100"}`}>
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.svg'; }} />
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* ─── 7. REVIEWS ─── */}
      <div className="px-5 pb-6 animate-[sectionSlide_0.45s_ease-out_forwards]" style={{ opacity: 0, animationDelay: '800ms' }}>
        <h2 className="text-lg font-bold mb-4 tracking-tight">Reviews</h2>
        <ReviewsSection restaurantId={supabaseId} />
      </div>

      {/* Order Bar */}
      {totalItems > 0 && restaurant.menu.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border/40 p-4 z-50 animate-[orderBarSlide_0.35s_ease-out_forwards]">
          {tableNumber && (
            <div className="flex justify-center mb-2">
              <span className="text-[11px] font-semibold text-purple bg-purple/10 px-3 py-1 rounded-full border border-purple/20">Table {tableNumber}</span>
            </div>
          )}
          <Button className="w-full bg-gradient-to-r from-purple to-purple/90 hover:from-purple/95 hover:to-purple/85 text-white h-14 rounded-2xl shadow-[0_8px_32px_-8px_rgba(139,92,246,0.4)] text-[15px] font-semibold transition-all duration-300" onClick={handleViewOrder}>
            <ShoppingCart className="h-5 w-5 mr-2.5" strokeWidth={1.5} />
            View Order ({totalItems} items) · £{totalAmount.toFixed(2)}
          </Button>
        </div>
      )}

      {/* Modals */}
      <FullGalleryModal images={restaurant.galleryImages} open={showFullGallery} onOpenChange={setShowFullGallery} restaurantName={restaurant.name} initialIndex={galleryIndex} />
      <AskOutaModal open={showAskOuta} onOpenChange={setShowAskOuta} restaurantName={restaurant.name} menu={restaurant.menu} onAddToOrder={handleAddToOrder} />

      <style>{`
        @keyframes pageEnter { from { opacity: 0; } to { opacity: 1; } }
        @keyframes navFloat { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bannerReveal { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }
        @keyframes titleReveal { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sectionSlide { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes actionButtonPop { from { opacity: 0; transform: translateY(8px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes recommendationReveal { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes cardPop { from { opacity: 0; transform: translateY(10px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes badgePop { from { transform: scale(0); } to { transform: scale(1); } }
        @keyframes orderBarSlide { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes logoFloat { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes glowPulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
      `}</style>

      <ReservationDialog isOpen={showReservation} onClose={() => setShowReservation(false)} restaurantId={supabaseId} restaurantName={restaurant?.name} restaurantAddress={restaurant?.address} />
    </div>
  );
};

export default RestaurantProfile;
