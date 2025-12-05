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
        <div className="pt-6 pb-4">
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            Services
          </h1>
          <p className="text-[13px] text-muted-foreground/70 mt-1">
            Everything Outa offers, in one place.
          </p>
        </div>

        {/* Services List */}
        <div className="space-y-2">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.title}
                onClick={() => navigate(service.route)}
                className="w-full flex items-center gap-3 p-3.5 bg-card border border-border/50 rounded-xl hover:bg-secondary/30 hover:border-purple/20 transition-all active:scale-[0.98] group"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-purple/10 flex items-center justify-center">
                  <Icon className="h-[18px] w-[18px] text-purple" strokeWidth={1.5} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-medium text-foreground">{service.title}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">{service.subtitle}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-purple/60 transition-colors" strokeWidth={1.5} />
              </button>
            );
          })}
        </div>

        {/* Curated Experiences Preview */}
        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2 tracking-tight">
              <Sparkles className="h-4 w-4 text-purple" strokeWidth={1.5} />
              Curated Experiences
            </h2>
            <p className="text-[11px] text-muted-foreground/50 mt-1">Handpicked collections for any mood</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {curatedExperiences.map((experience) => {
              const Icon = experience.icon;
              return (
                <button
                  key={experience.label}
                  onClick={() => navigate(experience.route)}
                  className="flex items-center gap-2.5 p-3 bg-card border border-border/50 rounded-xl hover:bg-secondary/30 hover:border-purple/20 transition-all active:scale-[0.98] group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-purple" strokeWidth={1.5} />
                  </div>
                  <span className="text-[12px] font-medium text-foreground text-left leading-tight">
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