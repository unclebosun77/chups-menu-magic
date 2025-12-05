import { 
  Sparkles, Compass, Heart, Settings, UtensilsCrossed, MapPin,
  MessageSquare, Navigation, ChevronRight, Users, TrendingUp, Globe, Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: MessageSquare,
      title: "Ask Outa",
      description: "AI-powered dining recommendations tailored to your mood and preferences",
      route: "/ai-assistant",
      accent: "from-purple-500/20 to-violet-500/20",
    },
    {
      icon: Navigation,
      title: "Your Next Spot",
      description: "Get personalized restaurant suggestions based on your taste profile",
      route: "/your-next-spot",
      accent: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: Compass,
      title: "Discover Restaurants",
      description: "Explore curated restaurants with smart filters and AI insights",
      route: "/discover",
      accent: "from-orange-500/20 to-amber-500/20",
    },
    {
      icon: UtensilsCrossed,
      title: "Explore Menus",
      description: "Browse detailed menus with dish recommendations and pricing",
      route: "/restaurant/yakoyo",
      accent: "from-green-500/20 to-emerald-500/20",
    },
    {
      icon: Heart,
      title: "Saved Restaurants",
      description: "Access your favourite spots in one place",
      route: "/saved",
      accent: "from-pink-500/20 to-rose-500/20",
    },
    {
      icon: Settings,
      title: "Preferences",
      description: "Set your dietary preferences, cuisines, and restrictions",
      route: "/account",
      accent: "from-slate-500/20 to-gray-500/20",
    },
  ];

  const curatedExperiences = [
    {
      icon: Heart,
      title: "Date Night Spots",
      description: "Romantic restaurants perfect for two",
    },
    {
      icon: Users,
      title: "Group-Friendly",
      description: "Great for parties and gatherings",
    },
    {
      icon: TrendingUp,
      title: "Trending This Week",
      description: "What's hot right now",
    },
    {
      icon: Globe,
      title: "Around The World",
      description: "Explore global cuisines",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-purple" />
          <span className="text-xs font-medium text-purple uppercase tracking-wider">Outa Services</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">What can Outa do?</h1>
        <p className="text-muted-foreground text-sm mt-1">Discover all the ways Outa helps you dine</p>
      </div>

      {/* Services Grid */}
      <div className="px-5 space-y-3">
        {services.map((service) => (
          <button
            key={service.title}
            onClick={() => navigate(service.route)}
            className="w-full p-4 rounded-2xl bg-card border border-border hover:border-purple/40 transition-all duration-300 group text-left"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${service.accent} group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-purple transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                  {service.description}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-purple group-hover:translate-x-1 transition-all mt-1" />
            </div>
          </button>
        ))}
      </div>

      {/* Curated Experiences Preview */}
      <div className="px-5 mt-8 pb-24">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-purple" />
              <span className="text-xs font-medium text-purple uppercase tracking-wider">Collections</span>
            </div>
            <h2 className="text-lg font-bold text-foreground">Curated Experiences</h2>
          </div>
          <button
            onClick={() => navigate("/curated-experiences")}
            className="text-sm font-medium text-purple hover:text-purple-hover flex items-center gap-1 transition-colors"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {curatedExperiences.map((experience) => (
            <button
              key={experience.title}
              onClick={() => navigate("/curated-experiences")}
              className="p-4 rounded-2xl bg-card border border-border hover:border-purple/40 transition-all duration-300 group text-left"
            >
              <div className="p-2.5 rounded-xl bg-purple/10 w-fit mb-3 group-hover:scale-110 transition-transform duration-300">
                <experience.icon className="h-5 w-5 text-purple" />
              </div>
              <h3 className="font-semibold text-foreground text-sm group-hover:text-purple transition-colors">
                {experience.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {experience.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;