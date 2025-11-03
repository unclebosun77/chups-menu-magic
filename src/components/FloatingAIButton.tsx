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
      className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-40"
    >
      <Sparkles className="h-6 w-6" />
    </Button>
  );
};

export default FloatingAIButton;
