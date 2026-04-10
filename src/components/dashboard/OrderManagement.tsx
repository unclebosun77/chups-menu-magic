import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { vibrate } from "@/utils/haptics";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  ChefHat,
  Package,
  XCircle,
  RefreshCw,
  Loader2,
  User,
} from "lucide-react";

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
  table_number?: string | null;
  payment_status?: string | null;
  payment_method?: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; bgClass: string }> = {
  pending: { label: "Pending", icon: Clock, bgClass: "bg-yellow-500" },
  accepted: { label: "Accepted", icon: CheckCircle, bgClass: "bg-blue-500" },
  preparing: { label: "Preparing", icon: ChefHat, bgClass: "bg-purple" },
  ready: { label: "Ready", icon: Package, bgClass: "bg-green-500" },
  completed: { label: "Completed", icon: CheckCircle, bgClass: "bg-green-600" },
  cancelled: { label: "Cancelled", icon: XCircle, bgClass: "bg-red-500" },
};

const NEXT_STATUS: Record<string, string> = {
  pending: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: "completed",
};

const ACTION_STYLES: Record<string, string> = {
  accepted: "bg-blue-500 hover:bg-blue-600 text-white",
  preparing: "bg-purple hover:bg-purple-hover text-white",
  ready: "bg-green-500 hover:bg-green-600 text-white",
  completed: "bg-green-600 hover:bg-green-700 text-white",
};

const ACTION_LABELS: Record<string, string> = {
  accepted: "Accept Order",
  preparing: "Start Preparing",
  ready: "Mark Ready",
  completed: "Complete Order",
};

// --- Helpers ---

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

function minutesElapsed(dateStr: string): number {
  return (Date.now() - new Date(dateStr).getTime()) / 60000;
}

function playNotificationSound() {
  if (document.visibilityState !== "visible") return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.15;
    osc.frequency.value = 880;
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // Web Audio not available
  }
}

// --- Subcomponents ---

function LiveTimer({ createdAt }: { createdAt: string }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
      <Clock className="h-3 w-3" />
      {timeAgo(createdAt)}
    </span>
  );
}

interface OrderManagementProps {
  orders: Order[];
  onOrderUpdate: () => void;
  restaurantId?: string;
}

