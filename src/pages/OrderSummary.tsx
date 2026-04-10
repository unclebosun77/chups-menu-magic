import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Minus, Plus, Trash2, Rocket, Loader2, CreditCard, Landmark, Split } from "lucide-react";
import { toast } from "sonner";
import BillSplitter from "@/components/order/BillSplitter";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  tags?: string[];
}

const OrderSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const { restaurantName, restaurantId, items: initialItems, tableNumber } = location.state || {};
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialItems || []);
  const [customerName, setCustomerName] = useState(user?.email?.split('@')[0] || "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showSplitBill, setShowSplitBill] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  if (!restaurantName || !restaurantId) {
    navigate("/");
    return null;
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setOrderItems(orderItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
    toast("Item removed from your order");
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const validateOrder = () => {
    if (!customerName.trim()) {
      toast.error("Please enter your name");
      return false;
    }
    if (orderItems.length === 0) {
      toast.error("Please add items to your order");
      return false;
    }
    return true;
  };

  const createOrder = async () => {
    const orderId = crypto.randomUUID();
    const insertPayload = {
      id: orderId,
      restaurant_id: restaurantId,
      user_id: user?.id || null,
      customer_name: customerName,
      customer_email: customerEmail || null,
      customer_phone: customerPhone || null,
      items: orderItems.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
      total: totalAmount,
      status: "pending",
    };

    console.log("[OrderSummary] Inserting order:", insertPayload);

    const { error } = await supabase
      .from("orders")
      .insert(insertPayload);

    if (error) {
      console.error('Order insert error:', JSON.stringify(error));
      throw new Error(error.message || 'Failed to create order');
    }

    console.log("[OrderSummary] Order created successfully:", orderId);
    return { id: orderId };
  };

  const handlePayAtTable = async () => {
    if (!validateOrder()) return;
    setIsSubmitting(true);
    try {
      const data = await createOrder();
      navigate("/order-success", {
        state: {
          orderId: data?.id,
          restaurantName,
          restaurantId,
          totalAmount: orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          itemCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
          paymentMethod: "pos",
          tableNumber,
        },
      });
    } catch (error: any) {
      console.error("[OrderSummary] handlePayAtTable error:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayNow = async () => {
    if (!validateOrder()) return;
    setPaymentProcessing(true);
    try {
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (!stripeKey) {
        toast.error("Online payments aren't set up yet — use Pay at table");
        setPaymentProcessing(false);
        return;
      }

      const orderData = await createOrder();
      const orderId = orderData?.id;

      const { data: piData, error: piError } = await supabase.functions.invoke("create-payment-intent", {
        body: {
          amount: Math.round(totalAmount * 100),
          restaurantId,
          orderId,
        },
      });

      if (piError || !piData?.clientSecret) {
        console.error("[OrderSummary] Payment intent error:", piError);
        throw new Error(piError?.message || "Failed to create payment intent");
      }

      const { loadStripe } = await import("@stripe/stripe-js");
      const stripe = await loadStripe(stripeKey);
      if (!stripe) throw new Error("Stripe failed to load");

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(piData.clientSecret, {
        payment_method: {
          card: { token: "tok_visa" } as any,
        },
      });

      if (stripeError) throw new Error(stripeError.message);

      if (paymentIntent?.status === "succeeded") {
        await supabase.from("orders").update({ payment_status: "paid" }).eq("id", orderId);
        navigate("/order-success", {
          state: {
            orderId,
            restaurantName,
            restaurantId,
            totalAmount,
            itemCount: totalItems,
            paymentMethod: "stripe",
            tableNumber,
          },
        });
      }
    } catch (error: any) {
      console.error("[OrderSummary] Payment error:", error);
      toast.error(error.message || "Payment could not be processed");
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-app pb-32">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Order Summary</h1>
              <p className="text-xs text-muted-foreground">{restaurantName}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* 1. Order Items */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Your Order</h2>
            {orderItems.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Your order is empty</p>
                <Button variant="link" onClick={() => navigate(-1)} className="mt-2">Continue Shopping</Button>
              </Card>
            ) : (
              orderItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1">{item.name}</h3>
                        <p className="text-lg font-bold text-primary mb-2">£{item.price.toFixed(2)}</p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-semibold w-8 text-center">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {orderItems.length > 0 && (
            <>
              {/* 2. Order Total */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total ({totalItems} items)</span>
                  <span className="text-2xl font-bold text-primary">£{totalAmount.toFixed(2)}</span>
                </div>
              </Card>

              {/* 3. Customer Details */}
              <div className="space-y-3">
                <h2 className="text-xl font-bold">Your Information</h2>
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Your full name" className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (optional)</Label>
                      <Input id="phone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="(123) 456-7890" className="h-12" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Kitchen note */}
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
                    <Rocket className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Order gets sent straight to the kitchen 🚀</p>
                </div>
              </Card>

              {/* 4. Payment Buttons — inline, not fixed */}
              <div className="space-y-3">
                <Button
                  variant="purple"
                  onClick={handlePayAtTable}
                  disabled={paymentProcessing || isSubmitting}
                  className="w-full h-14 text-base font-semibold"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Landmark className="h-5 w-5 mr-2" />
                  )}
                  Pay at table — £{totalAmount.toFixed(2)}
                </Button>

                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    onClick={handlePayNow}
                    disabled={paymentProcessing || isSubmitting}
                    className="w-full h-12 text-base font-semibold"
                  >
                    {paymentProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    Pay now with card
                  </Button>
                  {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY && (
                    <p className="text-[10px] text-muted-foreground text-center">Powered by Stripe</p>
                  )}
                </div>
              </div>

              {/* 5. Split Bill — collapsible */}
              <div className="pt-2">
                <Separator className="mb-4" />
                {!showSplitBill ? (
                  <button
                    onClick={() => setShowSplitBill(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border hover:border-purple/40 hover:bg-purple/5 transition-all text-sm text-muted-foreground hover:text-purple"
                  >
                    <Split className="h-4 w-4" />
                    Split the bill with your group
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Splitting is optional — your order is already placed above</p>
                      <button onClick={() => setShowSplitBill(false)} className="text-xs text-muted-foreground hover:text-foreground underline">Hide</button>
                    </div>
                    <BillSplitter items={orderItems} totalAmount={totalAmount} restaurantName={restaurantName} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
