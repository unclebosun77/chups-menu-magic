import { useNavigate } from "react-router-dom";
import { 
  Sparkles, MapPin, UtensilsCrossed, Bookmark, Settings, ChevronRight,
  Heart, Users, TrendingUp, Globe, Star
} from "lucide-react";

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: Sparkles,
      title: "Ask Outa",
      subtitle: "Your AI dining assistant.",
      route: "/ai-assistant",
    },
    {
      icon: MapPin,
      title: "Your Next Spot",
      subtitle: "A personalized pick chosen for you.",
      route: "/your-next-spot",
    },
    {
      icon: UtensilsCrossed,
      title: "Discover Restaurants",
      subtitle: "Explore top restaurants around you.",
      route: "/discover",
    },
    {
      icon: Star,
      title: "Explore Menus & Profiles",
      subtitle: "See menus, galleries, and restaurant details.",
      route: "/restaurant/yakoyo-demo",
    },
    {
      icon: Bookmark,
      title: "Saved Restaurants",
      subtitle: "Your favourite places in one place.",
      route: "/activity",
    },
    {
      icon: Settings,
      title: "Preferences",
      subtitle: "Tell Outa what you like.",
      route: "/account",
    },
  ];

  const curatedExperiences = [
    {
      icon: Heart,
      label: "Date Night Spots",
      subtitle: "Romantic vibes",
      route: "/curated-experiences",
    },
    {
      icon: Users,
      label: "Group-Friendly",
      subtitle: "Perfect for friends",
      route: "/curated-experiences",
    },
    {
      icon: TrendingUp,
      label: "Trending Now",
      subtitle: "What's hot this week",
      route: "/curated-experiences",
    },
    {
      icon: Globe,
      label: "World Flavors",
      subtitle: "Global cuisines",
      route: "/curated-experiences",
    },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <div className="px-4 pb-28">
        {/* Header with entrance animation */}
        <div 
          className="pt-8 pb-6 animate-[fadeSlideUp_0.25s_ease-out_forwards]"
          style={{ opacity: 0 }}
        >
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Services
          </h1>
          <p className="text-[13px] text-muted-foreground/60 mt-1.5 font-light">
            Everything Outa offers, beautifully organized.
          </p>
        </div>

        {/* Services List with staggered animations */}
        <div className="space-y-2.5">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <button
                key={service.title}
                onClick={() => navigate(service.route)}
                className="w-full flex items-center gap-4 p-4 bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_-4px_rgba(139,92,246,0.12)] hover:border-purple/25 transition-all duration-200 active:scale-[0.97] active:shadow-[0_1px_4px_-1px_rgba(0,0,0,0.06)] group animate-[fadeSlideUp_0.3s_ease-out_forwards]"
                style={{ 
                  opacity: 0,
                  animationDelay: `${80 + index * 50}ms`
                }}
              >
                <div 
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple/8 to-purple/15 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] animate-[iconPop_0.25s_ease-out_forwards]"
                  style={{ 
                    opacity: 0,
                    transform: 'scale(0.9)',
                    animationDelay: `${150 + index * 50}ms`
                  }}
                >
                  <Icon className="h-[17px] w-[17px] text-purple transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-medium text-foreground tracking-tight">{service.title}</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-0.5 font-light">{service.subtitle}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-purple/50 group-hover:translate-x-0.5 transition-all duration-200" strokeWidth={1.5} />
              </button>
            );
          })}
        </div>

        {/* Curated Experiences Preview - Premium Design */}
        <div className="mt-12">
          <div 
            className="mb-6 animate-[fadeSlideUp_0.25s_ease-out_forwards]"
            style={{ 
              opacity: 0,
              animationDelay: '400ms'
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple/10 to-purple/20 flex items-center justify-center shadow-[0_1px_3px_rgba(139,92,246,0.1)]">
                <Sparkles className="h-3.5 w-3.5 text-purple" strokeWidth={1.5} />
              </div>
              <h2 className="text-[17px] font-semibold text-foreground tracking-tight">
                Curated Experiences
              </h2>
            </div>
            <p className="text-[12px] text-muted-foreground/50 mt-2.5 ml-[34px] font-light tracking-wide">
              Handpicked collections for every mood
            </p>
          </div>

          {/* Premium Tile Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            {curatedExperiences.map((experience, index) => {
              const Icon = experience.icon;
              return (
                <button
                  key={experience.label}
                  onClick={() => navigate(experience.route)}
                  className="relative flex flex-col items-start gap-3 p-4 bg-gradient-to-br from-card via-card to-secondary/40 border border-border/30 rounded-[20px] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_-8px_rgba(139,92,246,0.15),0_2px_6px_rgba(139,92,246,0.06)] hover:border-purple/25 hover:scale-[1.02] transition-all duration-250 active:scale-[0.97] active:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] group animate-[tileSlideUp_0.35s_ease-out_forwards]"
                  style={{ 
                    opacity: 0,
                    animationDelay: `${450 + index * 70}ms`
                  }}
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-purple/[0.02] via-transparent to-purple/[0.04] pointer-events-none" />
                  
                  {/* Icon in circular capsule */}
                  <div 
                    className="relative w-11 h-11 rounded-full bg-gradient-to-br from-purple/8 via-purple/10 to-purple/16 flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(139,92,246,0.12),inset_0_1px_1px_rgba(255,255,255,0.6)] animate-[iconPop_0.3s_ease-out_forwards]"
                    style={{ 
                      opacity: 0,
                      transform: 'scale(0.85)',
                      animationDelay: `${520 + index * 70}ms`
                    }}
                  >
                    <Icon className="h-[18px] w-[18px] text-purple transition-all duration-200 group-hover:scale-110 group-hover:text-purple" strokeWidth={1.5} />
                  </div>
                  
                  {/* Text content */}
                  <div className="relative flex flex-col items-start">
                    <span className="text-[13px] font-semibold text-foreground tracking-tight leading-tight">
                      {experience.label}
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

export default Services;