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
        className="fixed bottom-20 right-4 h-16 w-16 rounded-full shadow-glow hover:shadow-hover transition-all z-40 animate-pulse-glow"
      >
        <Sparkles className="h-7 w-7" />
      </Button>
      <AIAssistantModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

export default FloatingAIButton;
