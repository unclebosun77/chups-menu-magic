import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, Calendar, ChefHat, Star, Gift, 
  ArrowLeft, Package, Sparkles, Clock, Heart,
  Eye, MessageSquare, MapPin, Compass, Play,
  ArrowRight, Bookmark, Wand2
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'order' | 'booking' | 'catering' | 'reward' | 'gift_card' | 'saved' | 'viewed' | 'suggested';
  title: string;
  description: string;
  amount?: number;
  points?: number;
  status?: string;
  date: Date;
  metadata?: any;
  restaurantId?: string;
  restaurantName?: string;
}

const Activity = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { behavior } = useUserBehavior();
  const { savedRestaurants } = useSavedRestaurants();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { state: { from: location }, replace: true });
    }
  }, [user, authLoading, navigate, location]);

  useEffect(() => {
    if (user) {
      fetchAllActivities(user.id);
    }
  }, [user, behavior, savedRestaurants]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('activity-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as any;
          if (newOrder.user_id === user.id) {
            const newActivity: ActivityItem = {
              id: newOrder.id,
              type: 'order',
              title: 'Order Placed',
              description: `Order for ${newOrder.customer_name || 'customer'}`,
              amount: Number(newOrder.total),
              status: newOrder.status,
              date: new Date(newOrder.created_at),
              metadata: newOrder,
              restaurantId: newOrder.restaurant_id,
            };
            setActivities(prev => [newActivity, ...prev]);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchAllActivities = async (userId: string) => {
    try {
      const allActivities: ActivityItem[] = [];

      // Fetch orders
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      orders?.forEach((order) => {
        allActivities.push({
          id: order.id,
          type: 'order',
          title: 'Order Placed',
          description: `Order for ${order.customer_name || 'customer'}`,
          amount: Number(order.total),
          status: order.status,
          date: new Date(order.created_at),
          metadata: order,
          restaurantId: order.restaurant_id,
        });
      });

      // Fetch bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      bookings?.forEach((booking) => {
        allActivities.push({
          id: booking.id,
          type: 'booking',
          title: 'Experience Booked',
          description: `${booking.experience_name} - ${booking.party_size} guests`,
          status: booking.status,
          date: new Date(booking.created_at),
          metadata: booking,
        });
      });

      // Fetch rewards
      const { data: rewards } = await supabase
        .from("rewards_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      rewards?.forEach((txn) => {
        allActivities.push({
          id: txn.id,
          type: 'reward',
          title: txn.points > 0 ? 'Points Earned' : 'Points Redeemed',
          description: txn.description,
          points: txn.points,
          date: new Date(txn.created_at),
          metadata: txn,
        });
      });

      // Add user behavior activities (viewed restaurants)
      behavior.visitedRestaurants.forEach((visit) => {
        allActivities.push({
          id: `view-${visit.id}-${visit.timestamp}`,
          type: 'viewed',
          title: 'Recently explored',
          description: `${visit.cuisine} cuisine`,
          date: new Date(visit.timestamp),
          restaurantId: visit.id,
          restaurantName: visit.name,
        });
      });

      // Add recent searches as "suggested" activities
      behavior.recentSearches.slice(0, 5).forEach((search, index) => {
        allActivities.push({
          id: `search-${index}-${Date.now()}`,
          type: 'suggested',
          title: 'Something you looked for',
          description: `"${search}"`,
          date: new Date(Date.now() - index * 3600000), // Mock timestamps
        });
      });

      // Sort by date
      allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
      setActivities(allActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order': return ShoppingBag;
      case 'booking': return Calendar;
      case 'catering': return ChefHat;
      case 'reward': return Star;
      case 'gift_card': return Gift;
      case 'saved': return Heart;
      case 'viewed': return Compass;
      case 'suggested': return MessageSquare;
      default: return Package;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order': return 'from-blue-500/20 to-blue-500/10 text-blue-500';
      case 'booking': return 'from-purple/20 to-purple/10 text-purple';
      case 'catering': return 'from-orange-500/20 to-orange-500/10 text-orange-500';
      case 'reward': return 'from-yellow-500/20 to-yellow-500/10 text-yellow-500';
      case 'gift_card': return 'from-pink-500/20 to-pink-500/10 text-pink-500';
      case 'saved': return 'from-red-500/20 to-red-500/10 text-red-500';
      case 'viewed': return 'from-muted to-muted/50 text-muted-foreground';
      case 'suggested': return 'from-muted to-muted/50 text-muted-foreground';
      default: return 'from-muted to-muted/50 text-muted-foreground';
    }
  };

  // Categorize activities by intent level
  const highIntentActivities = activities.filter(a => 
    ['order', 'booking', 'catering', 'saved', 'reward', 'gift_card'].includes(a.type)
  );
  const lowIntentActivities = activities.filter(a => 
    ['viewed', 'suggested'].includes(a.type)
  );

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple/15 to-purple/25 flex items-center justify-center animate-pulse">
            <Sparkles className="h-5 w-5 text-purple" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect happens in useEffect, but show sign-in prompt as fallback
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 pb-24">
        <div className="px-4 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Activity</h1>
              <p className="text-xs text-muted-foreground">Your journey so far</p>
            </div>
          </div>
        </div>

        <div className="px-4">
          <Card className="p-12 text-center glass-card-strong animate-slide-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple/20 to-neon-pink/10 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-purple" />
            </div>
            <p className="text-foreground font-semibold mb-2">Sign in to view activity</p>
            <p className="text-sm text-muted-foreground mb-6">Track your plans, saves, and discoveries</p>
            <Button onClick={() => navigate("/auth", { state: { from: location } })} className="bg-purple hover:bg-purple/90">
              Sign In
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple/15 to-purple/25 flex items-center justify-center animate-pulse">
            <Sparkles className="h-5 w-5 text-purple" />
          </div>
          <p className="text-sm text-muted-foreground">Loading activity...</p>
        </div>
      </div>
    );
  }

  const hasNoActivity = activities.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="px-4 py-5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">What's on your mind?</h1>
              <p className="text-xs text-muted-foreground">Pick up where you left off</p>
            </div>
          </div>
        </div>
      </div>

      {/* In Progress Section */}
      <div className="px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Play className="h-4 w-4 text-purple" />
            <h2 className="text-sm font-semibold text-foreground tracking-wide">In progress</h2>
          </div>
          
          {/* Empty state for in progress */}
          <Card className="p-6 glass-card border-dashed border-border/50 animate-slide-up">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple/10 to-secondary flex items-center justify-center mx-auto mb-3">
                <Wand2 className="h-5 w-5 text-purple/60" />
              </div>
              <p className="text-sm text-foreground/80 mb-1">No active plans yet</p>
              <p className="text-xs text-muted-foreground mb-4">Start planning your next outing</p>
              <Button 
                onClick={() => navigate("/outa-chat")} 
                size="sm"
                className="bg-purple/90 hover:bg-purple text-primary-foreground gap-2"
              >
                Start planning
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        </div>

        {/* High Intent Actions - Saved & Committed */}
        {highIntentActivities.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-4 w-4 text-purple" />
              <h2 className="text-sm font-semibold text-foreground tracking-wide">Things you're thinking about</h2>
            </div>
            
            <div className="space-y-3">
              {highIntentActivities.slice(0, 5).map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const hasRestaurantLink = activity.restaurantId || activity.restaurantName;
                
                return (
                  <Card
                    key={activity.id}
                    className={`p-4 glass-card transition-all animate-slide-up ${
                      hasRestaurantLink ? 'hover:shadow-lg cursor-pointer active:scale-[0.98]' : ''
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => {
                      if (activity.restaurantId) {
                        navigate(`/restaurant/${activity.restaurantId}`);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getActivityColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground text-sm">{activity.title}</p>
                          {activity.status && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-secondary/50">
                              {activity.status}
                            </Badge>
                          )}
                        </div>
                        
                        {activity.restaurantName && (
                          <p className="text-sm text-purple font-medium mb-0.5">{activity.restaurantName}</p>
                        )}
                        
                        <p className="text-xs text-muted-foreground line-clamp-1">{activity.description}</p>
                        
                        {/* Connective nudge */}
                        {activity.type === 'saved' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/outa-chat");
                            }}
                            className="text-[11px] text-purple/70 hover:text-purple mt-2 flex items-center gap-1 transition-colors"
                          >
                            <Wand2 className="h-3 w-3" />
                            Turn this into a plan
                          </button>
                        )}
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        {activity.amount !== undefined && (
                          <p className="font-bold text-foreground">£{activity.amount.toFixed(2)}</p>
                        )}
                        {activity.points !== undefined && (
                          <p className={`font-bold ${activity.points > 0 ? 'text-green-500' : 'text-orange-500'}`}>
                            {activity.points > 0 ? '+' : ''}{activity.points} pts
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Low Intent - Recently Explored (visually demoted) */}
        {lowIntentActivities.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="h-3.5 w-3.5 text-muted-foreground/60" />
              <h2 className="text-xs font-medium text-muted-foreground tracking-wide">Places you checked out</h2>
            </div>
            
            <div className="space-y-2">
              {lowIntentActivities.slice(0, 4).map((activity, index) => {
                const hasRestaurantLink = activity.restaurantId || activity.restaurantName;
                
                return (
                  <div
                    key={activity.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/30 transition-all animate-slide-up ${
                      hasRestaurantLink ? 'hover:bg-secondary/50 cursor-pointer active:scale-[0.98]' : ''
                    }`}
                    style={{ animationDelay: `${200 + index * 50}ms` }}
                    onClick={() => {
                      if (activity.restaurantId) {
                        navigate(`/restaurant/${activity.restaurantId}`);
                      }
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                      <Compass className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {activity.restaurantName ? (
                        <p className="text-sm text-foreground/80 font-medium truncate">{activity.restaurantName}</p>
                      ) : (
                        <p className="text-sm text-foreground/80">{activity.description}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60">
                        {activity.date.toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Subtle action nudges */}
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/saved");
                        }}
                        className="p-1.5 rounded-md hover:bg-secondary/80 transition-colors"
                        title="Save for later"
                      >
                        <Bookmark className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-purple/60" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/outa-chat");
                        }}
                        className="p-1.5 rounded-md hover:bg-secondary/80 transition-colors"
                        title="Ask Outa about this"
                      >
                        <Wand2 className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-purple/60" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {hasNoActivity && (
          <Card className="p-10 text-center glass-card animate-slide-up mt-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple/10 to-secondary flex items-center justify-center mx-auto mb-4">
              <Compass className="h-6 w-6 text-purple/50" />
            </div>
            <p className="text-foreground font-medium mb-2">Nothing here yet</p>
            <p className="text-sm text-muted-foreground mb-5 max-w-[240px] mx-auto">
              Start exploring restaurants and your activity will appear here
            </p>
            <Button 
              onClick={() => navigate("/discover")} 
              variant="outline"
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              Discover Restaurants
            </Button>
          </Card>
        )}
      </div>

      {/* Subtle Learning Indicator */}
      {!hasNoActivity && (
        <div className="px-4 pb-6">
          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground/50">
            <Sparkles className="h-3 w-3" />
            <span>Outa learns from this to personalize your experience</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activity;
