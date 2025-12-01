import { useState, useRef, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { vibrate } from "@/utils/haptics";

interface SwipeableDishRowProps {
  children: ReactNode;
  onAddToOrder: () => void;
  onView: () => void;
}

export const SwipeableDishRow = ({ children, onAddToOrder, onView }: SwipeableDishRowProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    
    // Limit swipe range
    const maxSwipe = 120;
    const clampedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diff));
    setTranslateX(clampedDiff);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    
    // If swiped far enough, trigger action
    if (translateX < -60) {
      vibrate(20);
      onAddToOrder();
    } else if (translateX > 60) {
      vibrate(20);
      onView();
    }
    
    // Reset position
    setTranslateX(0);
  };

  // Desktop fallback - just show the content normally
  const isMobile = 'ontouchstart' in window;

  if (!isMobile) {
    return <div>{children}</div>;
  }

  return (
    <div className="relative overflow-hidden">
      {/* Left action (swipe right to reveal) */}
      <div
        className="absolute left-0 top-0 h-full flex items-center justify-start pl-4"
        style={{
          opacity: translateX > 0 ? Math.min(translateX / 60, 1) : 0,
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-primary/10 text-primary"
        >
          <Eye className="h-5 w-5" />
        </Button>
      </div>

      {/* Right action (swipe left to reveal) */}
      <div
        className="absolute right-0 top-0 h-full flex items-center justify-end pr-4"
        style={{
          opacity: translateX < 0 ? Math.min(Math.abs(translateX) / 60, 1) : 0,
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-purple/10 text-purple"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Main content */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateX(${translateX}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};
