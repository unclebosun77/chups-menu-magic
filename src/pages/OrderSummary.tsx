import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Minus, Plus, Trash2, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOrder } from "@/context/OrderContext";

const OrderSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { orderItems, updateQuantity, removeFromOrder, totalAmount, totalItems, clearOrder } = useOrder();
  
  const { restaurantName, restaurantId } = location.state || {};
  
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  if (!restaurantName) {
    navigate("/discover");
    return null;
  }

  const handlePlaceOrder = () => {
    if (!customerName || !customerPhone) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and phone number",
        variant: "destructive",
      });
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: "Empty Order",
        description: "Please add items to your order",
        variant: "destructive",
      });
      return;
    }

    // Navigate to success page and clear order
    navigate("/order-success", {
      state: {
        restaurantName,
        totalAmount,
        itemCount: totalItems,
      },
    });
    clearOrder();
  };

  return (
    <div className="min-h-screen bg-gradient-app pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center gap-3 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Order Summary</h1>
              <p className="text-xs text-muted-foreground">{restaurantName}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Order Items */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Your Order</h2>
            {orderItems.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Your order is empty</p>
                <Button
                  variant="link"
                  onClick={() => navigate(-1)}
                  className="mt-2"
                >
                  Continue Shopping
                </Button>
              </Card>
            ) : (
              orderItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1">{item.name}</h3>
                        <p className="text-lg font-bold text-primary mb-2">
                          ${item.price.toFixed(2)}
                        </p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-semibold w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromOrder(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Customer Information */}
          {orderItems.length > 0 && (
            <>
              <div className="space-y-3">
                <h2 className="text-xl font-bold">Your Information</h2>
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your full name"
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="(123) 456-7890"
                        className="h-12"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Order Note */}
              <Card className="p-4 bg-gradient-purple-glow border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
                    <Rocket className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium">
                    Order gets sent straight to the kitchen 🚀
                  </p>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Fixed Bottom Bar */}
        {orderItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg">
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold">Total ({totalItems} items)</span>
                <span className="text-2xl font-bold text-primary">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <Button
                onClick={handlePlaceOrder}
                className="w-full h-12 text-base font-semibold bg-purple text-white hover:bg-purple-hover"
              >
                Place Order
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
