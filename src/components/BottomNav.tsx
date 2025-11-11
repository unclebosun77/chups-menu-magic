import { Home, Grid3x3, Activity, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Grid3x3, label: "Services", path: "/services" },
    { icon: Activity, label: "Activity", path: "/activity" },
    { icon: User, label: "Account", path: "/account" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-black/90 border-t border-white/10 z-50 shadow-premium backdrop-blur-md">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all relative group",
                isActive ? "text-purple-glow" : "text-white/60 hover:text-white/90"
              )}
            >
              <Icon className={cn("h-6 w-6 transition-all duration-300", isActive && "scale-110 drop-shadow-glow")} />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-purple to-purple-glow rounded-full shadow-premium-glow" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
