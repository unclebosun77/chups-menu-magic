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
        className="fixed bottom-24 right-5 h-14 w-14 rounded-full bg-purple shadow-lg hover:shadow-xl hover:scale-105 transition-all z-40"
      >
        <Rocket className="h-6 w-6 text-white" />
      </Button>
      <AIAssistantModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

export default FloatingAIButton;
