import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, ChefHat, Package, Utensils, XCircle, RefreshCw, Sparkles } from "lucide-react";
import { vibrate } from "@/utils/haptics";

type OrderStatus = "pending" | "accepted" | "preparing" | "ready" | "completed" | "cancelled";

interface OrderState {
  orderId?: string;
  restaurantName?: string;
  totalAmount?: number;
  itemCount?: number;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: typeof CheckCircle2; color: string; description: string }> = {
  pending: { label: "Order Received", icon: Clock, color: "text-yellow-500", description: "Waiting for confirmation" },
  accepted: { label: "Order Accepted", icon: CheckCircle2, color: "text-blue-500", description: "Restaurant confirmed" },
  preparing: { label: "Being Prepared", icon: ChefHat, color: "text-purple", description: "Chef is cooking" },
  ready: { label: "Ready for Pickup", icon: Package, color: "text-green-500", description: "Your order is ready!" },
  completed: { label: "Completed", icon: Utensils, color: "text-green-600", description: "Enjoy your meal!" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-500", description: "Order was cancelled" },
};

const STATUS_FLOW: OrderStatus[] = ["pending", "accepted", "preparing", "ready", "completed"];

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, restaurantName, totalAmount, itemCount } = (location.state || {}) as OrderState;
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>("pending");
  const [isPolling, setIsPolling] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchOrderStatus = useCallback(async () => {
    if (!orderId) return;
    
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .single();

      if (!error && data) {
        const newStatus = data.status as OrderStatus;
        if (newStatus !== currentStatus) {
          vibrate(20);
          setCurrentStatus(newStatus);
          setLastUpdate(new Date());
        }
        
        // Stop polling if order is completed or cancelled
        if (newStatus === "completed" || newStatus === "cancelled") {
          setIsPolling(false);
        }
      }
    } catch (error) {
      console.error("Error fetching order status:", error);
    }
  }, [orderId, currentStatus]);

  useEffect(() => {
    // Initial haptic feedback
    vibrate(30);

    // Initial fetch
    if (orderId) {
      fetchOrderStatus();
    }
  }, [orderId]);

  // Poll for status updates every 15 seconds
  useEffect(() => {
    if (!orderId || !isPolling) return;

    const interval = setInterval(fetchOrderStatus, 15000);
    return () => clearInterval(interval);
  }, [orderId, isPolling, fetchOrderStatus]);

  if (!restaurantName) {
    navigate("/");
    return null;
  }

  const currentStepIndex = STATUS_FLOW.indexOf(currentStatus);
  const config = STATUS_CONFIG[currentStatus];

  return (
    <div className="min-h-screen bg-gradient-app flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-0 shadow-2xl">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-purple/20 rounded-full blur-2xl animate-pulse" />
              <CheckCircle2 className="h-24 w-24 text-purple relative" />
            </div>
          </div>

          {/* Main Message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              ✅ Order sent to restaurant.
            </h1>
            <p className="text-muted-foreground text-lg">
              They're cooking it up. You'll eat good soon.
            </p>
          </div>

          {/* Order Summary Card */}
          <div className="bg-gradient-to-br from-purple/5 to-secondary/5 border border-purple/20 rounded-2xl p-6 space-y-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Restaurant</p>
              <p className="font-semibold text-foreground text-lg">{restaurantName}</p>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold text-purple">£{totalAmount?.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="text-2xl font-bold text-foreground">{itemCount}</p>
              </div>
            </div>
          </div>

          {/* Live Order Tracking */}
          <div className="bg-muted/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-foreground">Order Progress</p>
              {isPolling && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Live</span>
                </div>
              )}
            </div>
            
            {/* Current Status Highlight */}
            <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${config.color.replace('text-', 'from-')}/10 to-transparent border border-current/10`}>
              <div className={`flex items-center justify-center w-12 h-12 rounded-full ${config.color} bg-current/10`}>
                <config.icon className={`h-6 w-6 ${config.color}`} />
              </div>
              <div className="flex-1 text-left">
                <p className={`text-base font-semibold ${config.color}`}>{config.label}</p>
                <p className="text-xs text-muted-foreground">{config.description}</p>
              </div>
              {currentStatus !== "completed" && currentStatus !== "cancelled" && (
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>

            {/* Progress Steps */}
            <div className="space-y-2 mt-4">
              {STATUS_FLOW.map((status, index) => {
                const stepConfig = STATUS_CONFIG[status];
                const StepIcon = stepConfig.icon;
                const isCompleted = index < currentStepIndex;
                const isCurrent = status === currentStatus;
                const isUpcoming = index > currentStepIndex;

                return (
                  <div
                    key={status}
                    className={`flex items-center gap-3 transition-all duration-500 ${
                      isUpcoming ? "opacity-30" : "opacity-100"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : isCurrent
                          ? `${stepConfig.color} border-current bg-current/10`
                          : "border-muted-foreground/20 text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <StepIcon className={`h-4 w-4 ${isCurrent ? stepConfig.color : ""}`} />
                      )}
                    </div>
                    <p className={`text-sm ${isCurrent ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {stepConfig.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Last Updated */}
            <p className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border/50">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>

          {/* Fun Note */}
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-foreground">
              🍳 Outa will keep learning your preferences for next time.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/my-orders")}
              variant="outline"
              className="w-full h-12 text-base font-semibold"
            >
              View All Orders
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="w-full h-12 text-base font-semibold bg-purple text-white hover:bg-purple-hover"
            >
              Back to exploring 🍽️
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSuccess;
