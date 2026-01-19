import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Package, 
  XCircle,
  RefreshCw,
  Phone,
  Mail
} from "lucide-react";
import { format } from "date-fns";

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
};

const ORDER_STATUSES = [
  { value: "pending", label: "Pending", icon: Clock, color: "bg-yellow-500" },
  { value: "accepted", label: "Accepted", icon: CheckCircle, color: "bg-blue-500" },
  { value: "preparing", label: "Preparing", icon: ChefHat, color: "bg-purple" },
  { value: "ready", label: "Ready", icon: Package, color: "bg-green-500" },
  { value: "completed", label: "Completed", icon: CheckCircle, color: "bg-green-600" },
  { value: "cancelled", label: "Cancelled", icon: XCircle, color: "bg-red-500" },
];

interface OrderManagementProps {
  orders: Order[];
  onOrderUpdate: () => void;
}

const OrderManagement = ({ orders, onOrderUpdate }: OrderManagementProps) => {
  const { toast } = useToast();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeOrders = orders.filter(
    (o) => !["completed", "cancelled"].includes(o.status)
  );

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}`,
      });
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

  const getNextStatus = (currentStatus: string): string | null => {
    const flow = ["pending", "accepted", "preparing", "ready", "completed"];
    const currentIndex = flow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === flow.length - 1) return null;
    return flow[currentIndex + 1];
  };

  const getStatusConfig = (status: string) => {
    return ORDER_STATUSES.find((s) => s.value === status) || ORDER_STATUSES[0];
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {activeOrders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              No active orders. New orders will appear here in real-time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const nextStatus = getNextStatus(order.status);
            const isUpdating = updatingOrderId === order.id;

            return (
              <Card key={order.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${statusConfig.color}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(-6).toUpperCase()}
                    </CardTitle>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <CardDescription>
                    {format(new Date(order.created_at), "MMM d, h:mm a")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  {(order.customer_name || order.customer_email || order.customer_phone) && (
                    <div className="space-y-1 text-sm">
                      {order.customer_name && (
                        <p className="font-medium">{order.customer_name}</p>
                      )}
                      {order.customer_email && (
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {order.customer_email}
                        </p>
                      )}
                      {order.customer_phone && (
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {order.customer_phone}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground mb-2">Items</p>
                    <ul className="space-y-1 text-sm">
                      {Array.isArray(order.items) &&
                        order.items.map((item: any, i: number) => (
                          <li key={i} className="flex justify-between">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span className="text-muted-foreground">
                              £{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </span>
                          </li>
                        ))}
                    </ul>
                    <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                      <span>Total</span>
                      <span>£{Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex gap-2 pt-2">
                    {nextStatus && (
                      <Button
                        className="flex-1"
                        onClick={() => handleStatusUpdate(order.id, nextStatus)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Mark as {getStatusConfig(nextStatus).label}
                      </Button>
                    )}
                    {order.status !== "cancelled" && order.status !== "completed" && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleStatusUpdate(order.id, "cancelled")}
                        disabled={isUpdating}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-2">
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
