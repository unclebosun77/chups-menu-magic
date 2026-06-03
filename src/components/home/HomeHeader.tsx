import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";
import { MapPin, Search } from "lucide-react";

const HomeHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setQuery } = useSearch();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", emoji: "☀️" };
    if (hour < 17) return { text: "Good afternoon", emoji: "🌤️" };
    return { text: "Good evening", emoji: "🌙" };
  };

  const greeting = getGreeting();
  const initial = user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="pt-5 pb-2">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        {/* Logo */}
        <span className="text-[22px] font-black tracking-[-0.5px] text-foreground">
          chups
        </span>

        {/* Location chip */}
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary border-0 text-[11px] font-medium text-muted-foreground active:scale-95 transition-transform">
          <MapPin className="h-3 w-3" />
          Birmingham
        </button>

        {/* Avatar / Sign in */}
        {user ? (
          <button
            onClick={() => navigate("/account")}
            className="w-9 h-9 rounded-full bg-purple flex items-center justify-center text-primary-foreground text-[14px] font-bold active:scale-95 transition-transform"
          >
            {initial}
          </button>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            className="text-[13px] font-semibold text-purple active:opacity-70 transition-opacity"
          >
            Sign in
          </button>
        )}
      </div>

      {/* Greeting */}
      <div>
        <h1 className="text-[26px] font-bold text-foreground leading-tight tracking-tight">
          {greeting.text} {greeting.emoji}
        </h1>
        <p className="text-[14px] text-muted-foreground font-normal mt-1">
          Where are we going tonight?
        </p>
      </div>

      {/* Search bar */}
      <button
        onClick={() => setQuery(' ')}
        className="w-full flex items-center gap-2 px-4 rounded-2xl bg-secondary/80 border-0 h-11 text-[13px] text-muted-foreground mt-4 active:scale-[0.98] transition-transform"
      >
        <Search className="h-4 w-4" />
        Search restaurants, dishes, cuisines...
      </button>
    </div>
  );
};

export default HomeHeader;
