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
    <Card className="p-6 text-center bg-[#FAFAFA] rounded-2xl border border-border shadow-soft animate-fade-in-up animate-shimmer-border">
      <div className="relative flex flex-col items-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple/5 flex items-center justify-center animate-bounce-gentle">
          <ChefHat className="h-6 w-6 text-purple" />
        </div>
        <p className="text-sm font-semibold text-foreground animate-fade-in-text">{displayMessage}</p>
      </div>
    </Card>
  );
};

export default LoadingState;
