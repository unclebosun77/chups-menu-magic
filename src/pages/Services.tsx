import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { 
  Sparkles, Heart, Users, Crown, Utensils, 
  MessageCircle, ArrowRight, Calendar, Bookmark, Gift, Lock
} from "lucide-react";
import { useTasteProfile } from "@/context/TasteProfileContext";
import { getServiceInfo } from "@/data/canonicalRestaurants";

const Services = () => {
  const navigate = useNavigate();
  const { profile } = useTasteProfile();

  // Handle service navigation with availability check
  const handleServiceClick = (serviceName: string) => {
    const serviceInfo = getServiceInfo(serviceName);
    if (serviceInfo.available) {
      navigate(serviceInfo.route);
    }
    // Coming soon services show a visual indicator but don't navigate
  };

  // Personalized greeting based on user profile
  const getPersonalizedGreeting = () => {
    if (profile?.cuisines && profile.cuisines.length > 0) {
      return `Let's find your next ${profile.cuisines[0]} spot`;
    }
    return "How can we help?";
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Clean Header */}
        <div className="px-6 pt-12 pb-8">
          <p className="text-xs font-medium tracking-widest text-purple uppercase mb-2">
            Outa Services
          </p>
          <h1 className="text-3xl font-bold text-foreground">
            {getPersonalizedGreeting()}
          </h1>
        </div>

        {/* Primary CTA - Ask Outa */}
        <div className="px-6 mb-10">
          <button
            onClick={() => handleServiceClick('Ask Outa')}
            className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple via-purple/90 to-neon-pink p-6 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ask Outa</h2>
              <p className="text-white/80 text-sm mb-4 max-w-[260px]">
                Your AI dining companion. Get personalized recommendations based on your taste profile.
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
              onClick={() => handleServiceClick('Date Night Planning')}
            />
            <QuickActionCard
              icon={<Users className="w-5 h-5" />}
              title="Group Plans"
              onClick={() => handleServiceClick('Group Dining')}
            />
            <QuickActionCard
              icon={<Crown className="w-5 h-5" />}
              title="VIP Access"
              comingSoon
              onClick={() => handleServiceClick('VIP Access')}
            />
            <QuickActionCard
              icon={<Utensils className="w-5 h-5" />}
              title="Explore"
              onClick={() => handleServiceClick('Explore')}
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
              onClick={() => handleServiceClick('AI Restaurant Finder')}
            />
            <ServiceRow
              icon={<Crown className="w-5 h-5 text-purple" />}
              title="Curated Experiences"
              description="Handpicked collections for every occasion"
              onClick={() => handleServiceClick('Curated Experiences')}
            />
            <ServiceRow
              icon={<Heart className="w-5 h-5 text-purple" />}
              title="Date Night Planning"
              description="Romantic spots for special moments"
              onClick={() => handleServiceClick('Date Night Planning')}
            />
            <ServiceRow
              icon={<Users className="w-5 h-5 text-purple" />}
              title="Group Dining"
              description="Perfect for friends and family"
              onClick={() => handleServiceClick('Group Dining')}
            />
            <ServiceRow
              icon={<Bookmark className="w-5 h-5 text-purple" />}
              title="Saved Restaurants"
              description="Your favorite spots in one place"
              onClick={() => handleServiceClick('Saved Restaurants')}
            />
            <ServiceRow
              icon={<Calendar className="w-5 h-5 text-purple" />}
              title="My Bookings"
              description="View and manage your reservations"
              onClick={() => handleServiceClick('My Bookings')}
            />
            <ServiceRow
              icon={<MessageCircle className="w-5 h-5 text-purple" />}
              title="Outa Concierge"
              description="Premium support for your plans"
              onClick={() => handleServiceClick('Outa Concierge')}
            />
            <ServiceRow
              icon={<Gift className="w-5 h-5 text-purple" />}
              title="Gift Cards"
              description="Share the love of great dining"
              comingSoon
              onClick={() => handleServiceClick('Gift Cards')}
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
  onClick,
  comingSoon = false,
}: { 
  icon: React.ReactNode; 
  title: string; 
  onClick: () => void;
  comingSoon?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border transition-all ${
      comingSoon 
        ? 'opacity-60' 
        : 'hover:border-purple/30 hover:shadow-md active:scale-95'
    }`}
  >
    {comingSoon && (
      <div className="absolute top-2 right-2">
        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium">
          Soon
        </span>
      </div>
    )}
    <div className={`w-11 h-11 rounded-xl ${comingSoon ? 'bg-muted' : 'bg-purple/10'} flex items-center justify-center mb-3 ${comingSoon ? 'text-muted-foreground' : 'text-purple'}`}>
      {icon}
    </div>
    <span className="text-sm font-medium text-foreground">{title}</span>
  </button>
);

const ServiceRow = ({ 
  icon, 
  title, 
  description, 
  onClick,
  comingSoon = false,
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  onClick: () => void;
  comingSoon?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border transition-all text-left ${
      comingSoon 
        ? 'opacity-60' 
        : 'hover:border-purple/30 hover:shadow-md active:scale-[0.98]'
    }`}
  >
    <div className={`w-11 h-11 rounded-xl ${comingSoon ? 'bg-muted' : 'bg-purple/10'} flex items-center justify-center shrink-0`}>
      {comingSoon ? <Lock className="w-5 h-5 text-muted-foreground" /> : icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h4 className="font-medium text-foreground">{title}</h4>
        {comingSoon && (
          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium">
            Coming Soon
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    {!comingSoon && <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />}
  </button>
);

export default Services;
