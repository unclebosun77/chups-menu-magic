import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FloatingAIButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/ai-assistant")}
      size="icon"
      className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-gradient-purple-glow shadow-glow hover:shadow-glow hover:scale-110 transition-all z-40 animate-pulse-glow"
    >
      <Sparkles className="h-6 w-6 text-white" />
    </Button>
  );
};

export default FloatingAIButton;
