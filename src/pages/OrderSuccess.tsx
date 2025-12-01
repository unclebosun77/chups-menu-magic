import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurantName, totalAmount, itemCount } = location.state || {};

  if (!restaurantName) {
    navigate("/");
    return null;
  }

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
                <p className="text-3xl font-bold text-purple">${totalAmount?.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="text-2xl font-bold text-foreground">{itemCount}</p>
              </div>
            </div>
          </div>

          {/* Fun Note */}
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-foreground">
              🍳 Your order is being prepared with care. CHUPS AI will keep learning your preferences for next time.
            </p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => navigate("/discover")}
            className="w-full h-12 text-base font-semibold bg-purple text-white hover:bg-purple-hover"
          >
            Back to exploring 🍽️
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSuccess;
