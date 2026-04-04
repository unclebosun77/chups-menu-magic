import { Compass, Sparkles, Bookmark, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { icon: Compass, label: "Discover", path: "/" },
    { icon: Bookmark, label: "Saved", path: "/saved" },
    { icon: Sparkles, label: "Ask CHUPS", path: "/outa-chat", primary: true },
    { icon: User, label: "Profile", path: "/account" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-soft backdrop-blur-lg bg-card/95">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all relative",
                tab.primary && !isActive && "text-purple",
                isActive ? "text-purple" : !tab.primary ? "text-muted-foreground hover:text-foreground" : ""
              )}
            >
              {tab.primary ? (
                <div className={cn(
                  "w-11 h-11 -mt-5 rounded-2xl flex items-center justify-center shadow-lg transition-transform",
                  isActive
                    ? "bg-purple shadow-purple/30 scale-110"
                    : "bg-purple/90 shadow-purple/20"
                )}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              ) : (
                <Icon className={cn("h-6 w-6 transition-transform", isActive && "scale-110")} />
              )}
              <span className={cn("text-[10px] font-medium", tab.primary && "-mt-0.5")}>{tab.label}</span>
              {isActive && !tab.primary && (
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
