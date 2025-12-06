import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingAIButtonProps {
  className?: string;
}

const FloatingAIButton = ({ className }: FloatingAIButtonProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/chat')}
      className={cn(
        "fixed bottom-24 right-4 z-40",
        "w-14 h-14 rounded-full",
        "bg-gradient-to-br from-purple to-neon-pink",
        "flex items-center justify-center",
        "shadow-lg shadow-purple/40",
        "transition-all hover:scale-110 active:scale-95",
        className
      )}
    >
      <Sparkles className="h-6 w-6 text-white" />
      
      {/* Ripple effect */}
      <span className="absolute inset-0 rounded-full bg-purple/30 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
    </button>
  );
};

export default FloatingAIButton;
