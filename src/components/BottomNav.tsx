import { Compass, Sparkles, Bookmark, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type RestaurantData = { id: string; name: string; logo_url: string | null };

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { savedRestaurants } = useSavedRestaurants();
  const { user } = useAuth();
  const savedCount = savedRestaurants.length;
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null);

  useEffect(() => {
    if (!user) {
      setRestaurantData(null);
      return;
    }
    supabase
      .from("restaurants")
      .select("id, name, logo_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setRestaurantData(data);
      });
  }, [user]);

  const isRestaurantOwner = !!restaurantData;

  const restaurantLabel = restaurantData?.name
    ? restaurantData.name.slice(0, 10) + (restaurantData.name.length > 10 ? "…" : "")
    : "My Restaurant";

  const tabs = [
    { key: "discover", icon: Compass, label: "Discover", path: "/", badge: 0 },
    { key: "saved", icon: Bookmark, label: "Saved", path: "/saved", badge: savedCount },
    { key: "chat", icon: Sparkles, label: "Ask CHUPS", path: "/outa-chat", primary: true, badge: 0 },
    isRestaurantOwner
      ? { key: "restaurant", icon: null, label: restaurantLabel, path: "/restaurant/dashboard", badge: 0 }
      : { key: "profile", icon: User, label: "Profile", path: "/account", badge: 0 },
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
          const isRestaurantTab = tab.key === "restaurant";

          return (
            <button
              key={tab.key}
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
                  {Icon && <Icon className="h-5 w-5 text-white" />}
                </div>
              ) : isRestaurantTab ? (
                <div className="relative">
                  {restaurantData?.logo_url ? (
                    <img
                      src={restaurantData.logo_url}
                      alt={restaurantData.name}
                      className={cn(
                        "w-6 h-6 rounded-full object-cover border transition-transform",
                        isActive ? "border-purple scale-110" : "border-purple/30"
                      )}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.svg'; }}
                    />
                  ) : (
                    <div className={cn(
                      "w-6 h-6 rounded-full bg-purple flex items-center justify-center transition-transform",
                      isActive && "scale-110"
                    )}>
                      <span className="text-white text-[10px] font-bold">
                        {restaurantData?.name?.charAt(0)?.toUpperCase() || "R"}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  {Icon && <Icon className={cn("h-6 w-6 transition-transform", isActive && "scale-110")} />}
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
