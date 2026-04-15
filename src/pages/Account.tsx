import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LogOut, User, Sparkles, Crown, ArrowLeft, HelpCircle, ChevronRight,
  Calendar, ShoppingBag, Gift, Heart, Settings, Bell, Shield, ChefHat,
  LayoutDashboard, Utensils, Users, Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TasteProfileCard from "@/components/TasteProfileCard";
import TasteProfileDialog from "@/components/taste-profile/TasteProfileDialog";
import LocationPreferencesCard from "@/components/LocationPreferencesCard";
import SavedRestaurantsPreview from "@/components/profile/SavedRestaurantsPreview";
import ActivitySummaryCard from "@/components/profile/ActivitySummaryCard";
import PreferencesSheet from "@/components/profile/PreferencesSheet";
import HelpSheet from "@/components/profile/HelpSheet";

const tierColors: Record<string, string> = {
  bronze: "text-amber-600",
  silver: "text-gray-400",
  gold: "text-yellow-400",
  platinum: "text-purple",
};

interface UserRestaurant {
  id: string;
  name: string;
  logo_url: string | null;
  status: string;
}

const Account = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [showTasteDialog, setShowTasteDialog] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [upcomingBookings, setUpcomingBookings] = useState(0);
  const [rewardsData, setRewardsData] = useState<{ tier: string; points_balance: number } | null>(null);
  const [userRestaurant, setUserRestaurant] = useState<UserRestaurant | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoadingRole(false);
      return;
    }
    const today = new Date().toISOString().split("T")[0];

    Promise.all([
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("booking_date", today)
        .neq("status", "cancelled"),
      supabase
        .from("rewards_accounts")
        .select("tier, points_balance")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("restaurants")
        .select("id, name, logo_url, status")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]).then(([bookingsRes, rewardsRes, restaurantRes]) => {
      setUpcomingBookings(bookingsRes.count || 0);
      setRewardsData(rewardsRes.data);
      setUserRestaurant(restaurantRes.data);
      setIsLoadingRole(false);
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out successfully" });
    navigate("/");
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const tier = rewardsData?.tier || "bronze";
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1) + " Member";
  const isRestaurantOwner = !!userRestaurant;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 pb-24">
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Profile</h1>
              <p className="text-xs text-muted-foreground">Your dining preferences</p>
            </div>
          </div>
        </div>
        <div className="px-4 space-y-4">
          <Card className="overflow-hidden glass-card-strong animate-slide-up">
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple/20 to-neon-pink/10 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="h-10 w-10 text-purple" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Welcome to Chups</h2>
              <p className="text-sm text-muted-foreground mb-6">Sign in to access your profile, saved restaurants, and personalised features</p>
              <Button onClick={() => navigate("/auth")} className="bg-gradient-to-r from-purple to-purple/90 hover:from-purple/90 hover:to-purple/80 shadow-lg shadow-purple/30">
                Sign In
              </Button>
            </div>
          </Card>
          <TasteProfileCard onEditProfile={() => setShowTasteDialog(true)} className="animate-slide-up" />
          <SavedRestaurantsPreview className="animate-slide-up" />
        </div>
        <TasteProfileDialog open={showTasteDialog} onOpenChange={setShowTasteDialog} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 pb-24">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple/10 via-purple/5 to-transparent" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-radial from-neon-pink/10 to-transparent rounded-full blur-3xl" />

        <div className="relative px-4 pt-6 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" className="rounded-full bg-background/50 backdrop-blur-sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">
                {isRestaurantOwner ? "My Restaurant" : "Your Profile"}
              </h1>
            </div>
          </div>

          {/* Back to Dashboard for restaurant owners */}
          {isRestaurantOwner && (
            <Button variant="outline" size="sm" onClick={() => navigate('/restaurant/dashboard')} className="mb-4 gap-2 animate-slide-up">
              <LayoutDashboard className="h-4 w-4" />
              Back to Dashboard
            </Button>
          )}

          {/* Profile Card */}
          <Card className="glass-card-strong animate-slide-up">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {isRestaurantOwner && userRestaurant.logo_url ? (
                    <Avatar className="h-16 w-16 ring-2 ring-purple/20 ring-offset-2 ring-offset-background">
                      <img src={userRestaurant.logo_url} alt={userRestaurant.name} className="h-full w-full object-cover" />
                    </Avatar>
                  ) : (
                    <Avatar className="h-16 w-16 ring-2 ring-purple/20 ring-offset-2 ring-offset-background">
                      <AvatarFallback className="text-xl bg-gradient-to-br from-purple to-neon-pink text-white font-bold">
                        {isRestaurantOwner ? userRestaurant.name[0].toUpperCase() : displayName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-purple to-neon-pink flex items-center justify-center shadow-lg">
                    {isRestaurantOwner ? <ChefHat className="h-3 w-3 text-white" /> : <Crown className="h-3 w-3 text-white" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-lg text-foreground truncate">
                    {isRestaurantOwner ? userRestaurant.name : displayName}
                  </h2>
                  {isRestaurantOwner ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        variant="secondary"
                        className={userRestaurant.status === "active"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }
                      >
                        {userRestaurant.status === "active" ? "Active" : "Pending"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{displayName}</span>
                    </div>
                  ) : (
                    <>
                      <p className={`text-sm font-medium ${tierColors[tier]}`}>{tierLabel}</p>
                      {rewardsData && (
                        <p className="text-xs text-muted-foreground mt-0.5">✦ {rewardsData.points_balance} pts</p>
                      )}
                    </>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/edit-profile")} className="w-full mt-3 gap-2">
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* ===== RESTAURANT OWNER PRIMARY SECTION ===== */}
        {isRestaurantOwner && (
          <>
            {/* Go to Dashboard — Primary CTA */}
            <Button
              onClick={() => navigate("/restaurant/dashboard")}
              className="w-full h-14 bg-gradient-to-r from-purple to-purple/90 hover:from-purple/90 hover:to-purple/80 text-white font-semibold text-base rounded-xl shadow-lg shadow-purple/30 animate-slide-up"
            >
              <LayoutDashboard className="h-5 w-5 mr-2" />
              Go to Dashboard
              <ChevronRight className="h-5 w-5 ml-auto" />
            </Button>

            {/* Quick Links for restaurant owners */}
            <div className="grid grid-cols-3 gap-3 animate-slide-up">
              {[
                { icon: ShoppingBag, label: "Orders", action: () => navigate("/restaurant/dashboard") },
                { icon: Utensils, label: "Menu", action: () => navigate("/restaurant/dashboard") },
                { icon: Users, label: "Crowd Level", action: () => navigate("/restaurant/dashboard") },
              ].map(({ icon: Icon, label, action }) => (
                <Card
                  key={label}
                  className="glass-card cursor-pointer hover:shadow-lg hover:border-purple/20 transition-all active:scale-[0.98]"
                  onClick={action}
                >
                  <CardContent className="flex flex-col items-center gap-2 p-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple/10 to-secondary flex items-center justify-center">
                      <Icon className="h-5 w-5 text-purple" />
                    </div>
                    <p className="font-semibold text-xs text-foreground">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* View as customer */}
            <Card
              className="glass-card cursor-pointer hover:shadow-lg hover:border-purple/20 transition-all active:scale-[0.98] animate-slide-up"
              onClick={() => navigate(`/restaurant/${userRestaurant.id}`)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple/10 to-secondary flex items-center justify-center">
                  <Eye className="h-5 w-5 text-purple" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">View as customer</p>
                  <p className="text-xs text-muted-foreground">See your restaurant profile</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
              </CardContent>
            </Card>

            {/* Separator for dining profile */}
            <div className="pt-4 pb-1">
              <h3 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-2">
                <User className="h-4 w-4" />
                Your dining profile
              </h3>
            </div>
          </>
        )}

        {/* ===== CONSUMER SECTION (shown for everyone) ===== */}
        {/* Quick Links — 2×2 */}
        <div className="grid grid-cols-2 gap-3 animate-slide-up">
          {[
            { icon: Calendar, label: "My Bookings", path: "/bookings", badge: upcomingBookings },
            { icon: ShoppingBag, label: "My Orders", path: "/my-orders" },
            { icon: Gift, label: "My Rewards", path: "/rewards" },
            { icon: Heart, label: "Saved Places", path: "/saved" },
          ].map(({ icon: Icon, label, path, badge }) => (
            <Card
              key={label}
              className="glass-card cursor-pointer hover:shadow-lg hover:border-purple/20 transition-all active:scale-[0.98]"
              onClick={() => navigate(path)}
            >
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple/10 to-secondary flex items-center justify-center relative">
                  <Icon className="h-5 w-5 text-purple" />
                  {badge ? (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple text-white text-[10px] font-bold flex items-center justify-center">
                      {badge}
                    </span>
                  ) : null}
                </div>
                <p className="font-semibold text-sm text-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Location Preferences */}
        <LocationPreferencesCard className="animate-slide-up" />

        {/* Taste Profile */}
        <TasteProfileCard onEditProfile={() => setShowTasteDialog(true)} className="animate-slide-up" />

        {/* Saved Restaurants Preview */}
        <SavedRestaurantsPreview className="animate-slide-up" />

        {/* Activity Summary */}
        <ActivitySummaryCard className="animate-slide-up" />

        {/* Settings */}
        <div className="pt-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Settings</h3>
          <div className="space-y-2">
            {[
              { icon: Settings, label: "Preferences", subtitle: "App customisation", action: () => setShowPreferences(true) },
              { icon: Bell, label: "Notifications", subtitle: "Alerts & updates", action: () => setShowPreferences(true) },
              { icon: Shield, label: "Privacy & Security", subtitle: "Account protection", comingSoon: true },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.label}
                  className={`glass-card transition-all ${item.comingSoon ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-lg hover:border-purple/20 active:scale-[0.98]"}`}
                  onClick={item.comingSoon ? undefined : item.action}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple/10 to-secondary flex items-center justify-center">
                      <Icon className="h-5 w-5 text-purple" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Help & Support */}
        <Card
          className="glass-card cursor-pointer hover:shadow-lg hover:border-purple/20 transition-all animate-slide-up active:scale-[0.98]"
          onClick={() => setShowHelp(true)}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple/10 to-secondary flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-purple" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Help & Support</p>
              <p className="text-xs text-muted-foreground">FAQs & assistance</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card
          className="glass-card cursor-pointer hover:shadow-lg border-destructive/10 hover:border-destructive/20 transition-all animate-slide-up active:scale-[0.98]"
          onClick={handleSignOut}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-destructive">Sign Out</p>
              <p className="text-xs text-muted-foreground">Log out of your account</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-4">
          <p className="text-[10px] text-muted-foreground/40">Chups v1.0.0 • Made with ✨</p>
        </div>
      </div>

      <TasteProfileDialog open={showTasteDialog} onOpenChange={setShowTasteDialog} />
      <PreferencesSheet open={showPreferences} onOpenChange={setShowPreferences} />
      <HelpSheet open={showHelp} onOpenChange={setShowHelp} />
    </div>
  );
};

export default Account;