import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SuccessStepProps {
  restaurantName: string;
}

const SuccessStep = ({ restaurantName }: SuccessStepProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-warm rounded-full p-6 shadow-glow animate-pulse-glow">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
        </div>
        <h2 className="text-4xl font-bold bg-gradient-warm bg-clip-text text-transparent">
          Restaurant successfully onboarded on CHUPS.
        </h2>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          <span className="font-semibold text-foreground">{restaurantName}</span> is now live on the platform
        </p>
      </div>

      <Card className="p-8 bg-gradient-purple-glow border-2 border-primary/20 shadow-hover">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-primary/10 rounded-full p-3">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-bold text-foreground">AI Taste Engine Activated</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Our AI taste engine will now learn your menu and elevate customer cravings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
            <div className="bg-green-500/10 rounded-full p-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">Smart Recommendations</h4>
              <p className="text-xs text-muted-foreground">
                Personalized dish suggestions for every customer
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
            <div className="bg-blue-500/10 rounded-full p-2">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">Taste Matching</h4>
              <p className="text-xs text-muted-foreground">
                Connect dishes with customer preferences
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <Button
          onClick={() => navigate("/restaurant/dashboard")}
          className="w-full h-14 text-lg font-semibold shadow-hover"
          size="lg"
        >
          Go to Dashboard
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/chups-intelligence")}
          className="w-full h-12 text-base"
        >
          Learn About CHUPS Intelligence
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Need help? Check out our{" "}
        <a href="#" className="text-primary hover:underline font-medium">
          restaurant guide
        </a>
      </p>
    </div>
  );
};

export default SuccessStep;
