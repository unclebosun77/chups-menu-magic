import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Package,
  Utensils,
  XCircle,
  RefreshCw,
  Star,
  Loader2,
} from "lucide-react";
import { vibrate } from "@/utils/haptics";
import { useToast } from "@/hooks/use-toast";

type OrderStatus = "pending" | "accepted" | "preparing" | "ready" | "completed" | "cancelled";

interface OrderState {
  orderId?: string;
  restaurantName?: string;
  restaurantId?: string;
  totalAmount?: number;
  itemCount?: number;
  paymentMethod?: string;
  tableNumber?: string | null;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: typeof CheckCircle2; color: string; description: string }> = {
  pending: { label: "Order Received", icon: Clock, color: "text-yellow-500", description: "Waiting for confirmation" },
  accepted: { label: "Order Accepted", icon: CheckCircle2, color: "text-blue-500", description: "Restaurant confirmed" },
  preparing: { label: "Being Prepared", icon: ChefHat, color: "text-purple", description: "Chef is cooking" },
  ready: { label: "Ready!", icon: Package, color: "text-green-500", description: "Your order is ready!" },
  completed: { label: "Completed", icon: Utensils, color: "text-green-600", description: "Enjoy your meal!" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-500", description: "Order was cancelled" },
};

const STATUS_FLOW: OrderStatus[] = ["pending", "accepted", "preparing", "ready", "completed"];

// ── Confetti component ──
const Confetti = () => {
  const dots = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        duration: `${1.5 + Math.random() * 1.5}s`,
        color: ["bg-green-400", "bg-purple", "bg-yellow-400", "bg-pink-400", "bg-blue-400"][i % 5],
        size: Math.random() > 0.5 ? "w-2 h-2" : "w-1.5 h-1.5",
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {dots.map((dot) => (
        <div
          key={dot.id}
          className={`absolute rounded-full ${dot.color} ${dot.size} opacity-80`}
          style={{
            left: dot.left,
            top: "-8px",
            animation: `confettiFall ${dot.duration} ${dot.delay} ease-in forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// ── Star rating component ──
const StarRating = ({
  rating,
  onRate,
}: {
  rating: number;
  onRate: (r: number) => void;
}) => (
  <div className="flex gap-2 justify-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={() => onRate(star)}
        className="transition-transform duration-150 active:scale-90 hover:scale-110"
      >
        <Star
          className={`h-9 w-9 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      </button>
    ))}
  </div>
);

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    orderId,
    restaurantName,
    restaurantId,
    totalAmount,
    itemCount,
    paymentMethod,
    tableNumber,
  } = (location.state || {}) as OrderState;

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>("pending");
  const [isPolling, setIsPolling] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [fetchedTotal, setFetchedTotal] = useState<number | null>(null);
  const [fetchedItemCount, setFetchedItemCount] = useState<number | null>(null);
  const [fetchedRestaurantId, setFetchedRestaurantId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Review state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const effectiveRestaurantId = restaurantId || fetchedRestaurantId;
  const displayTotal = totalAmount && totalAmount > 0 ? totalAmount : fetchedTotal;
  const displayItemCount = itemCount || fetchedItemCount;

  // Fallback: fetch order data from DB if not passed via navigation state
  useEffect(() => {
    if (!orderId) return;
    if ((!totalAmount || totalAmount === 0) || !restaurantId) {
      supabase
        .from("orders")
        .select("total, items, restaurant_id")
        .eq("id", orderId)
        .single()
        .then(({ data }) => {
          if (data) {
            setFetchedTotal(data.total);
            setFetchedItemCount(Array.isArray(data.items) ? data.items.length : 0);
            setFetchedRestaurantId(data.restaurant_id);
          }
        });
    }
  }, [orderId, totalAmount, restaurantId]);

  // Real-time subscription for order status updates
  useEffect(() => {
    if (!orderId) return;

    const fetchInitial = async () => {
      const { data } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .single();
      if (data) {
        const s = data.status as OrderStatus;
        setCurrentStatus(s);
        setLastUpdate(new Date());
        if (s === "ready") triggerReadyCelebration();
      }
    };
    fetchInitial();

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newStatus = (payload.new as any).status as OrderStatus;
          setCurrentStatus(newStatus);
          setLastUpdate(new Date());
          vibrate(20);

          if (newStatus === "ready") {
            triggerReadyCelebration();
          }

          if (newStatus === "completed") {
            handleCompletedStatus();
          }

          if (newStatus === "completed" || newStatus === "cancelled") {
            setIsPolling(false);
            supabase.removeChannel(channel);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Initial haptic feedback
  useEffect(() => {
    vibrate(30);
  }, []);

  const triggerReadyCelebration = () => {
    vibrate(50);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  const handleCompletedStatus = async () => {
    if (!user) return;
    // Fetch updated points balance
    try {
      const total = displayTotal || 0;
      const earned = Math.floor(total * 10);
      const { data } = await supabase
        .from("rewards_accounts")
        .select("points_balance")
        .eq("user_id", user.id)
        .maybeSingle();

      toast({
        title: `✦ You earned ${earned} points!`,
        description: `Your balance is now ${data?.points_balance ?? earned} pts 🎉`,
      });
    } catch {
      // Silent fail for points notification
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !effectiveRestaurantId || reviewRating === 0) return;
    setReviewSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        restaurant_id: effectiveRestaurantId,
        rating: reviewRating,
        comment: reviewComment.trim() || null,
      });
      if (error) throw error;
      setReviewSubmitted(true);
      vibrate(20);
    } catch (err: any) {
      toast({
        title: "Couldn't submit review",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (!restaurantName) {
    navigate("/");
    return null;
  }

  const currentStepIndex = STATUS_FLOW.indexOf(currentStatus);
  const config = STATUS_CONFIG[currentStatus];
  const isReady = currentStatus === "ready";
  const isCompleted = currentStatus === "completed";
  const isTerminal = isCompleted || currentStatus === "cancelled";

  return (
    <div className="min-h-screen bg-gradient-app flex items-center justify-center p-4">
      <Card
        className={`max-w-md w-full border-0 shadow-2xl relative overflow-hidden transition-all duration-700 ${
          isReady ? "bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/20" : ""
        }`}
      >
        {showConfetti && <Confetti />}

        <CardContent className="pt-8 pb-6 text-center space-y-6 relative z-20">
          {/* Hero icon — changes based on status */}
          <div className="flex justify-center">
            <div className="relative">
              {isReady ? (
                <>
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
                  <div className="text-7xl animate-bounce relative">🍽️</div>
                </>
              ) : isCompleted ? (
                <>
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl" />
                  <CheckCircle2 className="h-24 w-24 text-green-500 relative" />
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-purple/20 rounded-full blur-2xl animate-pulse" />
                  <CheckCircle2 className="h-24 w-24 text-purple relative" />
                </>
              )}
            </div>
          </div>

          {/* Order Reference */}
          {orderId && (
            <div className="space-y-1">
              <p className={`text-4xl font-black tracking-tight ${isReady ? "text-green-600 dark:text-green-400" : "text-purple"}`}>
                Order #{orderId.slice(-6).toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground">Reference number</p>
            </div>
          )}

          {/* Main Message — context-aware */}
          <div className="space-y-2">
            {isReady ? (
              <>
                <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Your order is ready! 🎉
                </h1>
                <p className="text-base text-foreground">
                  {tableNumber
                    ? `Your order for Table ${tableNumber} is ready! A server will bring it to you shortly 🙌`
                    : "Your order is ready for collection! Head to the counter 👇"}
                </p>
                {/* Add to home screen prompt */}
                <div className="mt-4 bg-muted/60 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">
                    💡 Add Chups to your home screen for instant order notifications next time
                  </p>
                </div>
              </>
            ) : isCompleted ? (
              <>
                <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Order complete! Enjoy 🎉
                </h1>
                <p className="text-muted-foreground text-base">
                  We hope it was delicious.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-foreground">
                  ✅ Order sent to restaurant
                </h1>
                <p className="text-muted-foreground text-base">
                  They're cooking it up. You'll eat good soon.
                </p>
                {paymentMethod === "pos" && (
                  <div className="mt-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-2">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                      Show this to your server
                    </p>
                    <div className="flex items-center justify-center gap-3 text-amber-900 dark:text-amber-100">
                      {tableNumber && (
                        <span className="text-lg font-bold">Table {tableNumber}</span>
                      )}
                      {tableNumber && orderId && <span className="text-amber-400">·</span>}
                      {orderId && (
                        <span className="text-lg font-bold">
                          Order #{orderId.slice(0, 6).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      A member of staff will bring your card machine
                    </p>
                  </div>
                )}
                {paymentMethod === "stripe" && (
                  <div className="mt-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-sm text-green-800 dark:text-green-200">
                    Payment confirmed ✓
                  </div>
                )}
              </>
            )}
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
                <p className="text-3xl font-bold text-purple">
                  £{displayTotal?.toFixed(2) ?? "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="text-2xl font-bold text-foreground">
                  {displayItemCount || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Live Order Tracking — hide when completed */}
          {!isTerminal && (
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
              <div
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                  isReady
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-muted/80 border border-border/50"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full ${
                    isReady ? "bg-green-500/15 text-green-500" : `${config.color} bg-current/10`
                  }`}
                >
                  <config.icon className={`h-6 w-6 ${isReady ? "text-green-500" : config.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-base font-semibold ${isReady ? "text-green-600 dark:text-green-400" : config.color}`}>
                    {config.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </div>
                {!isReady && (
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
                  const isStepCompleted = index < currentStepIndex;
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
                          isStepCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : isCurrent
                            ? `${stepConfig.color} border-current bg-current/10`
                            : "border-muted-foreground/20 text-muted-foreground"
                        }`}
                      >
                        {isStepCompleted ? (
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

              <p className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border/50">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          )}

          {/* Review prompt — shown when completed */}
          {isCompleted && user && effectiveRestaurantId && (
            <div className="bg-muted/50 rounded-xl p-6 space-y-4 animate-fade-in">
              {reviewSubmitted ? (
                <div className="text-center space-y-2 py-2">
                  <p className="text-2xl">💜</p>
                  <p className="text-base font-semibold text-foreground">
                    Thanks for the feedback!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your review helps other diners find great food.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-foreground">
                      Rate your experience
                    </p>
                    <p className="text-xs text-muted-foreground">
                      How was your meal at {restaurantName}?
                    </p>
                  </div>

                  <StarRating rating={reviewRating} onRate={setReviewRating} />

                  {reviewRating > 0 && (
                    <div className="space-y-3 animate-fade-in">
                      <Textarea
                        placeholder={`Leave a note for ${restaurantName} (optional)`}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <Button
                        onClick={handleSubmitReview}
                        disabled={reviewSubmitting}
                        className="w-full h-12 text-base font-semibold bg-purple text-white hover:bg-purple-hover"
                      >
                        {reviewSubmitting ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : null}
                        Submit review
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Fun Note — only when not terminal */}
          {!isTerminal && (
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-foreground">
                🍳 Outa will keep learning your preferences for next time.
              </p>
            </div>
          )}

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
