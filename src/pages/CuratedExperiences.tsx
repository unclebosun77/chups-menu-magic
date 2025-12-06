import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Heart, Users, TrendingUp, Star, Globe, Coffee, ChefHat, 
  Gem, Award, Wallet, ArrowLeft, Sparkles, Crown, Flame,
  Music, MapPin, ArrowRight, Utensils
} from "lucide-react";

// Import images
import yakoyoJollof from "@/assets/menu/yakoyo-jollof-rice.jpg";
import cosbyPasta from "@/assets/menu/cosby-truffle-tagliatelle.jpg";
import proxPadThai from "@/assets/menu/prox-pad-thai.jpg";
import cosbyBurrata from "@/assets/menu/cosby-burrata-tomato.jpg";
import yakoyoSuya from "@/assets/menu/yakoyo-grilled-suya.jpg";
import proxCurry from "@/assets/menu/prox-green-curry.jpg";

const CuratedExperiences = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All", icon: Sparkles },
    { id: "romantic", label: "Romantic", icon: Heart },
    { id: "nightlife", label: "Nightlife", icon: Music },
    { id: "fine-dining", label: "Fine Dining", icon: Utensils },
    { id: "budget", label: "Budget", icon: Wallet },
    { id: "groups", label: "Groups", icon: Users },
  ];

  const spotlightExperiences = [
    {
      id: "date-night",
      title: "Date Night Collection",
      subtitle: "Romantic spots for memorable evenings",
      image: cosbyBurrata,
      tags: ["Romantic", "Intimate", "Candle-lit"],
      route: "/discover?vibe=date-night",
      badge: "Most Loved",
    },
    {
      id: "trending",
      title: "Trending This Week",
      subtitle: "The spots everyone's talking about",
      image: yakoyoJollof,
      tags: ["Hot", "Popular", "Must-Try"],
      route: "/discover?sort=trending",
      badge: "Hot Now",
    },
  ];

  const collections = [
    {
      title: "Fine Dining",
      subtitle: "Elevated experiences",
      image: cosbyPasta,
      route: "/discover?vibe=fine-dining",
      icon: Crown,
    },
    {
      title: "Hidden Gems",
      subtitle: "Local secrets",
      image: proxPadThai,
      route: "/discover?vibe=hidden-gems",
      icon: Gem,
    },
    {
      title: "Group Friendly",
      subtitle: "Perfect for friends",
      image: yakoyoSuya,
      route: "/discover?vibe=groups",
      icon: Users,
    },
    {
      title: "World Flavors",
      subtitle: "Global cuisines",
      image: proxCurry,
      route: "/discover?vibe=international",
      icon: Globe,
    },
  ];

  const moreExperiences = [
    { icon: Coffee, title: "Cozy Spots", count: "12 places", route: "/discover?vibe=cozy" },
    { icon: ChefHat, title: "Chef's Table", count: "5 places", route: "/discover?vibe=chef" },
    { icon: TrendingUp, title: "Rising Stars", count: "8 places", route: "/discover?sort=new" },
    { icon: Award, title: "Award Winners", count: "6 places", route: "/discover?vibe=awarded" },
    { icon: Star, title: "Top Rated", count: "15 places", route: "/discover?sort=rating" },
    { icon: Wallet, title: "Budget Bites", count: "20+ places", route: "/discover?price=budget" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Dark Header Section */}
      <div className="relative bg-gradient-to-b from-[#0a0a0f] via-[#0f0a1a] to-background overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-purple/25 rounded-full blur-[100px]" />
          <div className="absolute top-10 right-0 w-60 h-60 bg-neon-pink/20 rounded-full blur-[80px]" />
        </div>

        <div className="relative px-4 pt-4 pb-6">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors mb-5"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-[12px] font-medium">Back</span>
          </button>

          {/* Title */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-purple" />
              <span className="text-[10px] font-semibold text-purple tracking-[0.2em] uppercase">
                Handpicked for you
              </span>
            </div>
            <h1 className="text-[28px] font-bold text-white tracking-tight">
              Curated Experiences
            </h1>
            <p className="text-[13px] text-white/50 mt-1">
              Collections designed for every mood & moment
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium whitespace-nowrap transition-all active:scale-95 ${
                  activeFilter === filter.id
                    ? "bg-purple text-white shadow-[0_4px_20px_rgba(139,92,246,0.4)]"
                    : "bg-white/10 text-white/70 border border-white/10 hover:bg-white/15"
                }`}
              >
                <filter.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spotlight Section */}
      <div className="px-4 py-6">
        <h2 className="text-[11px] font-semibold text-purple tracking-[0.15em] uppercase mb-4 flex items-center gap-2">
          <Flame className="h-3.5 w-3.5" />
          Spotlight
        </h2>

        <div className="space-y-4">
          {spotlightExperiences.map((exp) => (
            <button
              key={exp.id}
              onClick={() => navigate(exp.route)}
              className="w-full relative overflow-hidden rounded-3xl group active:scale-[0.98] transition-transform"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white tracking-wider uppercase px-2.5 py-1 rounded-full bg-purple/90 backdrop-blur-sm">
                    <Sparkles className="h-3 w-3" />
                    {exp.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-[20px] font-bold text-white mb-1">
                    {exp.title}
                  </h3>
                  <p className="text-[13px] text-white/70 mb-3">
                    {exp.subtitle}
                  </p>
                  <div className="flex gap-2">
                    {exp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium text-white/80 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Collections Grid */}
      <div className="px-4 py-6">
        <h2 className="text-[11px] font-semibold text-muted-foreground/60 tracking-[0.15em] uppercase mb-4">
          Browse Collections
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {collections.map((collection) => (
            <button
              key={collection.title}
              onClick={() => navigate(collection.route)}
              className="relative overflow-hidden rounded-2xl group active:scale-[0.97] transition-transform"
            >
              <div className="relative h-32">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Icon Badge */}
                <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-purple/80 backdrop-blur-sm flex items-center justify-center">
                  <collection.icon className="h-4 w-4 text-white" strokeWidth={1.5} />
                </div>

                {/* Text */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-[14px] font-semibold text-white">
                    {collection.title}
                  </h3>
                  <p className="text-[11px] text-white/60">
                    {collection.subtitle}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* More Experiences */}
      <div className="px-4 py-6 pb-28">
        <h2 className="text-[11px] font-semibold text-muted-foreground/60 tracking-[0.15em] uppercase mb-4">
          More to Explore
        </h2>

        <div className="grid grid-cols-2 gap-2">
          {moreExperiences.map((exp) => (
            <button
              key={exp.title}
              onClick={() => navigate(exp.route)}
              className="flex items-center gap-3 p-3.5 bg-card/50 border border-border/50 hover:border-purple/30 rounded-xl transition-all group active:scale-[0.97]"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple/15 to-transparent border border-purple/10 flex items-center justify-center flex-shrink-0">
                <exp.icon className="h-4.5 w-4.5 text-purple" strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[13px] font-medium text-foreground">
                  {exp.title}
                </p>
                <p className="text-[10px] text-muted-foreground/50">
                  {exp.count}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CuratedExperiences;