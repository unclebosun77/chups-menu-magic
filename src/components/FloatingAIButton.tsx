import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import AIAssistantModal from "./AIAssistantModal";

const FloatingAIButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        variant="purple"
        className="fixed bottom-20 right-4 h-16 w-16 rounded-full shadow-premium-glow hover:shadow-glow transition-all z-40 animate-pulse-glow bg-gradient-to-br from-purple-glow/20 via-purple/30 to-purple-glow/20 backdrop-blur-md border border-purple-glow/50 hover:scale-110 active:scale-95"
      >
        <Sparkles className="h-7 w-7 text-white drop-shadow-glow" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-glow/10 to-transparent animate-pulse-glow" />
      </Button>
      <AIAssistantModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

export default FloatingAIButton;
