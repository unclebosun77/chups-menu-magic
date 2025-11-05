import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FloatingAIButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/ai-assistant")}
      size="icon"
      variant="purple"
      className="fixed bottom-20 right-4 h-16 w-16 rounded-full shadow-glow hover:shadow-hover transition-all z-40 animate-pulse-glow"
    >
      <Sparkles className="h-7 w-7" />
    </Button>
  );
};

export default FloatingAIButton;
