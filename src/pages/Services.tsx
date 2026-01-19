import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { 
  Sparkles, Heart, Users, Crown, Utensils, 
  MessageCircle, ArrowRight 
} from "lucide-react";

const Services = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Clean Header */}
        <div className="px-6 pt-12 pb-8">
          <p className="text-xs font-medium tracking-widest text-purple uppercase mb-2">
            Outa Services
          </p>
          <h1 className="text-3xl font-bold text-foreground">
            How can we help?
          </h1>
        </div>

        {/* Primary CTA - Ask Outa */}
        <div className="px-6 mb-10">
          <button
            onClick={() => navigate('/chat')}
            className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple via-purple/90 to-neon-pink p-6 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ask Outa</h2>
              <p className="text-white/80 text-sm mb-4 max-w-[260px]">
                Your AI dining companion. Get personalized recommendations instantly.
              </p>
              <div className="flex items-center gap-2 text-white font-medium text-sm">
                <span>Start a conversation</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            {/* Decorative glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-neon-pink/30 rounded-full blur-2xl" />
          </button>
        </div>

        {/* Quick Actions - 2x2 Grid */}
        <div className="px-6 mb-10">
          <h3 className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard
              icon={<Heart className="w-5 h-5" />}
              title="Date Night"
              onClick={() => navigate('/curated-experiences')}
            />
            <QuickActionCard
              icon={<Users className="w-5 h-5" />}
              title="Group Plans"
              onClick={() => navigate('/curated-experiences')}
            />
            <QuickActionCard
              icon={<Crown className="w-5 h-5" />}
              title="VIP Access"
              onClick={() => navigate('/curated-experiences')}
            />
            <QuickActionCard
              icon={<Utensils className="w-5 h-5" />}
              title="Explore"
              onClick={() => navigate('/discover')}
            />
          </div>
        </div>

        {/* Service List */}
        <div className="px-6 pb-24">
          <h3 className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-4">
            All Services
          </h3>
          <div className="space-y-3">
            <ServiceRow
              icon={<Sparkles className="w-5 h-5 text-purple" />}
              title="AI Restaurant Finder"
              description="Discover spots that match your vibe"
              onClick={() => navigate('/chat')}
            />
            <ServiceRow
              icon={<Crown className="w-5 h-5 text-purple" />}
              title="Curated Experiences"
              description="Handpicked collections for every occasion"
              onClick={() => navigate('/curated-experiences')}
            />
            <ServiceRow
              icon={<Heart className="w-5 h-5 text-purple" />}
              title="Date Night Planning"
              description="Romantic spots for special moments"
              onClick={() => navigate('/curated-experiences')}
            />
            <ServiceRow
              icon={<Users className="w-5 h-5 text-purple" />}
              title="Group Dining"
              description="Perfect for friends and family"
              onClick={() => navigate('/curated-experiences')}
            />
            <ServiceRow
              icon={<MessageCircle className="w-5 h-5 text-purple" />}
              title="Outa Concierge"
              description="Premium support for your plans"
              onClick={() => navigate('/chat')}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

const QuickActionCard = ({ 
  icon, 
  title, 
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border transition-all hover:border-purple/30 hover:shadow-md active:scale-95"
  >
    <div className="w-11 h-11 rounded-xl bg-purple/10 flex items-center justify-center mb-3 text-purple">
      {icon}
    </div>
    <span className="text-sm font-medium text-foreground">{title}</span>
  </button>
);

const ServiceRow = ({ 
  icon, 
  title, 
  description, 
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border transition-all hover:border-purple/30 hover:shadow-md active:scale-[0.98] text-left"
  >
    <div className="w-11 h-11 rounded-xl bg-purple/10 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
  </button>
);

export default Services;
