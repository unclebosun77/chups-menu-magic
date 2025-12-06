import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, MapPin, UtensilsCrossed, Bookmark, Settings, 
  Heart, Users, TrendingUp, Globe, Star, Calendar, 
  MessageCircle, Crown, ArrowRight, Zap, Compass
} from "lucide-react";

const Services = () => {
  const navigate = useNavigate();

  const heroFeatures = [
    {
      id: "ask-outa",
      title: "Ask Outa",
      subtitle: "Your AI dining companion",
      description: "Get personalized recommendations powered by intelligence that understands your taste",
      icon: Sparkles,
      route: "/ai-assistant",
      gradient: "from-purple via-purple/80 to-neon-pink",
      size: "large",
    },
    {
      id: "next-spot",
      title: "Your Next Spot",
      subtitle: "Curated just for you",
      icon: Compass,
      route: "/your-next-spot",
      gradient: "from-neon-pink/90 to-purple",
      size: "medium",
    },
    {
      id: "chat",
      title: "Outa Chat",
      subtitle: "Conversational discovery",
      icon: MessageCircle,
      route: "/chat",
      gradient: "from-purple/80 to-purple",
      size: "medium",
    },
  ];

  const quickActions = [
    { icon: Calendar, label: "Plan Night Out", route: "/ai-assistant" },
    { icon: Users, label: "Group Dining", route: "/discover?vibe=groups" },
    { icon: Crown, label: "VIP Experiences", route: "/curated-experiences" },
    { icon: Globe, label: "Cuisines", route: "/discover" },
  ];

  const services = [
    {
      icon: UtensilsCrossed,
      title: "AI Restaurant Finder",
      description: "Discover restaurants that match your mood",
      route: "/discover",
    },
    {
      icon: Crown,
      title: "Curated Packages",
      description: "Premium experiences handpicked for you",
      route: "/curated-experiences",
    },
    {
      icon: Heart,
      title: "Date Night Planning",
      description: "Romantic spots for special moments",
      route: "/curated-experiences",
    },
    {
      icon: TrendingUp,
      title: "Trending Now",
      description: "What everyone's talking about",
      route: "/discover?sort=trending",
    },
  ];

  const bottomLinks = [
    { icon: Star, label: "Explore Menus", route: "/restaurant/yakoyo-demo" },
    { icon: Bookmark, label: "Saved Places", route: "/activity" },
    { icon: Settings, label: "Preferences", route: "/account" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Dark Hero Section */}
      <div className="relative bg-gradient-to-b from-[#0a0a0f] via-[#0f0a1a] to-background overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple/20 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-0 w-80 h-80 bg-neon-pink/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative px-4 pt-10 pb-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-purple" />
              <span className="text-[10px] font-semibold text-purple tracking-[0.2em] uppercase">
                Outa Intelligence
              </span>
            </div>
            <h1 className="text-[32px] font-bold text-white tracking-tight">
              Services
            </h1>
            <p className="text-[14px] text-white/50 mt-1 font-light">
              Everything you need, beautifully organized
            </p>
          </div>

          {/* Hero Feature Cards */}
          <div className="space-y-3">
            {/* Large Feature Card */}
            <button
              onClick={() => navigate(heroFeatures[0].route)}
              className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple/30 via-purple/20 to-neon-pink/10 border border-purple/30 p-6 text-left group active:scale-[0.98] transition-transform"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-4 right-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-purple to-neon-pink flex items-center justify-center shadow-[0_8px_32px_rgba(139,92,246,0.4)]">
                <Sparkles className="h-10 w-10 text-white" strokeWidth={1.5} />
              </div>
              
              <div className="relative pr-24">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white/80 tracking-wider uppercase mb-3 px-2.5 py-1 rounded-full bg-white/10 border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  AI Powered
                </span>
                <h2 className="text-[22px] font-bold text-white mb-1">
                  {heroFeatures[0].title}
                </h2>
                <p className="text-[13px] text-white/60 leading-relaxed">
                  {heroFeatures[0].description}
                </p>
              </div>
              
              <div className="flex items-center gap-2 mt-5 text-purple">
                <span className="text-[12px] font-semibold">Try it now</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>

            {/* Two smaller cards */}
            <div className="grid grid-cols-2 gap-3">
              {heroFeatures.slice(1).map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => navigate(feature.route)}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-4 text-left group active:scale-[0.97] transition-transform"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                    <feature.icon className="h-5 w-5 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[14px] font-semibold text-white mb-0.5">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] text-white/50">
                    {feature.subtitle}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="px-4 py-6 border-b border-border/50">
        <div className="flex justify-between">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.route)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple/15 to-purple/5 border border-purple/20 flex items-center justify-center group-hover:border-purple/40 group-active:scale-95 transition-all">
                <action.icon className="h-6 w-6 text-purple" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="px-4 py-6">
        <h2 className="text-[11px] font-semibold text-muted-foreground/60 tracking-[0.15em] uppercase mb-4">
          Dining Services
        </h2>
        
        <div className="space-y-2">
          {services.map((service, index) => (
            <button
              key={service.title}
              onClick={() => navigate(service.route)}
              className="w-full flex items-center gap-4 p-4 bg-card/50 hover:bg-card border border-border/50 hover:border-purple/30 rounded-2xl transition-all group active:scale-[0.98]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple/12 to-transparent border border-purple/10 flex items-center justify-center flex-shrink-0">
                <service.icon className="h-5 w-5 text-purple" strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px] font-medium text-foreground">
                  {service.title}
                </p>
                <p className="text-[12px] text-muted-foreground/60">
                  {service.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-purple/60 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Quick Links */}
      <div className="px-4 pb-28">
        <h2 className="text-[11px] font-semibold text-muted-foreground/60 tracking-[0.15em] uppercase mb-4">
          Quick Access
        </h2>
        
        <div className="flex gap-3">
          {bottomLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.route)}
              className="flex-1 flex flex-col items-center gap-2 p-4 bg-card/30 border border-border/40 rounded-xl hover:border-purple/30 active:scale-95 transition-all"
            >
              <link.icon className="h-5 w-5 text-purple/70" strokeWidth={1.5} />
              <span className="text-[11px] font-medium text-muted-foreground">
                {link.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;