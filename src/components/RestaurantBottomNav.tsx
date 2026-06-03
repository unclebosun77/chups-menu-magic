import { ChefHat, Utensils, Calendar, BarChart3, Settings } from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "kitchen", icon: ChefHat, label: "Kitchen", path: "/restaurant/dashboard", tab: "orders" },
  { key: "menu", icon: Utensils, label: "Menu", path: "/restaurant/dashboard", tab: "menu" },
  { key: "bookings", icon: Calendar, label: "Bookings", path: "/restaurant/dashboard", tab: "bookings" },
  { key: "insights", icon: BarChart3, label: "Insights", path: "/restaurant/dashboard", tab: "insights" },
  { key: "settings", icon: Settings, label: "Settings", path: "/restaurant/dashboard", tab: "settings" },
];

const RestaurantBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "orders";

  const isOnDashboard = location.pathname.startsWith("/restaurant/dashboard");

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-border/50 z-50">
      <div className="flex items-center justify-around h-[60px] max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = isOnDashboard && currentTab === tab.tab;

          return (
            <button
              key={tab.key}
              onClick={() => navigate(`${tab.path}?tab=${tab.tab}`)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all relative",
                isActive ? "text-foreground" : "text-muted-foreground/60 hover:text-foreground"
              )}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} />
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-purple mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default RestaurantBottomNav;
