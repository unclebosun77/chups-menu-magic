import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, Calendar, ChefHat, Star, Gift, 
  TrendingUp, TrendingDown, ArrowRight, Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  useEffect(() => {
    checkUser();
  }, []);

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

      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!ordersError && orders) {
        orders.forEach((order) => {
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
      }

      // Fetch bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!bookingsError && bookings) {
        bookings.forEach((booking) => {
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
      }

      // Fetch catering orders
      const { data: catering, error: cateringError } = await supabase
        .from("catering_orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!cateringError && catering) {
        catering.forEach((order) => {
          allActivities.push({
            id: order.id,
            type: 'catering',
            title: 'Catering Order',
            description: `${order.event_type} for ${order.guest_count} guests`,
            amount: Number(order.total_price),
            status: order.status,
            date: new Date(order.created_at),
            metadata: order,
          });
        });
      }

      // Fetch rewards transactions
      const { data: rewards, error: rewardsError } = await supabase
        .from("rewards_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!rewardsError && rewards) {
        rewards.forEach((txn) => {
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
      }

      // Fetch gift cards
      const { data: giftCards, error: giftCardsError } = await supabase
        .from("gift_cards")
        .select("*")
        .eq("purchaser_user_id", userId)
        .order("created_at", { ascending: false });

      if (!giftCardsError && giftCards) {
        giftCards.forEach((card) => {
          allActivities.push({
            id: card.id,
            type: 'gift_card',
            title: 'Gift Card Purchased',
            description: `Sent to ${card.recipient_email}`,
            amount: Number(card.initial_amount),
            status: card.status,
            date: new Date(card.created_at),
            metadata: card,
          });
        });
      }

      // Sort all activities by date (most recent first)
      allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
      setActivities(allActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast({
        title: "Error",
        description: "Failed to load activity feed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order':
        return ShoppingBag;
      case 'booking':
        return Calendar;
      case 'catering':
        return ChefHat;
      case 'reward':
        return Star;
      case 'gift_card':
        return Gift;
      default:
        return Package;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order':
        return 'bg-blue-500/10 text-blue-500';
      case 'booking':
        return 'bg-purple-500/10 text-purple-500';
      case 'catering':
        return 'bg-orange-500/10 text-orange-500';
      case 'reward':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'gift_card':
        return 'bg-pink-500/10 text-pink-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      confirmed: 'default',
      completed: 'default',
      cancelled: 'destructive',
      active: 'default',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const filterActivities = (filter: 'all' | ActivityItem['type']) => {
    if (filter === 'all') return activities;
    return activities.filter(a => a.type === filter);
  };

  if (!user) {
    return (
      <div className="p-4 space-y-6 pb-24">
        <div className="pt-4">
          <h1 className="text-3xl font-bold bg-gradient-purple-glow bg-clip-text text-transparent">
            Activity Feed
          </h1>
          <p className="text-muted-foreground mt-1">Track all your actions in one place</p>
        </div>

        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <CardDescription className="text-lg mb-4">
            Sign in to view your activity
          </CardDescription>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24">
        <p>Loading your activity...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="pt-4">
        <h1 className="text-3xl font-bold bg-gradient-purple-glow bg-clip-text text-transparent">
          Activity Feed
        </h1>
        <p className="text-muted-foreground mt-1">Track all your actions in one place</p>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{filterActivities('order').length}</p>
            <p className="text-xs text-muted-foreground">Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{filterActivities('booking').length}</p>
            <p className="text-xs text-muted-foreground">Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ChefHat className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{filterActivities('catering').length}</p>
            <p className="text-xs text-muted-foreground">Catering</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">
              {filterActivities('reward').reduce((sum, a) => sum + (a.points || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">Points</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="order">Orders</TabsTrigger>
          <TabsTrigger value="booking">Bookings</TabsTrigger>
          <TabsTrigger value="catering">Catering</TabsTrigger>
          <TabsTrigger value="reward">Rewards</TabsTrigger>
          <TabsTrigger value="gift_card">Gifts</TabsTrigger>
        </TabsList>

        {(['all', 'order', 'booking', 'catering', 'reward', 'gift_card'] as const).map((filter) => (
          <TabsContent key={filter} value={filter} className="space-y-3 mt-4">
            {filterActivities(filter).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <CardDescription>
                    No {filter === 'all' ? 'activity' : filter} yet
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              filterActivities(filter).map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <Card key={activity.id} className="hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-base">{activity.title}</CardTitle>
                              {getStatusBadge(activity.status)}
                            </div>
                            <CardDescription className="text-sm">
                              {activity.description}
                            </CardDescription>
                            <p className="text-xs text-muted-foreground mt-2">
                              {activity.date.toLocaleDateString()} at {activity.date.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {activity.amount !== undefined && (
                            <p className="text-lg font-bold text-primary">
                              ${activity.amount.toFixed(2)}
                            </p>
                          )}
                          {activity.points !== undefined && (
                            <div className={`flex items-center gap-1 ${activity.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {activity.points > 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              <p className="text-lg font-bold">
                                {activity.points > 0 ? '+' : ''}{activity.points}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Actions */}
      {activities.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Navigate to your history pages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => navigate("/my-orders")}
            >
              <span>View All Orders</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => navigate("/bookings")}
            >
              <span>Manage Bookings</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => navigate("/rewards")}
            >
              <span>Rewards & Gift Cards</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Activity;
