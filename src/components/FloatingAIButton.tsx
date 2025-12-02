import { useState } from "react";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import AIAssistantModal from "./AIAssistantModal";

const FloatingAIButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-20 right-4 h-16 w-16 rounded-full bg-gradient-warm shadow-glow hover:shadow-hover hover:scale-105 transition-all z-40 animate-pulse-glow"
      >
        <Rocket className="h-7 w-7 text-white" />
      </Button>
      <AIAssistantModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

export default FloatingAIButton;
