import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, CheckCircle, XCircle, Package, ChefHat, Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Order = {
  id: string;
  restaurant_id: string;
  items: any;
  total: number;
  status: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  created_at: string;
  restaurants?: {
    name: string;
  };
};

const ORDER_STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-500", description: "Waiting for confirmation" },
  accepted: { label: "Accepted", icon: CheckCircle, color: "bg-blue-500", description: "Restaurant confirmed" },
  preparing: { label: "Preparing", icon: ChefHat, color: "bg-purple", description: "Being prepared" },
  ready: { label: "Ready", icon: Package, color: "bg-green-500", description: "Ready for pickup" },
  completed: { label: "Completed", icon: CheckCircle, color: "bg-green-600", description: "Order complete" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-500", description: "Order cancelled" },
};

const MyOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Poll for status updates every 30 seconds
  useEffect(() => {
    if (!user || orders.length === 0) return;

    const interval = setInterval(() => {
      loadOrders(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [user, orders.length]);

  const loadOrders = async (silent = false) => {
    if (!user) return;
    
    if (!silent) setIsLoading(true);
    setIsRefreshing(true);

    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          restaurants (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error: any) {
      if (!silent) {
        toast({
          title: "Error loading orders",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadOrders();
  };

  const getStatusConfig = (status: string) => {
    return ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG] || ORDER_STATUS_CONFIG.pending;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 pb-24">
        <div className="px-4 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
              <p className="text-xs text-muted-foreground">Track your order history</p>
            </div>
          </div>
        </div>

        <div className="px-4">
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple/20 to-purple/10 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-purple" />
            </div>
            <p className="text-foreground font-semibold mb-2">Sign in to view your orders</p>
            <p className="text-sm text-muted-foreground mb-6">Track your order history and status</p>
            <Button onClick={() => navigate("/auth")} className="bg-purple hover:bg-purple/90">
              Sign In
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple/15 to-purple/25 flex items-center justify-center animate-pulse">
            <Sparkles className="h-5 w-5 text-purple" />
          </div>
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">My Orders</h1>
              <p className="text-xs text-muted-foreground">{orders.length} orders</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 py-4">
        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">No orders yet</p>
            <p className="text-sm text-muted-foreground mb-4">Your order history will appear here</p>
            <Button onClick={() => navigate("/discover")} variant="outline">
              Discover Restaurants
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <Card 
                  key={order.id} 
                  className="overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{order.restaurants?.name || "Restaurant"}</CardTitle>
                        <CardDescription>
                          {new Date(order.created_at).toLocaleDateString()} at{" "}
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </CardDescription>
                      </div>
                      <Badge className={`${statusConfig.color} text-white`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    
                    {/* Status Progress Bar */}
                    {order.status !== 'cancelled' && order.status !== 'completed' && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>{statusConfig.description}</span>
                          <span className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            Auto-updating
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {['pending', 'accepted', 'preparing', 'ready'].map((step, i) => {
                            const steps = ['pending', 'accepted', 'preparing', 'ready'];
                            const currentIndex = steps.indexOf(order.status);
                            return (
                              <div 
                                key={step}
                                className={`h-1.5 flex-1 rounded-full transition-colors ${
                                  i <= currentIndex ? 'bg-purple' : 'bg-secondary'
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <p className="font-medium mb-2">Items:</p>
                        {Array.isArray(order.items) &&
                          order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-muted-foreground py-1">
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span>£{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                      </div>
                      <div className="pt-3 border-t flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-purple">£{Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;