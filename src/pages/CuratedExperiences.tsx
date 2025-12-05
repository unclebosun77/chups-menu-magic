import { useNavigate } from "react-router-dom";
import { 
  Heart, Users, TrendingUp, Star, Globe, Coffee, ChefHat, 
  Gem, Award, Wallet, ArrowLeft, Sparkles, Crown, Flame
} from "lucide-react";

const CuratedExperiences = () => {
  const navigate = useNavigate();

  // Hero spotlight cards - magazine style
  const spotlightCards = [
    {
      icon: Crown,
      badge: "Editor's Pick",
      title: "This Week's Spotlight",
      subtitle: "Outa's handpicked favourites you'll love",
      route: "/discover?sort=featured",
      gradient: "from-amber-100/90 via-orange-50/70 to-yellow-50/50",
      iconGradient: "from-amber-500/20 to-orange-500/15",
      accentColor: "text-amber-600",
    },
    {
      icon: Flame,
      badge: "Hot Right Now",
      title: "Trending Restaurants",
      subtitle: "Everyone's talking about these spots",
      route: "/discover?sort=trending",
      gradient: "from-rose-100/80 via-pink-50/60 to-purple-50/40",
      iconGradient: "from-rose-500/20 to-pink-500/15",
      accentColor: "text-rose-500",
    },
  ];

  const featuredCollections = [
    {
      icon: Heart,
      title: "Date Night Spots",
      subtitle: "For just you two 💜",
      microcopy: "Romantic vibes, intimate settings",
      route: "/discover?vibe=date-night",
      gradient: "from-pink-50/90 via-rose-50/60 to-purple-50/40",
    },
    {
      icon: TrendingUp,
      title: "Can't-Miss Menus",
      subtitle: "What's hot this week",
      microcopy: "Trending dishes & top-rated plates",
      route: "/discover?sort=trending",
      gradient: "from-violet-50/80 via-purple-50/60 to-indigo-50/40",
    },
  ];

  const allExperiences = [
    {
      icon: Users,
      title: "Group-Friendly",
      subtitle: "Perfect nights with friends",
      route: "/discover?vibe=groups",
      gradient: "from-blue-50/80 to-indigo-50/50",
    },
    {
      icon: Star,
      title: "Must-Try Menus",
      subtitle: "Exceptional flavours await",
      route: "/discover?sort=rating",
      gradient: "from-amber-50/70 to-yellow-50/40",
    },
    {
      icon: Globe,
      title: "World Flavors",
      subtitle: "Explore global cuisines",
      route: "/discover?vibe=international",
      gradient: "from-emerald-50/70 to-teal-50/40",
    },
    {
      icon: Coffee,
      title: "Cozy & Calm",
      subtitle: "Quiet retreats nearby",
      route: "/discover?vibe=cozy",
      gradient: "from-stone-50/80 to-orange-50/30",
    },
    {
      icon: ChefHat,
      title: "Chef Specials",
      subtitle: "Signature dishes to discover",
      route: "/discover?vibe=chef-special",
      gradient: "from-slate-50/80 to-gray-50/40",
    },
    {
      icon: Gem,
      title: "Hidden Gems",
      subtitle: "Local favourites uncovered",
      route: "/discover?vibe=hidden-gems",
      gradient: "from-cyan-50/70 to-sky-50/40",
    },
    {
      icon: Award,
      title: "Top Rated",
      subtitle: "Best reviewed spots",
      route: "/discover?sort=rating",
      gradient: "from-yellow-50/80 to-amber-50/40",
    },
    {
      icon: Wallet,
      title: "Budget-Friendly",
      subtitle: "Great value picks",
      route: "/discover?price=budget",
      gradient: "from-green-50/70 to-emerald-50/40",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      <div className="px-4 pb-28">
        {/* Premium Header with Parallax Feel */}
        <div className="pt-4 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-muted-foreground/50 hover:text-foreground transition-colors mb-5 -ml-1 animate-[fadeIn_0.25s_ease-out_forwards]"
            style={{ opacity: 0 }}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-[12px] font-medium">Back</span>
          </button>
          
          <div 
            className="animate-[headerReveal_0.45s_ease-out_forwards]"
            style={{ opacity: 0 }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple/15 via-purple/10 to-neon-pink/8 flex items-center justify-center shadow-[0_4px_16px_-4px_rgba(139,92,246,0.2),inset_0_2px_4px_rgba(255,255,255,0.8)]">
                  <Sparkles className="h-5 w-5 text-purple animate-[sparkleRotate_3s_ease-in-out_infinite]" strokeWidth={1.5} />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-br from-neon-pink to-purple animate-[pulseGlow_2s_ease-in-out_infinite]" />
              </div>
              <div className="flex-1">
                <h1 className="text-[24px] font-bold text-foreground tracking-tight leading-tight">
                  Curated Experiences
                </h1>
                <p className="text-[13px] text-muted-foreground/55 mt-1.5 font-light tracking-wide leading-relaxed">
                  Handpicked collections designed for your mood & moment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Spotlight Hero Cards */}
        <div className="mb-8">
          <h2 
            className="text-[11px] font-semibold text-muted-foreground/60 tracking-widest uppercase mb-4 ml-1 animate-[fadeSlideUp_0.35s_ease-out_forwards]"
            style={{ opacity: 0, animationDelay: '150ms' }}
          >
            ✨ Outa Spotlight
          </h2>
          
          <div className="space-y-3">
            {spotlightCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.title}
                  onClick={() => navigate(card.route)}
                  className={`w-full relative overflow-hidden flex items-center gap-4 p-5 bg-gradient-to-br ${card.gradient} border border-white/50 rounded-[24px] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_48px_-12px_rgba(139,92,246,0.18),0_4px_16px_rgba(0,0,0,0.04)] hover:scale-[1.015] transition-all duration-350 active:scale-[0.98] group animate-[spotlightReveal_0.5s_ease-out_forwards]`}
                  style={{ 
                    opacity: 0,
                    animationDelay: `${200 + index * 120}ms`
                  }}
                >
                  {/* Glassmorphic shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/30 to-transparent pointer-events-none" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-white/40 to-transparent rounded-full blur-2xl pointer-events-none" />
                  
                  {/* Large premium icon */}
                  <div 
                    className={`relative flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${card.iconGradient} backdrop-blur-sm flex items-center justify-center shadow-[0_6px_20px_-4px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.9)] animate-[iconRise_0.55s_ease-out_forwards]`}
                    style={{ 
                      opacity: 0,
                      transform: 'scale(0.85) translateY(10px)',
                      animationDelay: `${300 + index * 120}ms`
                    }}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-white/40" />
                    <Icon className={`relative h-7 w-7 ${card.accentColor} transition-all duration-300 group-hover:scale-110`} strokeWidth={1.5} />
                  </div>
                  
                  {/* Content */}
                  <div className="relative flex-1 text-left">
                    <span className={`inline-block text-[9px] font-bold ${card.accentColor} tracking-wider uppercase mb-1.5 px-2 py-0.5 rounded-full bg-white/60`}>
                      {card.badge}
                    </span>
                    <p className="text-[17px] font-bold text-foreground tracking-tight leading-tight">
                      {card.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1 font-light tracking-wide">
                      {card.subtitle}
                    </p>
                  </div>
                  
                  {/* Arrow */}
                  <div className="relative w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] group-hover:bg-white/90 transition-all duration-300">
                    <ArrowLeft className="h-4 w-4 text-foreground/50 rotate-180 group-hover:translate-x-0.5 group-hover:text-foreground/80 transition-all" strokeWidth={1.5} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Collections */}
        <div className="mb-8">
          <h2 
            className="text-[11px] font-semibold text-muted-foreground/60 tracking-widest uppercase mb-4 ml-1 animate-[fadeSlideUp_0.35s_ease-out_forwards]"
            style={{ opacity: 0, animationDelay: '450ms' }}
          >
            Featured Collections
          </h2>
          
          <div className="space-y-3">
            {featuredCollections.map((collection, index) => {
              const Icon = collection.icon;
              return (
                <button
                  key={collection.title}
                  onClick={() => navigate(collection.route)}
                  className={`w-full relative overflow-hidden flex items-center gap-4 p-5 bg-gradient-to-br ${collection.gradient} border border-white/40 rounded-[22px] shadow-[0_6px_24px_-6px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_36px_-8px_rgba(139,92,246,0.16),0_4px_10px_rgba(139,92,246,0.05)] hover:border-purple/15 hover:scale-[1.012] transition-all duration-300 active:scale-[0.98] group animate-[featuredSlide_0.45s_ease-out_forwards]`}
                  style={{ 
                    opacity: 0,
                    animationDelay: `${520 + index * 90}ms`
                  }}
                >
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/20 to-transparent pointer-events-none" />
                  
                  {/* Icon capsule */}
                  <div 
                    className="relative w-14 h-14 rounded-2xl bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-[0_4px_14px_-4px_rgba(139,92,246,0.12),inset_0_2px_4px_rgba(255,255,255,0.9)] animate-[iconPop_0.4s_ease-out_forwards]"
                    style={{ 
                      opacity: 0,
                      transform: 'scale(0.85)',
                      animationDelay: `${600 + index * 90}ms`
                    }}
                  >
                    <Icon className="h-6 w-6 text-purple/80 transition-transform duration-300 group-hover:scale-110 group-hover:text-purple" strokeWidth={1.5} />
                  </div>
                  
                  {/* Text */}
                  <div className="relative flex-1 text-left">
                    <span className="text-[16px] font-semibold text-foreground tracking-tight">
                      {collection.title}
                    </span>
                    <span className="block text-[12px] text-purple/60 mt-0.5 font-medium">
                      {collection.subtitle}
                    </span>
                    <span className="block text-[10px] text-muted-foreground/45 mt-1 font-light">
                      {collection.microcopy}
                    </span>
                  </div>
                  
                  {/* Arrow */}
                  <div className="relative w-9 h-9 rounded-full bg-purple/8 flex items-center justify-center group-hover:bg-purple/12 transition-colors">
                    <ArrowLeft className="h-4 w-4 text-purple/50 rotate-180 group-hover:translate-x-0.5 group-hover:text-purple/70 transition-all" strokeWidth={1.5} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* All Experiences - Magazine Grid */}
        <div className="mt-6">
          <h2 
            className="text-[11px] font-semibold text-muted-foreground/60 tracking-widest uppercase mb-4 ml-1 animate-[fadeSlideUp_0.35s_ease-out_forwards]"
            style={{ opacity: 0, animationDelay: '700ms' }}
          >
            Explore All
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {allExperiences.map((experience, index) => {
              const Icon = experience.icon;
              return (
                <button
                  key={experience.title}
                  onClick={() => navigate(experience.route)}
                  className={`relative flex flex-col items-start gap-3 p-4 bg-gradient-to-br ${experience.gradient} border border-white/40 rounded-[18px] shadow-[0_4px_14px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_-8px_rgba(139,92,246,0.14),0_3px_8px_rgba(139,92,246,0.04)] hover:border-purple/18 hover:scale-[1.025] transition-all duration-300 active:scale-[0.97] group animate-[gridReveal_0.4s_ease-out_forwards]`}
                  style={{ 
                    opacity: 0,
                    animationDelay: `${760 + index * 55}ms`
                  }}
                >
                  {/* Subtle shimmer */}
                  <div className="absolute inset-0 rounded-[18px] bg-gradient-to-br from-white/50 via-transparent to-white/20 pointer-events-none" />
                  
                  {/* Floating icon */}
                  <div 
                    className="relative w-11 h-11 rounded-full bg-white/75 backdrop-blur-sm flex items-center justify-center shadow-[0_3px_10px_-3px_rgba(139,92,246,0.12),inset_0_1px_2px_rgba(255,255,255,0.8)] animate-[iconPop_0.35s_ease-out_forwards] group-hover:shadow-[0_5px_16px_-4px_rgba(139,92,246,0.2)]"
                    style={{ 
                      opacity: 0,
                      transform: 'scale(0.8)',
                      animationDelay: `${830 + index * 55}ms`
                    }}
                  >
                    <Icon className="h-[18px] w-[18px] text-purple/75 transition-all duration-300 group-hover:scale-110 group-hover:text-purple" strokeWidth={1.5} />
                  </div>
                  
                  {/* Text */}
                  <div className="relative flex flex-col items-start mt-0.5">
                    <span className="text-[13px] font-semibold text-foreground tracking-tight leading-tight">
                      {experience.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 mt-1.5 font-light tracking-wide leading-relaxed">
                      {experience.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Emotional Footer */}
        <div 
          className="mt-10 text-center animate-[fadeSlideUp_0.4s_ease-out_forwards]"
          style={{ opacity: 0, animationDelay: '1200ms' }}
        >
          <p className="text-[11px] text-muted-foreground/40 font-light tracking-wide">
            Because your taste says elegance ✨
          </p>
        </div>
      </div>

      {/* Premium Animation Keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes headerReveal {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spotlightReveal {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes featuredSlide {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes gridReveal {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes iconPop {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes iconRise {
          from {
            opacity: 0;
            transform: scale(0.85) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes sparkleRotate {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(5deg) scale(1.05);
          }
          75% {
            transform: rotate(-5deg) scale(0.98);
          }
        }
        
        @keyframes pulseGlow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 8px rgba(139, 92, 246, 0.4);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.2);
            box-shadow: 0 0 16px rgba(139, 92, 246, 0.6);
          }
        }
      `}</style>
    </div>
  );
};

export default CuratedExperiences;