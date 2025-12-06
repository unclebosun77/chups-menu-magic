import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, MapPin, UtensilsCrossed, Bookmark, Settings, ChevronRight,
  Heart, Users, TrendingUp, Globe, Star, Wand2, Calendar, Utensils,
  MessageCircle, Crown
} from "lucide-react";
import ServiceCard from "@/components/services/ServiceCard";
import ExperienceCard from "@/components/services/ExperienceCard";

const Services = () => {
  const navigate = useNavigate();

  // Hero services - premium AI features
  const heroServices = [
    {
      icon: Sparkles,
      title: "Ask Outa",
      description: "Your AI dining companion — personalized recommendations instantly",
      route: "/ai-assistant",
      badge: "AI Powered",
    },
    {
      icon: MapPin,
      title: "Your Next Spot",
      description: "A personalized pick curated just for your taste",
      route: "/your-next-spot",
      badge: "For You",
    },
  ];

  // Main services
  const mainServices = [
    {
      icon: Calendar,
      title: "Plan a Night Out",
      description: "Let Outa plan your perfect evening",
      route: "/ai-assistant",
    },
    {
      icon: UtensilsCrossed,
      title: "AI Restaurant Finder",
      description: "Discover restaurants that match your mood",
      route: "/discover",
    },
    {
      icon: Users,
      title: "Group Dining & Splitting",
      description: "Perfect for group gatherings",
      route: "/discover?vibe=groups",
    },
    {
      icon: Crown,
      title: "Curated Dining Packages",
      description: "Premium experiences handpicked for you",
      route: "/curated-experiences",
    },
    {
      icon: MessageCircle,
      title: "Outa Concierge",
      description: "Personal dining assistant at your service",
      route: "/chat",
    },
  ];

  // Quick access services
  const quickServices = [
    {
      icon: Star,
      title: "Explore Menus",
      description: "Browse galleries & profiles",
      route: "/restaurant/yakoyo-demo",
    },
    {
      icon: Bookmark,
      title: "Saved Places",
      description: "Your curated collection",
      route: "/activity",
    },
    {
      icon: Settings,
      title: "Preferences",
      description: "Help Outa understand you",
      route: "/account",
    },
  ];

  // Curated experiences preview
  const curatedExperiences = [
    {
      icon: Heart,
      title: "Date Night",
      subtitle: "For just you two 💜",
      route: "/curated-experiences",
    },
    {
      icon: Users,
      title: "Group Vibes",
      subtitle: "Perfect with friends",
      route: "/curated-experiences",
    },
    {
      icon: TrendingUp,
      title: "Trending Now",
      subtitle: "What's hot",
      route: "/curated-experiences",
    },
    {
      icon: Globe,
      title: "World Flavors",
      subtitle: "Global cuisines",
      route: "/curated-experiences",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-purple/5">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 -left-32 w-64 h-64 bg-purple/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-neon-pink/8 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-1/4 w-48 h-48 bg-purple/5 rounded-full blur-2xl" />
      </div>

      <div className="relative px-4 pb-28">
        {/* Premium Header */}
        <div className="pt-8 pb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple/25 to-neon-pink/15 flex items-center justify-center shadow-[0_4px_20px_-4px_rgba(139,92,246,0.35),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-purple/20">
                <Wand2 className="h-5 w-5 text-purple" strokeWidth={1.5} />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-gradient-to-br from-neon-pink to-purple animate-pulse" />
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-foreground tracking-tight">
                Services
              </h1>
              <p className="text-[12px] text-muted-foreground/60 font-light tracking-wide">
                Everything Outa offers, beautifully organized
              </p>
            </div>
          </div>
        </div>

        {/* Hero Services - AI Features */}
        <section className="mb-8">
          <h2 className="text-[11px] font-semibold text-purple/70 tracking-widest uppercase mb-4 ml-1 flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            AI-Powered
          </h2>
          <div className="space-y-3">
            {heroServices.map((service, index) => (
              <ServiceCard
                key={service.title}
                icon={service.icon}
                title={service.title}
                description={service.description}
                route={service.route}
                variant="hero"
                badge={service.badge}
                delay={100 + index * 80}
              />
            ))}
          </div>
        </section>

        {/* Dining Services */}
        <section className="mb-8">
          <h2 className="text-[11px] font-semibold text-muted-foreground/60 tracking-widest uppercase mb-4 ml-1 flex items-center gap-2">
            <Utensils className="h-3 w-3" />
            Dining Services
          </h2>
          <div className="space-y-2.5">
            {mainServices.map((service, index) => (
              <ServiceCard
                key={service.title}
                icon={service.icon}
                title={service.title}
                description={service.description}
                route={service.route}
                variant="standard"
                delay={250 + index * 60}
              />
            ))}
          </div>
        </section>

        {/* Quick Access */}
        <section className="mb-8">
          <h2 className="text-[11px] font-semibold text-muted-foreground/60 tracking-widest uppercase mb-4 ml-1">
            Quick Access
          </h2>
          <div className="space-y-2">
            {quickServices.map((service, index) => (
              <ServiceCard
                key={service.title}
                icon={service.icon}
                title={service.title}
                description={service.description}
                route={service.route}
                variant="compact"
                delay={500 + index * 50}
              />
            ))}
          </div>
        </section>

        {/* Curated Experiences Preview */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple/20 to-neon-pink/10 flex items-center justify-center shadow-[0_2px_12px_rgba(139,92,246,0.2)] border border-purple/15">
                <Sparkles className="h-4 w-4 text-purple" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-[16px] font-semibold text-foreground tracking-tight">
                  Curated Experiences
                </h2>
                <p className="text-[10px] text-muted-foreground/50 font-light">
                  Handpicked collections for every mood
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/curated-experiences')}
              className="text-[11px] font-medium text-purple/70 hover:text-purple transition-colors flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple/5 hover:bg-purple/10 border border-purple/10"
            >
              See all
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>

          {/* Experience Grid */}
          <div className="grid grid-cols-2 gap-3">
            {curatedExperiences.map((experience, index) => (
              <ExperienceCard
                key={experience.title}
                icon={experience.icon}
                title={experience.title}
                subtitle={experience.subtitle}
                route={experience.route}
                variant="grid"
                delay={650 + index * 70}
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '900ms' }}>
          <p className="text-[11px] text-muted-foreground/40 font-light tracking-wide">
            Powered by Outa Intelligence ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default Services;
