import { Card } from "@/components/ui/card";
import { ChefHat } from "lucide-react";

const loadingMessages = [
  "Cooking up something tasty… 👨🏽‍🍳",
  "Prepping your feed… 🍲",
  "Tasting options nearby… 🌍",
  "Adding a pinch of flavor… ✨",
  "Stirring up recommendations… 🥄",
];

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message }: LoadingStateProps) => {
  const displayMessage = message || loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

  return (
    <Card className="p-8 text-center bg-gradient-purple-glow rounded-2xl border border-border shadow-soft">
      <div className="relative">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple/5 flex items-center justify-center">
          <ChefHat className="h-8 w-8 text-purple animate-bounce" />
        </div>
        <p className="text-base font-semibold text-foreground animate-pulse">{displayMessage}</p>
      </div>
    </Card>
  );
};

export default LoadingState;
