import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, Calendar, ChefHat, Star, Gift, 
  ArrowLeft, Package, Sparkles, Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ActivityItem {
  id: string;
  type: 'order' | 'booking' | 'catering' | 'reward' | 'gift_card';
  title: string;
  description: string;
  amount?: number;
  points?: number;
  status?: string;
  date: Date;
  metadata?: any;
}

const Activity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'order' | 'booking' | 'reward'>('all');

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('activity-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as any;
          const newActivity: ActivityItem = {
            id: newOrder.id,
            type: 'order',
            title: 'Order Placed',
            description: `Order for ${newOrder.customer_name || 'customer'}`,
            amount: Number(newOrder.total),
            status: newOrder.status,
            date: new Date(newOrder.created_at),
            metadata: newOrder,
          };
          setActivities(prev => [newActivity, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await fetchAllActivities(session.user.id);
    } else {
      setLoading(false);
    }
  };

  const fetchAllActivities = async (userId: string) => {
    try {
      const allActivities: ActivityItem[] = [];

      const { data: orders } = await supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false });
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
        });
      });

      const { data: bookings } = await supabase.from("bookings").select("*").eq("user_id", userId).order("created_at", { ascending: false });
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

      const { data: rewards } = await supabase.from("rewards_transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false });
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
      default: return 'from-muted to-muted/50 text-muted-foreground';
    }
  };

  const filterActivities = (filter: 'all' | ActivityItem['type']) => {
    if (filter === 'all') return activities;
    return activities.filter(a => a.type === filter);
  };

  const filteredActivities = filterActivities(activeTab);

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
              <p className="text-xs text-muted-foreground">Your recent actions</p>
            </div>
          </div>
        </div>

        <div className="px-4">
          <Card className="p-12 text-center glass-card-strong animate-slide-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple/20 to-neon-pink/10 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-purple" />
            </div>
            <p className="text-foreground font-semibold mb-2">Sign in to view activity</p>
            <p className="text-sm text-muted-foreground mb-6">Track your orders, bookings, and rewards</p>
            <Button onClick={() => navigate("/auth")} className="bg-purple hover:bg-purple/90">
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Activity</h1>
              <p className="text-xs text-muted-foreground">{activities.length} total actions</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple/15 to-neon-pink/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-purple" />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              { id: 'all', label: 'All', count: activities.length },
              { id: 'order', label: 'Orders', count: filterActivities('order').length },
              { id: 'booking', label: 'Bookings', count: filterActivities('booking').length },
              { id: 'reward', label: 'Rewards', count: filterActivities('reward').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple text-primary-foreground shadow-neon'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
              >
                {tab.label}
                <span className={`text-[10px] ${activeTab === tab.id ? 'opacity-80' : 'opacity-50'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: ShoppingBag, label: 'Orders', value: filterActivities('order').length, color: 'text-blue-500' },
            { icon: Calendar, label: 'Bookings', value: filterActivities('booking').length, color: 'text-purple' },
            { icon: Star, label: 'Points', value: filterActivities('reward').reduce((s, a) => s + (a.points || 0), 0), color: 'text-yellow-500' },
          ].map((stat, index) => (
            <Card 
              key={stat.label}
              className="p-3 glass-card animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="px-4 py-2">
        {filteredActivities.length === 0 ? (
          <Card className="p-12 text-center glass-card animate-slide-up">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">No activity yet</p>
            <p className="text-sm text-muted-foreground">Your actions will appear here</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <Card
                  key={activity.id}
                  className="p-4 glass-card hover:shadow-lg transition-all animate-slide-up timeline-item"
                  style={{ animationDelay: `${100 + index * 50}ms` }}
                >
                  <div className={`timeline-dot bg-gradient-to-br ${getActivityColor(activity.type)}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getActivityColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground text-sm">{activity.title}</p>
                        {activity.status && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-[10px] text-muted-foreground">
                          {activity.date.toLocaleDateString()} · {activity.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
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
        )}
      </div>
    </div>
  );
};

export default Activity;
