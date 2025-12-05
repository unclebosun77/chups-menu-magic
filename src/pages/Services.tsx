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
      route: "/discover?vibe=date-night",
    },
    {
      icon: Users,
      label: "Group-Friendly Places",
      route: "/discover?vibe=groups",
    },
    {
      icon: TrendingUp,
      label: "Trending This Week",
      route: "/discover?sort=trending",
    },
    {
      icon: Globe,
      label: "Around the World",
      route: "/discover?vibe=international",
    },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <div className="px-4 pb-28">
        {/* Header */}
        <div className="pt-8 pb-6">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Services
          </h1>
          <p className="text-[13px] text-muted-foreground/60 mt-1.5 font-light">
            Everything Outa offers, beautifully organized.
          </p>
        </div>

        {/* Services List */}
        <div className="space-y-2.5">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.title}
                onClick={() => navigate(service.route)}
                className="w-full flex items-center gap-4 p-4 bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_-4px_rgba(139,92,246,0.12)] hover:border-purple/25 transition-all duration-200 active:scale-[0.98] group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple/8 to-purple/15 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                  <Icon className="h-[17px] w-[17px] text-purple" strokeWidth={1.5} />
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

        {/* Curated Experiences Preview */}
        <div className="mt-10">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple/10 to-purple/20 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-purple" strokeWidth={1.5} />
              </div>
              <h2 className="text-[16px] font-semibold text-foreground tracking-tight">
                Curated Experiences
              </h2>
            </div>
            <p className="text-[11px] text-muted-foreground/50 mt-2 ml-7 font-light">
              Handpicked collections for every mood and moment.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {curatedExperiences.map((experience) => {
              const Icon = experience.icon;
              return (
                <button
                  key={experience.label}
                  onClick={() => navigate(experience.route)}
                  className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-card to-secondary/30 border border-border/40 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_-4px_rgba(139,92,246,0.1)] hover:border-purple/20 transition-all duration-200 active:scale-[0.97] group"
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-purple/6 to-purple/14 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]">
                    <Icon className="h-4 w-4 text-purple/80" strokeWidth={1.5} />
                  </div>
                  <span className="text-[12px] font-medium text-foreground/90 text-left leading-tight tracking-tight">
                    {experience.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;