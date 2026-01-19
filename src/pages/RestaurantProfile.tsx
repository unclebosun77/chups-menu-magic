import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Phone, Navigation, Sparkles, Bookmark, Star, Clock, MapPin, ChevronRight, ShoppingCart, Flame, Award, Zap, Calendar, UtensilsCrossed, MessageCircle, Info } from "lucide-react";
import { useTasteProfile } from "@/context/TasteProfileContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { demoRestaurants, DemoMenuItem, DemoRestaurant } from "@/data/demoRestaurantMenus";
import { supabase } from "@/integrations/supabase/client";
import AskOutaModal from "@/components/AskOutaModal";
import FullGalleryModal from "@/components/restaurant/FullGalleryModal";
import { MenuSection } from "@/components/restaurant/menu";
import { vibrate } from "@/utils/haptics";
import { getSupabaseId } from "@/utils/restaurantMapping";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import ReviewsSection from "@/components/ReviewsSection";

// Restaurant profile component types
type OrderItem = DemoMenuItem & { quantity: number };

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

  // Get the normalized Supabase ID
  const supabaseId = restaurantId ? getSupabaseId(restaurantId) : "";
  
  // Check if this restaurant is saved
  const isFavorite = checkIsSaved(supabaseId);

  // Load restaurant data
  useEffect(() => {
    const loadRestaurant = async () => {
      setIsLoading(true);
      
      if (!restaurantId) {
        setIsLoading(false);
        return;
      }

      // Normalize the ID - convert legacy demo IDs to Supabase UUIDs
      const supabaseId = getSupabaseId(restaurantId);
      
      // Check if we have rich demo data for this restaurant (now keyed by Supabase UUID)
      const demoData = demoRestaurants[supabaseId];
      
      // Try loading from Supabase first
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", supabaseId)
        .maybeSingle();

      if (data && !error) {
        // Merge Supabase data with rich demo data if available
        if (demoData) {
          setRestaurant({
            ...demoData,
            id: data.id, // Use Supabase UUID as canonical ID
            name: data.name || demoData.name,
            cuisine: data.cuisine_type || demoData.cuisine,
            description: data.description || demoData.description,
            logoUrl: data.logo_url || demoData.logoUrl,
            isOpen: data.is_open,
            address: data.address || demoData.address,
            city: data.city || demoData.city,
            openingHours: (data.hours as Record<string, string>) || demoData.openingHours,
          });
        } else {
          // No demo data - create from Supabase only
          setRestaurant({
            id: data.id,
            name: data.name,
            cuisine: data.cuisine_type,
            address: data.address || "",
            city: data.city || "",
            priceLevel: "££",
            description: data.description || "",
            vibe: ["Modern", "Cozy"],
            openingHours: (data.hours as Record<string, string>) || {},
            signatureDishes: [],
            logoUrl: data.logo_url || "",
            heroImage: data.logo_url || "",
            galleryImages: data.logo_url ? [data.logo_url] : [],
            galleryTheme: "light",
            rating: 4.5,
            distance: "1.0 km",
            isOpen: data.is_open,
            menu: []
          });
        }
      } else if (demoData) {
        // Fallback to demo data only if Supabase fails
        setRestaurant(demoData);
      }
      
      setIsLoading(false);
    };

    loadRestaurant();
  }, [restaurantId]);

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
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...item, quantity }];
    });
    toast({ title: `Added ${item.name} to order ✨` });
  };

  const handleViewOrder = () => {
    navigate("/order-summary", {
      state: {
        restaurantName: restaurant.name,
        restaurantId: restaurant.id,
        items: order.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          description: item.description
        }))
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

  // Get signature items for recommendation
  const signatureItems = restaurant.menu.filter(item => 
    restaurant.signatureDishes.some(sig => item.name.toLowerCase().includes(sig.toLowerCase().split(" ")[0]))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 pb-28 animate-[pageEnter_0.35s_ease-out_forwards]" style={{ opacity: 0 }}>
      {/* Hero Section with Gallery - Cinematic */}
      <div className="relative">
        {/* Top Navigation - Floating with Animation */}
        <div 
          className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center animate-[navFloat_0.4s_ease-out_forwards]"
          style={{ opacity: 0 }}
        >
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full bg-background/85 backdrop-blur-md hover:bg-background shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] border border-border/30 transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Button>
          <div className="flex gap-2.5">
            <Button 
              variant="ghost" 
              size="icon"
              disabled={isSaving}
              className={`h-10 w-10 rounded-full backdrop-blur-md shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] border border-border/30 transition-all duration-200 hover:scale-105 active:scale-95 ${
                isFavorite ? 'bg-red-50 text-red-500 border-red-200' : 'bg-background/85 hover:bg-background'
              }`}
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-5 w-5 transition-all ${isFavorite ? 'fill-current scale-110' : ''}`} strokeWidth={1.5} />
            </Button>
            {totalItems > 0 && (
              <Button 
                variant="ghost" 
                size="icon"
                className="h-10 w-10 rounded-full bg-background/85 backdrop-blur-md hover:bg-background shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] border border-border/30 relative transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={handleViewOrder}
              >
                <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
                <span className="absolute -top-1 -right-1 bg-purple text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-[badgePop_0.3s_ease-out]">
                  {totalItems}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Smart Banner - Detects Logo vs Photo */}
        {(() => {
          // Smart detection: if heroImage contains 'logo' in the URL or is same as logoUrl, treat as logo mode
          const currentImage = restaurant.galleryImages[galleryIndex] || restaurant.heroImage;
          const isLogoMode = currentImage === restaurant.logoUrl || 
            currentImage.toLowerCase().includes('logo') ||
            restaurant.galleryImages.length === 0;
          
          if (isLogoMode) {
            // Logo Mode - Centered, contained, premium presentation
            return (
              <div 
                className="relative min-h-[280px] overflow-hidden animate-[bannerReveal_0.6s_ease-out_forwards] bg-gradient-to-b from-secondary/50 via-secondary/30 to-background"
                style={{ opacity: 0 }}
              >
                {/* Decorative background pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(139,92,246,0.08),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.05),transparent_50%)]" />
                
                {/* Centered Logo Container */}
                <div className="flex flex-col items-center justify-center pt-16 pb-24 px-8">
                  <div 
                    className="w-[65%] max-w-[200px] aspect-square rounded-3xl bg-background shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12),0_4px_16px_-4px_rgba(139,92,246,0.08)] p-4 border border-border/40 transition-transform duration-500 hover:scale-105 animate-[logoFloat_0.6s_ease-out_forwards]"
                    style={{ opacity: 0, animationDelay: '150ms' }}
                  >
                    <img 
                      src={restaurant.logoUrl} 
                      alt={restaurant.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                
                {/* Restaurant Name Overlay */}
                <div 
                  className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background via-background/80 to-transparent animate-[titleReveal_0.5s_ease-out_forwards]"
                  style={{ opacity: 0, animationDelay: '250ms' }}
                >
                  <div className="flex items-end justify-between">
                    <div className="flex-1">
                      <h1 className="text-[26px] font-bold text-foreground tracking-tight leading-tight">{restaurant.name}</h1>
                      <p className="text-[14px] text-muted-foreground/70 mt-1">{restaurant.cuisine}</p>
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
          
          // Photo Mode - Cinematic hero banner
          return (
            <div 
              className="relative h-80 overflow-hidden cursor-pointer animate-[bannerReveal_0.6s_ease-out_forwards]"
              style={{ opacity: 0 }}
              onClick={() => setShowFullGallery(true)}
            >
              <img
                src={currentImage}
                alt={restaurant.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              
              {/* Gallery dots with animation */}
              {restaurant.galleryImages.length > 1 && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
                  {restaurant.galleryImages.slice(0, 5).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setGalleryIndex(idx); }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === galleryIndex ? "bg-white w-6 shadow-lg" : "bg-white/50 w-2 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Restaurant Name Overlay - Animated */}
              <div 
                className="absolute bottom-0 left-0 right-0 p-5 animate-[titleReveal_0.5s_ease-out_forwards]"
                style={{ opacity: 0, animationDelay: '200ms' }}
              >
                <div className="flex items-end gap-4">
                  {/* Logo with glow */}
                  <div className="w-16 h-16 rounded-2xl bg-background shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] p-1.5 border border-border/50 flex-shrink-0 transition-transform duration-300 hover:scale-105">
                    <img 
                      src={restaurant.logoUrl} 
                      alt={restaurant.name}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                  <div className="flex-1 pb-1">
                    <h1 className="text-[26px] font-bold text-foreground tracking-tight leading-tight">{restaurant.name}</h1>
                    <p className="text-[14px] text-muted-foreground/80 mt-0.5">{restaurant.cuisine}</p>
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

        {/* Powered by Outa tag */}
        <div 
          className="absolute bottom-2 right-4 animate-[fadeIn_0.4s_ease-out_forwards]"
          style={{ opacity: 0, animationDelay: '400ms' }}
        >
          <span className="text-[10px] text-muted-foreground/40 flex items-center gap-1">
            <Sparkles className="h-3 w-3" strokeWidth={1.5} /> Powered by Outa Intelligence
          </span>
        </div>
      </div>

      {/* Action Row - Staggered Animation */}
      <div 
        className="px-5 py-5 animate-[sectionSlide_0.45s_ease-out_forwards]"
        style={{ opacity: 0, animationDelay: '300ms' }}
      >
        <div className="flex gap-3">
          {[
            { icon: Phone, label: "Call", onClick: () => window.open(`tel:+441234567890`), variant: "outline" as const },
            { icon: Navigation, label: "Directions", onClick: () => window.open(`https://maps.google.com?q=${restaurant.address}`), variant: "outline" as const },
            { icon: Sparkles, label: "Ask Outa", onClick: () => setShowAskOuta(true), variant: "default" as const },
          ].map((action, index) => (
            <Button
              key={action.label}
              variant={action.variant}
              className={`flex-1 h-12 rounded-2xl text-[13px] font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] animate-[actionButtonPop_0.35s_ease-out_forwards] ${
                action.variant === "default" 
                  ? "bg-purple hover:bg-purple/90 text-white shadow-[0_4px_16px_-4px_rgba(139,92,246,0.4)]" 
                  : "border-border/40 hover:bg-secondary/60 hover:border-purple/20"
              }`}
              style={{ opacity: 0, animationDelay: `${350 + index * 80}ms` }}
              onClick={action.onClick}
            >
              <action.icon className={`h-4 w-4 mr-2 ${action.variant === "default" ? "" : "text-purple"}`} strokeWidth={1.5} />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Gallery Carousel - Animated */}
      {restaurant.galleryImages.length > 1 && (
        <div 
          className="px-5 pb-5 animate-[sectionSlide_0.45s_ease-out_forwards]"
          style={{ opacity: 0, animationDelay: '450ms' }}
        >
          <ScrollArea className="w-full">
            <div className="flex gap-2.5 pb-2">
              {restaurant.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setGalleryIndex(idx); setShowFullGallery(true); }}
                  className={`flex-shrink-0 w-22 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                    idx === galleryIndex ? "border-purple shadow-[0_4px_12px_-4px_rgba(139,92,246,0.3)]" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  style={{ 
                    animationDelay: `${500 + idx * 50}ms`
                  }}
                >
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* Vibe Tags & Price - Animated */}
      <div 
        className="px-5 pb-5 animate-[sectionSlide_0.4s_ease-out_forwards]"
        style={{ opacity: 0, animationDelay: '520ms' }}
      >
        <div className="flex flex-wrap gap-2 items-center">
          {restaurant.vibe.map((tag, idx) => (
            <Badge 
              key={idx} 
              variant="secondary" 
              className="text-[11px] bg-secondary/60 text-muted-foreground border-0 rounded-full px-3.5 py-1.5 font-medium shadow-sm transition-all duration-200 hover:bg-secondary/80 hover:scale-105"
              style={{ animationDelay: `${560 + idx * 40}ms` }}
            >
              {tag}
            </Badge>
          ))}
          <Badge 
            variant="outline" 
            className="text-[11px] border-border/50 rounded-full px-3.5 py-1.5 font-medium"
          >
            {restaurant.priceLevel}
          </Badge>
        </div>
      </div>

      {/* Description - Premium Typography */}
      <div 
        className="px-5 pb-5 animate-[sectionSlide_0.4s_ease-out_forwards]"
        style={{ opacity: 0, animationDelay: '580ms' }}
      >
        <p className="text-[14px] text-muted-foreground/75 leading-relaxed font-light">
          {restaurant.description}
        </p>
      </div>

      {/* Outa Intelligence Recommendation - Dynamic Premium Card */}
      {(() => {
        // Dynamic recommendation logic
        const cuisineMatch = restaurant.cuisine;
        const priceMatch = restaurant.priceLevel === "£" || restaurant.priceLevel === "££";
        const hasSignature = signatureItems.length > 0;
        
        // Dynamic mood chips based on restaurant vibe
        const moodChips = [
          ...(restaurant.vibe.includes("Romantic") || restaurant.vibe.includes("Elegant") ? [{ label: "Date Night", icon: Heart }] : []),
          ...(restaurant.vibe.includes("Cozy") || restaurant.vibe.includes("Warm") ? [{ label: "Cozy Vibes", icon: Flame }] : []),
          ...(priceMatch ? [{ label: "Great Value", icon: Zap }] : []),
          ...(restaurant.rating >= 4.5 ? [{ label: "Top Rated", icon: Award }] : []),
          ...(!restaurant.vibe.includes("Romantic") && !restaurant.vibe.includes("Cozy") ? [{ label: "Perfect Tonight", icon: Star }] : []),
        ].slice(0, 3);
        
        // Dynamic microcopy based on context
        const getMicrocopy = () => {
          if (hasSignature) {
            return {
              headline: "We think you'll love this",
              body: (
                <>
                  The <span className="font-semibold text-purple">{signatureItems[0]?.name}</span> is their signature — perfectly crafted and matches your taste.
                </>
              )
            };
          }
          if (cuisineMatch.toLowerCase().includes("italian")) {
            return {
              headline: "Perfect for your Italian cravings",
              body: "This spot delivers authentic flavors you've been searching for."
            };
          }
          if (cuisineMatch.toLowerCase().includes("afro") || cuisineMatch.toLowerCase().includes("nigerian")) {
            return {
              headline: "A match for your bold taste",
              body: "Rich, bold flavors that match your preference for authentic cuisine."
            };
          }
          return {
            headline: "This spot matches your vibe",
            body: (
              <>
                Based on your taste, you'll love their <span className="font-semibold text-purple">{cuisineMatch}</span> dishes.
              </>
            )
          };
        };
        
        const copy = getMicrocopy();
        
        return (
          <div 
            className="px-5 pb-6 mt-1 animate-[recommendationReveal_0.5s_ease-out_forwards]"
            style={{ opacity: 0, animationDelay: '650ms' }}
          >
            {/* Section divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mb-6" />
            
            <Card className="border-purple/15 bg-gradient-to-br from-purple/[0.07] via-purple/[0.04] to-neon-pink/[0.03] shadow-[0_6px_24px_-8px_rgba(139,92,246,0.18)] overflow-hidden transition-all duration-300 hover:shadow-[0_10px_36px_-10px_rgba(139,92,246,0.25)] hover:scale-[1.01] active:scale-[0.99]">
              <CardContent className="p-5 relative">
                {/* Animated glow effects */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-purple/12 to-transparent rounded-full blur-2xl animate-[glowPulse_4s_ease-in-out_infinite]" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-radial from-neon-pink/8 to-transparent rounded-full blur-xl animate-[glowPulse_4s_ease-in-out_infinite_1s]" />
                
                <div className="flex items-start gap-4 relative">
                  {/* Animated icon with glow */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl bg-purple/20 blur-md animate-[iconGlow_2s_ease-in-out_infinite]" />
                    <div className="relative p-3 rounded-xl bg-gradient-to-br from-purple/20 to-purple/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_4px_12px_-4px_rgba(139,92,246,0.3)]">
                      <Sparkles className="h-5 w-5 text-purple animate-[sparkleFloat_2.5s_ease-in-out_infinite]" strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-bold text-[15px] text-foreground mb-1 tracking-tight">{copy.headline}</p>
                    <p className="text-[13px] text-muted-foreground/70 leading-relaxed">
                      {copy.body}
                    </p>
                    
                    {/* Dynamic mood chips with animations */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {moodChips.map((chip, idx) => {
                        const ChipIcon = chip.icon;
                        return (
                          <button 
                            key={idx} 
                            className="flex items-center gap-1.5 text-[10px] text-purple/90 bg-gradient-to-r from-purple/12 to-purple/8 px-3 py-1.5 rounded-full font-semibold border border-purple/15 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-purple/15 hover:border-purple/25 active:scale-95 animate-[chipReveal_0.35s_ease-out_forwards]"
                            style={{ opacity: 0, animationDelay: `${750 + idx * 80}ms` }}
                          >
                            <ChipIcon className="h-3 w-3" strokeWidth={2} />
                            {chip.label}
                          </button>
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

      {/* About Section - Animated Cards */}
      <div 
        className="px-5 pb-6 animate-[sectionSlide_0.45s_ease-out_forwards]"
        style={{ opacity: 0, animationDelay: '720ms' }}
      >
        <h2 className="text-lg font-bold mb-4 tracking-tight">About</h2>
        <div className="grid grid-cols-2 gap-3.5">
          {/* Hours Card */}
          <Card 
            className="border-border/30 shadow-[0_4px_16px_-6px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_24px_-8px_rgba(139,92,246,0.12)] transition-all duration-300 hover:scale-[1.02] animate-[cardPop_0.4s_ease-out_forwards]"
            style={{ opacity: 0, animationDelay: '780ms' }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-purple/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-purple" strokeWidth={1.5} />
                </div>
                <span className="font-semibold text-[13px]">Hours</span>
              </div>
              <div className="space-y-1.5">
                {Object.entries(restaurant.openingHours).slice(0, 3).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground/50">{day}</span>
                    <span className="font-medium text-foreground/75">{hours}</span>
                  </div>
                ))}
                {Object.keys(restaurant.openingHours).length > 3 && (
                  <button className="text-[10px] text-purple mt-2 font-medium hover:text-purple/80 transition-colors">View all hours</button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card 
            className="border-border/30 shadow-[0_4px_16px_-6px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_24px_-8px_rgba(139,92,246,0.12)] transition-all duration-300 hover:scale-[1.02] animate-[cardPop_0.4s_ease-out_forwards]"
            style={{ opacity: 0, animationDelay: '840ms' }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-purple/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-purple" strokeWidth={1.5} />
                </div>
                <span className="font-semibold text-[13px]">Location</span>
              </div>
              <p className="text-[11px] text-muted-foreground/50 mb-3 leading-relaxed">
                {restaurant.address}<br />{restaurant.city}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-[10px] h-8 rounded-xl border-border/40 hover:bg-purple/5 hover:border-purple/20 transition-all duration-200"
              >
                Get Directions
                <ChevronRight className="h-4 w-4 ml-1" strokeWidth={1.5} />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Unified Menu Section */}
      <div 
        className="animate-[sectionSlide_0.5s_ease-out_forwards]"
        style={{ opacity: 0, animationDelay: '900ms' }}
      >
        <MenuSection
          menu={restaurant.menu}
          signatureDishes={restaurant.signatureDishes}
          onAddToOrder={handleAddToOrder}
        />
      </div>

      {/* Services Section */}
      <div 
        className="px-5 pb-6 animate-[sectionSlide_0.45s_ease-out_forwards]"
        style={{ opacity: 0, animationDelay: '960ms' }}
      >
        <h2 className="text-lg font-bold mb-4 tracking-tight">Services</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: UtensilsCrossed, label: "Order Food", available: true, onClick: () => {} },
            { icon: Calendar, label: "Reserve Table", available: false },
            { icon: MessageCircle, label: "Ask Outa", available: true, onClick: () => setShowAskOuta(true) },
            { icon: Info, label: "Event Booking", available: false },
          ].map((service, idx) => (
            <button
              key={service.label}
              onClick={service.available ? service.onClick : undefined}
              disabled={!service.available}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                service.available 
                  ? "bg-card border-border/40 hover:border-purple/30 hover:shadow-sm active:scale-[0.98] cursor-pointer"
                  : "bg-secondary/30 border-border/20 cursor-not-allowed opacity-60"
              }`}
              style={{ animationDelay: `${1000 + idx * 60}ms` }}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                service.available ? "bg-purple/10 text-purple" : "bg-muted/50 text-muted-foreground"
              }`}>
                <service.icon className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div className="text-left flex-1">
                <span className={`text-[13px] font-medium ${service.available ? "text-foreground" : "text-muted-foreground"}`}>
                  {service.label}
                </span>
                {!service.available && (
                  <p className="text-[9px] text-muted-foreground/60">Coming soon</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div 
        className="px-5 pb-6 animate-[sectionSlide_0.45s_ease-out_forwards]"
        style={{ opacity: 0, animationDelay: '1020ms' }}
      >
        <h2 className="text-lg font-bold mb-4 tracking-tight">Reviews</h2>
        <ReviewsSection restaurantId={supabaseId} />
      </div>

      {/* Order Bar - Premium Floating */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border/40 p-4 z-50 animate-[orderBarSlide_0.35s_ease-out_forwards]">
          <Button 
            className="w-full bg-gradient-to-r from-purple to-purple/90 hover:from-purple/95 hover:to-purple/85 text-white h-14 rounded-2xl shadow-[0_8px_32px_-8px_rgba(139,92,246,0.4)] hover:shadow-[0_10px_40px_-8px_rgba(139,92,246,0.5)] text-[15px] font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
            onClick={handleViewOrder}
          >
            <ShoppingCart className="h-5 w-5 mr-2.5" strokeWidth={1.5} />
            View Order ({totalItems} items) · £{totalAmount.toFixed(2)}
          </Button>
        </div>
      )}

      {/* Full Gallery Modal */}
      <FullGalleryModal
        images={restaurant.galleryImages}
        open={showFullGallery}
        onOpenChange={setShowFullGallery}
        restaurantName={restaurant.name}
        initialIndex={galleryIndex}
      />

      {/* Ask Outa Modal */}
      <AskOutaModal
        open={showAskOuta}
        onOpenChange={setShowAskOuta}
        restaurantName={restaurant.name}
        menu={restaurant.menu}
        onAddToOrder={handleAddToOrder}
      />

      {/* Premium Animation Keyframes */}
      <style>{`
        @keyframes pageEnter {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes navFloat {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bannerReveal {
          from {
            opacity: 0;
            transform: scale(1.02);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes titleReveal {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes sectionSlide {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes actionButtonPop {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes recommendationReveal {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes cardPop {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes badgePop {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        
        @keyframes orderBarSlide {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes sparkleFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }
        
        @keyframes logoFloat {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
        
        @keyframes iconGlow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.15);
          }
        }
        
        @keyframes chipReveal {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default RestaurantProfile;