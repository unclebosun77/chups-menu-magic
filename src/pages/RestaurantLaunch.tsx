import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Share2, Clock, ArrowRight, Check, Star, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const RestaurantLaunch = () => {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }

      const { data } = await supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!data) { navigate('/restaurant/onboarding'); return; }

      // Check if already seen
      const seen = localStorage.getItem(`chups_launch_seen_${data.id}`);
      if (seen) { navigate('/restaurant/dashboard'); return; }

      setRestaurant(data);
      setLoading(false);
    };
    load();
  }, [navigate]);

  const markSeen = () => {
    if (restaurant) localStorage.setItem(`chups_launch_seen_${restaurant.id}`, 'true');
  };

  const goToDashboard = (tab?: string) => {
    markSeen();
    navigate('/restaurant/dashboard', tab ? { state: { activeTab: tab } } : undefined);
  };

  const shareLink = () => {
    const url = `${window.location.origin}/restaurant/${restaurant.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied! 🔗');
  };

  const previewProfile = () => {
    window.open(`/restaurant/${restaurant.id}`, '_blank');
  };

  if (loading || !restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-purple/30 border-t-purple animate-spin" />
      </div>
    );
  }

  const initial = restaurant.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple/5 via-background to-background pb-28">
      {/* CSS Confetti */}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: fixed; top: -20px; z-index: 50;
          width: 10px; height: 10px; border-radius: 2px;
          animation: confetti-fall 3s ease-out forwards;
          pointer-events: none;
        }
      `}</style>
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'][i % 5],
            animationDelay: `${Math.random() * 1.5}s`,
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
          }}
        />
      ))}

      {/* Celebration Header */}
      <div className="pt-12 pb-8 px-6 text-center">
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30 animate-bounce">
          <Check className="h-10 w-10 text-white" strokeWidth={3} />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">You're live on Chups! 🎉</h1>
        <div className="flex items-center justify-center gap-3 mb-3">
          {restaurant.logo_url ? (
            <img src={restaurant.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-purple/70 flex items-center justify-center text-white font-bold text-lg">
              {initial}
            </div>
          )}
          <span className="text-2xl font-bold text-foreground">{restaurant.name}</span>
        </div>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Your restaurant is now discoverable by thousands of diners in Birmingham
        </p>
      </div>

      {/* Profile Preview Card */}
      <div className="px-5 mb-8">
        <Card className="overflow-hidden border-border/50">
          <div className="h-28 bg-gradient-to-br from-purple/20 to-secondary relative">
            {restaurant.gallery_images?.[0] && (
              <img src={(restaurant.gallery_images as any[])[0]?.url || (restaurant.gallery_images as any[])[0]} alt="" className="w-full h-full object-cover" />
            )}
            {restaurant.logo_url && (
              <img src={restaurant.logo_url} alt="" className="absolute -bottom-5 left-4 w-12 h-12 rounded-xl border-2 border-background object-cover" />
            )}
          </div>
          <div className="p-4 pt-7">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground">{restaurant.name}</h3>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-xs font-medium">5.0</span>
                <span className="text-xs text-muted-foreground">New</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <span>{restaurant.cuisine_type}</span>
              <span>·</span>
              <Badge variant="outline" className="text-[10px] h-5 border-green-500/30 text-green-600">Open</Badge>
            </div>
            <Button size="sm" variant="outline" className="w-full rounded-lg text-xs" onClick={previewProfile}>
              <ExternalLink className="h-3 w-3 mr-1.5" />
              Preview your profile
            </Button>
          </div>
        </Card>
      </div>

      {/* Next Steps */}
      <div className="px-5 space-y-3 mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Next Steps</h2>

        {/* QR Codes */}
        <Card className="p-4 flex gap-4 items-start border-border/50">
          <div className="w-11 h-11 rounded-xl bg-purple/10 flex items-center justify-center flex-shrink-0">
            <QrCode className="h-5 w-5 text-purple" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm mb-0.5">Download your table QR codes</h3>
            <p className="text-xs text-muted-foreground mb-2.5 leading-relaxed">Print and place these on your tables so customers can order directly from their seats</p>
            <Button size="sm" variant="outline" className="rounded-lg text-xs h-8" onClick={() => goToDashboard('tables')}>
              Get QR Codes
            </Button>
          </div>
        </Card>

        {/* Share */}
        <Card className="p-4 flex gap-4 items-start border-border/50">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
            <Share2 className="h-5 w-5 text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm mb-0.5">Share your restaurant</h3>
            <p className="text-xs text-muted-foreground mb-2.5 leading-relaxed">Share your Chups profile with customers on WhatsApp, Instagram or your website</p>
            <Button size="sm" variant="outline" className="rounded-lg text-xs h-8" onClick={shareLink}>
              Share link
            </Button>
          </div>
        </Card>

        {/* Live Status */}
        <Card className="p-4 flex gap-4 items-start border-border/50">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm mb-0.5">Set your live status</h3>
            <p className="text-xs text-muted-foreground mb-2.5 leading-relaxed">Let customers know when you're open and how busy you are</p>
            <Button size="sm" variant="outline" className="rounded-lg text-xs h-8" onClick={() => goToDashboard()}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50">
        <Button
          onClick={() => goToDashboard()}
          className="w-full h-13 text-base font-semibold rounded-xl bg-gradient-to-r from-purple to-purple/80 shadow-lg shadow-purple/20"
        >
          Go to my dashboard
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default RestaurantLaunch;
