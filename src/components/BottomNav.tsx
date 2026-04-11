import { Compass, Sparkles, Bookmark, User, ChefHat } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { savedRestaurants } = useSavedRestaurants();
  const { user } = useAuth();
  const savedCount = savedRestaurants.length;
  const [isRestaurantOwner, setIsRestaurantOwner] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsRestaurantOwner(false);
      return;
    }
    supabase
      .from("restaurants")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsRestaurantOwner(!!data);
      });
  }, [user]);

  const profileTab = isRestaurantOwner
    ? { icon: ChefHat, label: "My Restaurant", path: "/restaurant/dashboard", badge: 0 }
    : { icon: User, label: "Profile", path: "/account", badge: 0 };

  const tabs = [
    { icon: Compass, label: "Discover", path: "/", badge: 0 },
    { icon: Bookmark, label: "Saved", path: "/saved", badge: savedCount },
    { icon: Sparkles, label: "Ask CHUPS", path: "/outa-chat", primary: true, badge: 0 },
    profileTab,
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-soft backdrop-blur-lg bg-card/95">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.path === "/restaurant/dashboard"
            ? location.pathname.startsWith("/restaurant/dashboard")
            : location.pathname === tab.path;
          const isPrimary = 'primary' in tab && tab.primary;
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all relative",
                isPrimary && !isActive && "text-purple",
                isActive ? "text-purple" : !isPrimary ? "text-muted-foreground hover:text-foreground" : ""
              )}
            >
              {isPrimary ? (
                <div className={cn(
                  "w-11 h-11 -mt-5 rounded-2xl flex items-center justify-center shadow-lg transition-transform",
                  isActive
                    ? "bg-purple shadow-purple/30 scale-110"
                    : "bg-purple/90 shadow-purple/20"
                )}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              ) : (
                <div className="relative">
                  <Icon className={cn("h-6 w-6 transition-transform", isActive && "scale-110")} />
                  {tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-purple text-white text-[9px] font-bold flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
              )}
              <span className={cn("text-[10px] font-medium", isPrimary && "-mt-0.5")}>{tab.label}</span>
              {isActive && !isPrimary && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-warm rounded-full shadow-glow" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;