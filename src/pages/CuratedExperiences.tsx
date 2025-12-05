import { useNavigate } from "react-router-dom";
import { 
  Heart, Users, TrendingUp, Star, Globe, Coffee, ChefHat, 
  Gem, Award, Wallet, ArrowLeft, Sparkles
} from "lucide-react";

const CuratedExperiences = () => {
  const navigate = useNavigate();

  const featuredCollections = [
    {
      icon: Heart,
      title: "Date Night Spots",
      subtitle: "Romantic vibes",
      route: "/discover?vibe=date-night",
      featured: true,
    },
    {
      icon: TrendingUp,
      title: "Trending This Week",
      subtitle: "What's hot right now",
      route: "/discover?sort=trending",
      featured: true,
    },
  ];

  const allExperiences = [
    {
      icon: Users,
      title: "Group-Friendly",
      subtitle: "Perfect for friends",
      route: "/discover?vibe=groups",
    },
    {
      icon: Star,
      title: "Must-Try Menus",
      subtitle: "Exceptional flavors",
      route: "/discover?sort=rating",
    },
    {
      icon: Globe,
      title: "Around the World",
      subtitle: "Global cuisines",
      route: "/discover?vibe=international",
    },
    {
      icon: Coffee,
      title: "Cozy & Calm",
      subtitle: "Quiet retreats",
      route: "/discover?vibe=cozy",
    },
    {
      icon: ChefHat,
      title: "Chef Specials",
      subtitle: "Signature dishes",
      route: "/discover?vibe=chef-special",
    },
    {
      icon: Gem,
      title: "Hidden Gems",
      subtitle: "Local favorites",
      route: "/discover?vibe=hidden-gems",
    },
    {
      icon: Award,
      title: "Top Rated",
      subtitle: "Best reviewed",
      route: "/discover?sort=rating",
    },
    {
      icon: Wallet,
      title: "Budget-Friendly",
      subtitle: "Great value picks",
      route: "/discover?price=budget",
    },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <div className="px-4 pb-28">
        {/* Header */}
        <div className="pt-4 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-muted-foreground/60 hover:text-foreground transition-colors mb-4 animate-[fadeIn_0.2s_ease-out_forwards]"
            style={{ opacity: 0 }}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-[13px] font-medium">Back</span>
          </button>
          
          <div 
            className="animate-[fadeSlideUp_0.3s_ease-out_forwards]"
            style={{ opacity: 0, animationDelay: '50ms' }}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple/10 to-purple/20 flex items-center justify-center shadow-[0_2px_6px_rgba(139,92,246,0.1)]">
                <Sparkles className="h-4 w-4 text-purple" strokeWidth={1.5} />
              </div>
              <h1 className="text-[22px] font-semibold text-foreground tracking-tight">
                Curated Experiences
              </h1>
            </div>
            <p className="text-[13px] text-muted-foreground/55 font-light ml-[38px] tracking-wide">
              Handpicked collections designed for your mood.
            </p>
          </div>
        </div>

        {/* Featured Collections */}
        <div className="mt-4">
          <h2 
            className="text-[14px] font-semibold text-foreground/80 tracking-tight mb-4 animate-[fadeSlideUp_0.3s_ease-out_forwards]"
            style={{ opacity: 0, animationDelay: '120ms' }}
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
                  className="w-full relative flex items-center gap-4 p-5 bg-gradient-to-br from-card via-card to-secondary/50 border border-border/30 rounded-[22px] shadow-[0_6px_20px_-6px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_-8px_rgba(139,92,246,0.18),0_4px_8px_rgba(139,92,246,0.06)] hover:border-purple/25 hover:scale-[1.01] transition-all duration-250 active:scale-[0.98] group animate-[fadeSlideUp_0.35s_ease-out_forwards]"
                  style={{ 
                    opacity: 0,
                    animationDelay: `${180 + index * 80}ms`
                  }}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-purple/[0.02] via-transparent to-purple/[0.05] pointer-events-none" />
                  
                  {/* Large icon capsule */}
                  <div 
                    className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple/10 via-purple/12 to-purple/18 flex items-center justify-center shadow-[0_4px_12px_-4px_rgba(139,92,246,0.15),inset_0_1px_2px_rgba(255,255,255,0.6)] animate-[iconPop_0.3s_ease-out_forwards]"
                    style={{ 
                      opacity: 0,
                      transform: 'scale(0.85)',
                      animationDelay: `${260 + index * 80}ms`
                    }}
                  >
                    <Icon className="h-6 w-6 text-purple transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
                  </div>
                  
                  {/* Text */}
                  <div className="relative flex-1 text-left">
                    <span className="text-[16px] font-semibold text-foreground tracking-tight">
                      {collection.title}
                    </span>
                    <span className="block text-[11px] text-muted-foreground/50 mt-1 font-light tracking-wide">
                      {collection.subtitle}
                    </span>
                  </div>
                  
                  {/* Arrow indicator */}
                  <div className="relative w-8 h-8 rounded-full bg-purple/8 flex items-center justify-center group-hover:bg-purple/12 transition-colors">
                    <ArrowLeft className="h-4 w-4 text-purple/60 rotate-180 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* All Experiences */}
        <div className="mt-10">
          <h2 
            className="text-[14px] font-semibold text-foreground/80 tracking-tight mb-4 animate-[fadeSlideUp_0.3s_ease-out_forwards]"
            style={{ opacity: 0, animationDelay: '350ms' }}
          >
            All Experiences
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {allExperiences.map((experience, index) => {
              const Icon = experience.icon;
              return (
                <button
                  key={experience.title}
                  onClick={() => navigate(experience.route)}
                  className="relative flex flex-col items-start gap-3 p-4 bg-gradient-to-br from-card via-card to-secondary/35 border border-border/30 rounded-[18px] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_-8px_rgba(139,92,246,0.14),0_2px_6px_rgba(139,92,246,0.05)] hover:border-purple/22 hover:scale-[1.02] transition-all duration-250 active:scale-[0.97] group animate-[tileSlideUp_0.35s_ease-out_forwards]"
                  style={{ 
                    opacity: 0,
                    animationDelay: `${420 + index * 50}ms`
                  }}
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 rounded-[18px] bg-gradient-to-br from-purple/[0.015] via-transparent to-purple/[0.035] pointer-events-none" />
                  
                  {/* Icon capsule */}
                  <div 
                    className="relative w-11 h-11 rounded-full bg-gradient-to-br from-purple/8 via-purple/10 to-purple/15 flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(139,92,246,0.12),inset_0_1px_1px_rgba(255,255,255,0.5)] animate-[iconPop_0.3s_ease-out_forwards]"
                    style={{ 
                      opacity: 0,
                      transform: 'scale(0.85)',
                      animationDelay: `${490 + index * 50}ms`
                    }}
                  >
                    <Icon className="h-[18px] w-[18px] text-purple transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
                  </div>
                  
                  {/* Text */}
                  <div className="relative flex flex-col items-start">
                    <span className="text-[13px] font-semibold text-foreground tracking-tight leading-tight">
                      {experience.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground/45 mt-1 font-light tracking-wide">
                      {experience.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes tileSlideUp {
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
            transform: scale(0.85);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default CuratedExperiences;
