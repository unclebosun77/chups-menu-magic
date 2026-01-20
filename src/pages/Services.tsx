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
      title: "Plan an outing",
      description: "Dates, dinners, and group plans — made simple",
      cta: "Start planning",
      route: "/outa-chat",
      primary: true,
    },
    {
      id: 'ask-outa',
      icon: <Sparkles className="w-5 h-5" />,
      title: "Ask Outa",
      description: "Personal recommendations, tailored to you",
      route: "/outa-chat",
    },
    {
      id: 'saved',
      icon: <Bookmark className="w-5 h-5" />,
      title: "Saved",
      description: "Places you don't want to forget",
      route: "/saved",
    },
    {
      id: 'explore',
      icon: <Compass className="w-5 h-5" />,
      title: "Explore",
      description: "Browse without pressure",
      route: "/discover",
    },
    {
      id: 'curated',
      icon: <Crown className="w-5 h-5" />,
      title: "Curated",
      description: "Thoughtfully picked dining ideas",
      route: "/curated",
    },
  ];

  const primaryAction = actions.find(a => a.primary);
  const secondaryActions = actions.filter(a => !a.primary);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Confident Header */}
        <div className="px-6 pt-14 pb-8">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            What's the plan?
          </h1>
        </div>

        {/* Primary Action - Plan an Outing */}
        {primaryAction && (
          <div className="px-6 mb-10">
            <button
              onClick={() => navigate(primaryAction.route)}
              className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple/90 via-purple/80 to-purple/70 p-7 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="relative z-10 flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 text-white/90">
                  {primaryAction.icon}
                </div>
                <div className="flex-1 pt-0.5">
                  <h2 className="text-xl font-semibold text-white mb-1.5">{primaryAction.title}</h2>
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    {primaryAction.description}
                  </p>
                  <div className="flex items-center gap-2 text-white/90 font-medium text-sm">
                    <span>{primaryAction.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Secondary Actions - Shortcuts */}
        <div className="px-6 pb-28">
          <div className="space-y-4">
            {secondaryActions.map((action) => (
              <button
                key={action.id}
                onClick={() => navigate(action.route)}
                className="w-full flex items-center gap-4 p-5 rounded-xl bg-card/50 border border-border/50 transition-all text-left hover:bg-card/80 active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-lg bg-purple/8 flex items-center justify-center shrink-0 text-purple/80">
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground mb-0.5">{action.title}</h4>
                  <p className="text-sm text-muted-foreground/80">{action.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Services;
