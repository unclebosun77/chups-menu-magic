import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Settings, Bell, Heart, HelpCircle, LogOut, User, 
  ChevronRight, Sparkles, Crown, ArrowLeft 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TasteProfileCard from "@/components/TasteProfileCard";
import TasteProfileDialog from "@/components/taste-profile/TasteProfileDialog";
import LocationPreferencesCard from "@/components/LocationPreferencesCard";

const Account = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [showTasteDialog, setShowTasteDialog] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out successfully" });
    navigate("/");
  };

  const menuItems = [
    { icon: Settings, label: "Settings", subtitle: "App preferences", action: () => {} },
    { icon: Bell, label: "Notifications", subtitle: "Alerts & updates", action: () => {} },
    { icon: Heart, label: "Favorites", subtitle: "Saved restaurants", action: () => navigate("/activity") },
    { icon: HelpCircle, label: "Help & Support", subtitle: "Get assistance", action: () => {} },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 pb-24">
        {/* Header */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Profile</h1>
              <p className="text-xs text-muted-foreground">Manage your account</p>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-4">
          {/* Sign In Card */}
          <Card className="overflow-hidden glass-card-strong animate-slide-up">
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple/20 to-neon-pink/10 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="h-10 w-10 text-purple" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Welcome to Outa</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Sign in to access your profile and personalized features
              </p>
              <Button 
                onClick={() => navigate("/auth")} 
                className="bg-gradient-to-r from-purple to-purple/90 hover:from-purple/90 hover:to-purple/80 shadow-lg shadow-purple/30"
              >
                Sign In
              </Button>
            </div>
          </Card>

          {/* Taste Profile Card - Available for all users */}
          <TasteProfileCard 
            onEditProfile={() => setShowTasteDialog(true)}
            className="animate-slide-up"
          />
        </div>

        <TasteProfileDialog 
          open={showTasteDialog} 
          onOpenChange={setShowTasteDialog} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 pb-24">
      {/* Premium Header */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple/10 via-purple/5 to-transparent" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-radial from-neon-pink/10 to-transparent rounded-full blur-3xl" />
        
        <div className="relative px-4 pt-6 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" className="rounded-full bg-background/50 backdrop-blur-sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Profile</h1>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple/15 to-neon-pink/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-purple" />
            </div>
          </div>

          {/* Profile Card */}
          <Card className="glass-card-strong animate-slide-up">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 ring-2 ring-purple/20 ring-offset-2 ring-offset-background">
                    <AvatarFallback className="text-xl bg-gradient-to-br from-purple to-neon-pink text-white font-bold">
                      {user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-purple to-neon-pink flex items-center justify-center shadow-lg">
                    <Crown className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-lg text-foreground truncate">{user.email}</h2>
                  <p className="text-sm text-purple font-medium">Outa Member</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Premium features active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Location Preferences Section */}
        <LocationPreferencesCard className="animate-slide-up" />

        {/* Taste Profile Section */}
        <TasteProfileCard 
          onEditProfile={() => setShowTasteDialog(true)}
          className="animate-slide-up"
        />

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.label}
                className="glass-card cursor-pointer hover:shadow-lg hover:border-purple/20 transition-all animate-slide-up active:scale-[0.98]"
                onClick={item.action}
                style={{ animationDelay: `${(index + 2) * 50}ms` }}
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

          {/* Sign Out */}
          <Card
            className="glass-card cursor-pointer hover:shadow-lg border-destructive/10 hover:border-destructive/20 transition-all animate-slide-up active:scale-[0.98]"
            onClick={handleSignOut}
            style={{ animationDelay: '350ms' }}
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
        </div>

        {/* Version Info */}
        <div className="text-center py-4">
          <p className="text-[10px] text-muted-foreground/40">Outa v1.0.0 • Made with ✨</p>
        </div>
      </div>

      <TasteProfileDialog 
        open={showTasteDialog} 
        onOpenChange={setShowTasteDialog} 
      />
    </div>
  );
};

export default Account;
