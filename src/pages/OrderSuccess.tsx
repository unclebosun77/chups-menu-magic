import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, ChefHat, Flame, Utensils } from "lucide-react";
import { vibrate } from "@/utils/haptics";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurantName, totalAmount, itemCount } = location.state || {};
  const [currentStep, setCurrentStep] = useState(0);

  const trackingSteps = [
    { label: "Order received", icon: CheckCircle2, color: "text-purple" },
    { label: "Chef is prepping", icon: ChefHat, color: "text-orange-500" },
    { label: "Cooking…", icon: Flame, color: "text-red-500" },
    { label: "Ready to eat", icon: Utensils, color: "text-green-500" },
  ];

  useEffect(() => {
    // Haptic feedback on order success
    vibrate(30);

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < trackingSteps.length - 1) {
          vibrate(15);
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

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

          {/* Order Tracking Animation */}
          <div className="bg-muted/50 rounded-xl p-6 space-y-4">
            <p className="text-sm font-semibold text-foreground mb-4">Order Progress</p>
            <div className="space-y-3">
              {trackingSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index <= currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div
                    key={step.label}
                    className={`flex items-center gap-3 transition-all duration-500 ${
                      isActive ? "opacity-100" : "opacity-30"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                        isActive
                          ? `${step.color} border-current bg-current/10 ${isCurrent ? "animate-pulse" : ""}`
                          : "border-muted-foreground/20"
                      }`}
                    >
                      <StepIcon className={`h-5 w-5 ${isActive ? step.color : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                    </div>
                    {isCurrent && (
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fun Note */}
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-foreground">
              🍳 CHUPS AI will keep learning your preferences for next time.
            </p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => navigate("/")}
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
