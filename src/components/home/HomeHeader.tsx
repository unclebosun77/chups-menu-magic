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
      <div className="flex items-center justify-between mb-4">
        {/* Logo */}
        <span className="text-[20px] font-extrabold tracking-tight text-foreground">
          chups
        </span>

        {/* Location chip */}
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary/60 border border-border/40 text-[12px] font-medium text-foreground active:scale-95 transition-transform">
          <MapPin className="h-3 w-3 text-purple" />
          Birmingham
        </button>

        {/* Avatar / Sign in */}
        {user ? (
          <button
            onClick={() => navigate("/account")}
            className="w-8 h-8 rounded-full bg-purple flex items-center justify-center text-primary-foreground text-[13px] font-bold active:scale-95 transition-transform"
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
        <h1 className="text-[22px] font-bold text-foreground leading-tight tracking-tight">
          {greeting.text} {greeting.emoji}
        </h1>
        <p className="text-[14px] text-muted-foreground mt-0.5">
          Where are we going tonight?
        </p>
      </div>

      {/* Search bar */}
      <button
        onClick={() => setQuery(' ')}
        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary/60 border border-border/40 text-[13px] text-muted-foreground mt-3 active:scale-[0.98] transition-transform"
      >
        <Search className="h-4 w-4" />
        Search restaurants, dishes, cuisines...
      </button>
    </div>
  );
};

export default HomeHeader;
