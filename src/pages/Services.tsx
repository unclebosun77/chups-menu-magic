import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { 
  Sparkles, Compass, Bookmark, Crown, Calendar, ArrowRight
} from "lucide-react";

const Services = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'plan',
      icon: <Calendar className="w-6 h-6" />,
      title: "Plan an Outing",
      description: "Organize a meal, date, or group hangout",
      route: "/outa-chat",
      primary: true,
    },
    {
      id: 'ask-outa',
      icon: <Sparkles className="w-6 h-6" />,
      title: "Ask Outa",
      description: "Get recommendations and ideas",
      route: "/outa-chat",
    },
    {
      id: 'saved',
      icon: <Bookmark className="w-6 h-6" />,
      title: "Saved Restaurants",
      description: "Restaurants you've saved",
      route: "/saved",
    },
    {
      id: 'explore',
      icon: <Compass className="w-6 h-6" />,
      title: "Explore Restaurants",
      description: "Browse places to eat",
      route: "/discover",
    },
    {
      id: 'curated',
      icon: <Crown className="w-6 h-6" />,
      title: "Curated Experiences",
      description: "Handpicked dining ideas",
      route: "/curated",
    },
  ];

  const primaryAction = actions.find(a => a.primary);
  const secondaryActions = actions.filter(a => !a.primary);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Clean Header */}
        <div className="px-6 pt-12 pb-6">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-2">
            Services
          </p>
          <h1 className="text-2xl font-bold text-foreground">
            What do you want to do?
          </h1>
        </div>

        {/* Primary Action - Plan an Outing */}
        {primaryAction && (
          <div className="px-6 mb-8">
            <button
              onClick={() => navigate(primaryAction.route)}
              className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple via-purple/90 to-neon-pink p-6 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  {primaryAction.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-1">{primaryAction.title}</h2>
                  <p className="text-white/80 text-sm mb-3">
                    {primaryAction.description}
                  </p>
                  <div className="flex items-center gap-2 text-white font-medium text-sm">
                    <span>Get started</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
              {/* Decorative glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            </button>
          </div>
        )}

        {/* Secondary Actions */}
        <div className="px-6 pb-24">
          <div className="space-y-3">
            {secondaryActions.map((action) => (
              <button
                key={action.id}
                onClick={() => navigate(action.route)}
                className="w-full flex items-center gap-4 p-5 rounded-2xl bg-card border border-border transition-all text-left hover:border-purple/30 hover:bg-card/80 active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-xl bg-purple/10 flex items-center justify-center shrink-0 text-purple">
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground mb-0.5">{action.title}</h4>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Services;
