import { useNavigate } from "react-router-dom";
import { 
  Sparkles, MapPin, UtensilsCrossed, Bookmark, Settings, ChevronRight,
  Heart, Users, TrendingUp, Globe, Star, Wand2
} from "lucide-react";

const Services = () => {
  const navigate = useNavigate();

  // Hero services with enhanced premium presence
  const heroServices = [
    {
      icon: Sparkles,
      title: "Ask Outa",
      subtitle: "Your AI dining companion",
      description: "Get personalized recommendations instantly",
      route: "/ai-assistant",
      gradient: "from-purple/12 via-purple/8 to-neon-pink/6",
      iconBg: "from-purple/20 to-neon-pink/15",
    },
    {
      icon: MapPin,
      title: "Your Next Spot",
      subtitle: "A personalized pick, just for you",
      description: "Curated based on your taste profile",
      route: "/your-next-spot",
      gradient: "from-neon-blue/10 via-purple/6 to-purple/4",
      iconBg: "from-neon-blue/18 to-purple/12",
    },
  ];

  const services = [
    {
      icon: UtensilsCrossed,
      title: "Discover Restaurants",
      subtitle: "Explore new favourites near you",
      route: "/discover",
    },
    {
      icon: Star,
      title: "Explore Menus",
      subtitle: "Browse menus, galleries & profiles",
      route: "/restaurant/yakoyo-demo",
    },
    {
      icon: Bookmark,
      title: "Saved Places",
      subtitle: "Your curated collection awaits",
      route: "/activity",
    },
    {
      icon: Settings,
      title: "Preferences",
      subtitle: "Help Outa understand your taste",
      route: "/account",
    },
  ];

  const curatedExperiences = [
    {
      icon: Heart,
      label: "Date Night",
      subtitle: "For just you two 💜",
      route: "/curated-experiences",
      gradient: "from-pink-50 to-purple-50/60",
    },
    {
      icon: Users,
      label: "Group Vibes",
      subtitle: "Perfect nights with friends",
      route: "/curated-experiences",
      gradient: "from-blue-50/80 to-purple-50/50",
    },
    {
      icon: TrendingUp,
      label: "Trending Now",
      subtitle: "Everyone's talking about these",
      route: "/curated-experiences",
      gradient: "from-amber-50/70 to-orange-50/40",
    },
    {
      icon: Globe,
      label: "World Flavors",
      subtitle: "Explore global cuisines",
      route: "/curated-experiences",
      gradient: "from-emerald-50/70 to-teal-50/40",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      <div className="px-4 pb-28">
        {/* Premium Header */}
        <div 
          className="pt-8 pb-8 animate-[headerFade_0.4s_ease-out_forwards]"
          style={{ opacity: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple/15 to-neon-pink/10 flex items-center justify-center shadow-[0_4px_12px_-4px_rgba(139,92,246,0.2),inset_0_1px_2px_rgba(255,255,255,0.8)]">
                <Wand2 className="h-4.5 w-4.5 text-purple animate-[sparkle_2s_ease-in-out_infinite]" strokeWidth={1.5} />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-neon-pink to-purple animate-[pulse_2s_ease-in-out_infinite]" />
            </div>
            <h1 className="text-[22px] font-semibold text-foreground tracking-tight">
              Services
            </h1>
          </div>
          <p className="text-[13px] text-muted-foreground/55 mt-2 ml-12 font-light tracking-wide leading-relaxed">
            Everything Outa offers, beautifully organized for you.
          </p>
        </div>

        {/* Hero Cards - Ask Outa & Your Next Spot */}
        <div className="space-y-3 mb-8">
          {heroServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <button
                key={service.title}
                onClick={() => navigate(service.route)}
                className={`w-full relative overflow-hidden flex items-center gap-4 p-5 bg-gradient-to-br ${service.gradient} border border-purple/10 rounded-[24px] shadow-[0_8px_32px_-8px_rgba(139,92,246,0.12),0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_-8px_rgba(139,92,246,0.22),0_4px_12px_rgba(139,92,246,0.08)] hover:border-purple/20 hover:scale-[1.015] transition-all duration-300 active:scale-[0.98] group animate-[heroSlideUp_0.45s_ease-out_forwards]`}
                style={{ 
                  opacity: 0,
                  animationDelay: `${100 + index * 100}ms`
                }}
              >
                {/* Glassmorphic overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/40 to-transparent pointer-events-none" />
                
                {/* Premium icon capsule */}
                <div 
                  className={`relative flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${service.iconBg} backdrop-blur-sm flex items-center justify-center shadow-[0_4px_16px_-4px_rgba(139,92,246,0.25),inset_0_2px_4px_rgba(255,255,255,0.8)] animate-[iconFloat_0.5s_ease-out_forwards]`}
                  style={{ 
                    opacity: 0,
                    transform: 'scale(0.8) translateY(8px)',
                    animationDelay: `${200 + index * 100}ms`
                  }}
                >
                  <div className="absolute inset-0 rounded-2xl bg-white/30 backdrop-blur-sm" />
                  <Icon className="relative h-6 w-6 text-purple transition-all duration-300 group-hover:scale-110 group-hover:text-purple" strokeWidth={1.5} />
                </div>
                
                {/* Content */}
                <div className="relative flex-1 text-left">
                  <p className="text-[17px] font-semibold text-foreground tracking-tight">{service.title}</p>
                  <p className="text-[12px] text-purple/70 mt-0.5 font-medium">{service.subtitle}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1 font-light">{service.description}</p>
                </div>
                
                {/* Arrow with glow */}
                <div className="relative w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-[0_2px_8px_rgba(139,92,246,0.1)] group-hover:bg-white/80 group-hover:shadow-[0_4px_16px_rgba(139,92,246,0.18)] transition-all duration-300">
                  <ChevronRight className="h-5 w-5 text-purple/60 group-hover:text-purple group-hover:translate-x-0.5 transition-all duration-300" strokeWidth={1.5} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Other Services - Clean List */}
        <div className="mb-10">
          <h2 
            className="text-[13px] font-semibold text-muted-foreground/70 tracking-wider uppercase mb-4 ml-1 animate-[fadeSlideUp_0.3s_ease-out_forwards]"
            style={{ opacity: 0, animationDelay: '300ms' }}
          >
            Quick Access
          </h2>
          <div className="space-y-2">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <button
                  key={service.title}
                  onClick={() => navigate(service.route)}
                  className="w-full flex items-center gap-4 p-4 bg-card/90 backdrop-blur-sm border border-border/30 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_-4px_rgba(139,92,246,0.14)] hover:border-purple/20 hover:bg-card transition-all duration-250 active:scale-[0.98] group animate-[listSlideUp_0.35s_ease-out_forwards]"
                  style={{ 
                    opacity: 0,
                    animationDelay: `${350 + index * 60}ms`
                  }}
                >
                  {/* Glassmorphic icon */}
                  <div 
                    className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-purple/8 via-purple/5 to-secondary/60 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_2px_6px_-2px_rgba(139,92,246,0.1)] animate-[iconPop_0.3s_ease-out_forwards]"
                    style={{ 
                      opacity: 0,
                      transform: 'scale(0.85)',
                      animationDelay: `${420 + index * 60}ms`
                    }}
                  >
                    <Icon className="h-[18px] w-[18px] text-purple/80 transition-all duration-200 group-hover:scale-110 group-hover:text-purple" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[14px] font-medium text-foreground tracking-tight">{service.title}</p>
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5 font-light">{service.subtitle}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/25 group-hover:text-purple/50 group-hover:translate-x-0.5 transition-all duration-200" strokeWidth={1.5} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Curated Experiences Preview - Magazine Style */}
        <div className="mt-8">
          <div 
            className="mb-6 animate-[fadeSlideUp_0.35s_ease-out_forwards]"
            style={{ opacity: 0, animationDelay: '550ms' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple/12 to-neon-pink/8 flex items-center justify-center shadow-[0_2px_8px_rgba(139,92,246,0.12),inset_0_1px_2px_rgba(255,255,255,0.6)]">
                  <Sparkles className="h-3.5 w-3.5 text-purple" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-[16px] font-semibold text-foreground tracking-tight">
                    Curated Experiences
                  </h2>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5 font-light">
                    Handpicked collections for every mood
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/curated-experiences')}
                className="text-[11px] font-medium text-purple/70 hover:text-purple transition-colors flex items-center gap-1"
              >
                See all
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Premium Magazine Grid */}
          <div className="grid grid-cols-2 gap-3">
            {curatedExperiences.map((experience, index) => {
              const Icon = experience.icon;
              return (
                <button
                  key={experience.label}
                  onClick={() => navigate(experience.route)}
                  className={`relative flex flex-col items-start gap-3 p-4 bg-gradient-to-br ${experience.gradient} border border-border/25 rounded-[20px] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_32px_-8px_rgba(139,92,246,0.16),0_3px_8px_rgba(139,92,246,0.06)] hover:border-purple/20 hover:scale-[1.025] transition-all duration-300 active:scale-[0.97] group animate-[magazineReveal_0.45s_ease-out_forwards]`}
                  style={{ 
                    opacity: 0,
                    animationDelay: `${620 + index * 80}ms`
                  }}
                >
                  {/* Subtle shimmer overlay */}
                  <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-white/50 via-transparent to-white/20 pointer-events-none" />
                  
                  {/* Floating icon capsule */}
                  <div 
                    className="relative w-12 h-12 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-[0_4px_12px_-4px_rgba(139,92,246,0.15),inset_0_1px_3px_rgba(255,255,255,0.9)] animate-[iconPop_0.35s_ease-out_forwards] group-hover:shadow-[0_6px_20px_-4px_rgba(139,92,246,0.25)]"
                    style={{ 
                      opacity: 0,
                      transform: 'scale(0.8)',
                      animationDelay: `${700 + index * 80}ms`
                    }}
                  >
                    <Icon className="h-5 w-5 text-purple/80 transition-all duration-300 group-hover:scale-115 group-hover:text-purple" strokeWidth={1.5} />
                  </div>
                  
                  {/* Content */}
                  <div className="relative flex flex-col items-start mt-1">
                    <span className="text-[14px] font-semibold text-foreground tracking-tight leading-tight">
                      {experience.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/55 mt-1.5 font-light tracking-wide leading-relaxed">
                      {experience.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Premium Animation Keyframes */}
      <style>{`
        @keyframes headerFade {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes heroSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes listSlideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
        
        @keyframes magazineReveal {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
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
        
        @keyframes iconFloat {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 1;
            transform: rotate(0deg);
          }
          50% {
            opacity: 0.8;
            transform: rotate(8deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.15);
          }
        }
      `}</style>
    </div>
  );
};

export default Services;
