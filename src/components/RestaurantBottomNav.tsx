import { ChefHat, Utensils, Calendar, BarChart3 } from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "kitchen", icon: ChefHat, label: "Kitchen", path: "/restaurant/dashboard", tab: "orders" },
  { key: "menu", icon: Utensils, label: "Menu", path: "/restaurant/dashboard", tab: "menu" },
  { key: "bookings", icon: Calendar, label: "Bookings", path: "/restaurant/dashboard", tab: "bookings" },
  { key: "insights", icon: BarChart3, label: "Insights", path: "/restaurant/dashboard", tab: "insights" },
];

const RestaurantBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "orders";

  const isOnDashboard = location.pathname.startsWith("/restaurant/dashboard");

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-lg">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = isOnDashboard && currentTab === tab.tab;

          return (
            <button
              key={tab.key}
              onClick={() => navigate(`${tab.path}?tab=${tab.tab}`)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
              <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default RestaurantBottomNav;