const OrderManagement = ({ orders, onOrderUpdate, restaurantId }: OrderManagementProps) => {
  const { toast } = useToast();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [banner, setBanner] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevOrderIdsRef = useRef<Set<string>>(new Set(orders.map((o) => o.id)));
  const [, setTick] = useState(0);

  // Tick every 30s to refresh urgency borders
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!restaurantId) return;

    const channel = supabase
      .channel(`orders-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          const newOrder = payload.new as any;
          vibrate(50);
          playNotificationSound();

          // Flash animation
          setNewOrderIds((prev) => new Set(prev).add(newOrder.id));
          setTimeout(() => {
            setNewOrderIds((prev) => {
              const next = new Set(prev);
              next.delete(newOrder.id);
              return next;
            });
          }, 3000);

          // Banner
          setBanner("1 new order just arrived 🔔");
          setTimeout(() => setBanner(null), 5000);

          toast({
            title: "New order received! 🔔",
            description: `Table ${newOrder.table_number || "Walk-in"} — £${Number(newOrder.total).toFixed(2)}`,
          });

          onOrderUpdate();

          // Scroll into view after a short delay so the card is rendered
          setTimeout(() => {
            const ref = cardRefs.current[newOrder.id];
            ref?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 300);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          onOrderUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, onOrderUpdate, toast]);

  // Detect new orders added to props (from parent re-fetch)
  useEffect(() => {
    const currentIds = new Set(orders.map((o) => o.id));
    const prevIds = prevOrderIdsRef.current;
    currentIds.forEach((id) => {
      if (!prevIds.has(id)) {
        // Already handled via realtime, but mark just in case
        setNewOrderIds((prev) => {
          if (prev.has(id)) return prev;
          const next = new Set(prev);
          next.add(id);
          setTimeout(() => {
            setNewOrderIds((p) => {
              const n = new Set(p);
              n.delete(id);
              return n;
            });
          }, 3000);
          return next;
        });
      }
    });
    prevOrderIdsRef.current = currentIds;
  }, [orders]);

  const activeOrders = orders.filter((o) => !["completed", "cancelled"].includes(o.status));

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;

      if (newStatus === "completed") {
        const order = orders.find((o) => o.id === orderId);
        if (order) {
          const points = Math.floor(Number(order.total) * 10);
          toast({
            title: "Order complete",
            description: `Customer earned ${points} points 🎉`,
          });
        }
      } else {
        toast({
          title: "Status updated",
          description: `Order → ${STATUS_CONFIG[newStatus]?.label || newStatus}`,
        });
      }
      onOrderUpdate();
    } catch (error: any) {
      toast({
        title: "Error updating order",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    onOrderUpdate();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getUrgencyClass = (order: Order): string => {
    if (order.status !== "pending") return "";
    const mins = minutesElapsed(order.created_at);
    if (mins >= 20) return "ring-2 ring-red-500 animate-pulse";
    if (mins >= 10) return "ring-2 ring-amber-500 animate-pulse";
    return "";
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Kitchen Display</h2>
          <p className="text-sm text-muted-foreground">
            {activeOrders.length} active order{activeOrders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* New order banner */}
      {banner && (
        <div className="mb-4 rounded-xl bg-green-500/15 border border-green-500/30 px-4 py-3 text-sm font-medium text-green-700 dark:text-green-300 animate-fade-in">
          {banner}
        </div>
      )}

      {activeOrders.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-2">
              <ChefHat className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <p className="text-muted-foreground">
                No active orders. New orders will appear here instantly.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeOrders.map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = config.icon;
            const nextStatus = NEXT_STATUS[order.status] || null;
            const isUpdating = updatingOrderId === order.id;
            const isNew = newOrderIds.has(order.id);
            const urgency = getUrgencyClass(order);

            return (
              <Card
                key={order.id}
                ref={(el) => { cardRefs.current[order.id] = el; }}
                className={`relative overflow-hidden transition-all duration-300 ${urgency} ${
                  isNew ? "ring-2 ring-green-500 shadow-lg shadow-green-500/20" : ""
                }`}
              >
                {/* Top colour bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${config.bgClass}`} />

                <CardContent className="pt-5 pb-4 space-y-3">
                  {/* Header row: ref · table · timer */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-base truncate">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      {order.table_number && (
                        <Badge className="bg-purple/15 text-purple border-purple/30 text-xs shrink-0">
                          Table {order.table_number}
                        </Badge>
                      )}
                    </div>
                    <LiveTimer createdAt={order.created_at} />
                  </div>

                  {/* Full-width status badge */}
                  <div className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-white text-sm font-semibold ${config.bgClass}`}>
                    <StatusIcon className="h-4 w-4" />
                    {config.label}
                  </div>

                  {/* Customer + payment */}
                  <div className="flex items-center justify-between">
                    {order.customer_name && (
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {order.customer_name}
                      </div>
                    )}
                    <div>
                      {order.payment_method === "pos" || order.payment_status === "pos_requested" ? (
                        <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs">
                          Pay at table
                        </Badge>
                      ) : order.payment_status === "paid" ? (
                        <Badge className="bg-green-500/15 text-green-600 border-green-500/30 text-xs">
                          Paid
                        </Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground text-xs">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="border-t pt-3 space-y-1.5">
                    {Array.isArray(order.items) &&
                      order.items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>
                            <span className="font-semibold">{item.quantity}×</span>{" "}
                            <span className="font-medium">{item.name}</span>
                          </span>
                          <span className="text-muted-foreground tabular-nums">
                            £{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Total */}
                  <div className="flex justify-end border-t pt-2">
                    <span className="text-xl font-bold tabular-nums">
                      £{Number(order.total).toFixed(2)}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    {nextStatus && (
                      <Button
                        className={`flex-1 h-14 text-base font-semibold ${ACTION_STYLES[nextStatus] || ""}`}
                        onClick={() => handleStatusUpdate(order.id, nextStatus)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : null}
                        {ACTION_LABELS[nextStatus] || `Mark ${nextStatus}`}
                      </Button>
                    )}
                    {order.status !== "cancelled" && order.status !== "completed" && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-14 w-14 shrink-0"
                        onClick={() => handleStatusUpdate(order.id, "cancelled")}
                        disabled={isUpdating}
                        title="Cancel order"
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="flex gap-1">
                    {["pending", "accepted", "preparing", "ready"].map((step, i) => {
                      const steps = ["pending", "accepted", "preparing", "ready"];
                      const currentIndex = steps.indexOf(order.status);
                      return (
                        <div
                          key={step}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i <= currentIndex ? "bg-purple" : "bg-secondary"
                          }`}
                        />
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
