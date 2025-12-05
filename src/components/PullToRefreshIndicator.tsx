import { RefreshCw } from "lucide-react";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

const PullToRefreshIndicator = ({
  pullDistance,
  isRefreshing,
  threshold = 80,
}: PullToRefreshIndicatorProps) => {
  if (pullDistance === 0 && !isRefreshing) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 180;
  const scale = 0.5 + progress * 0.5;
  const opacity = Math.min(progress * 1.5, 1);

  return (
    <div
      className="absolute left-0 right-0 flex justify-center z-50 pointer-events-none"
      style={{
        top: 0,
        transform: `translateY(${pullDistance - 40}px)`,
        transition: isRefreshing ? "none" : pullDistance === 0 ? "transform 0.3s ease-out" : "none",
      }}
    >
      <div
        className="w-10 h-10 rounded-full bg-card border border-border/50 shadow-lg flex items-center justify-center"
        style={{
          opacity,
          transform: `scale(${scale})`,
          transition: pullDistance === 0 ? "all 0.3s ease-out" : "none",
        }}
      >
        <RefreshCw
          className={`h-5 w-5 text-purple ${isRefreshing ? "animate-spin" : ""}`}
          style={{
            transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
            transition: isRefreshing ? "none" : "transform 0.1s ease-out",
          }}
        />
      </div>
    </div>
  );
};

export default PullToRefreshIndicator;
