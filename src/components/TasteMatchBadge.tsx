import { cn } from '@/lib/utils';

interface TasteMatchBadgeProps {
  score: number;
  variant?: 'default' | 'compact' | 'large';
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
}

const getScoreColor = (score: number): string => {
  if (score >= 90) return 'from-green-400 to-emerald-500';
  if (score >= 80) return 'from-purple-400 to-violet-500';
  if (score >= 70) return 'from-blue-400 to-indigo-500';
  if (score >= 60) return 'from-amber-400 to-orange-500';
  return 'from-gray-400 to-gray-500';
};

const getScoreLabel = (score: number): string => {
  if (score >= 90) return 'Perfect match';
  if (score >= 80) return 'Great match';
  if (score >= 70) return 'Good match';
  if (score >= 60) return 'Decent match';
  return 'Exploring';
};

const TasteMatchBadge = ({ 
  score, 
  variant = 'default', 
  showLabel = false,
  className,
  animated = true 
}: TasteMatchBadgeProps) => {
  const colorClass = getScoreColor(score);

  if (variant === 'compact') {
    return (
      <div 
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
          "bg-gradient-to-r text-white shadow-lg",
          colorClass,
          animated && "animate-scale-in",
          className
        )}
      >
        <span>{score}%</span>
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div 
        className={cn(
          "flex flex-col items-center gap-1 p-4 rounded-2xl",
          "bg-gradient-to-br from-white/10 to-white/5 border border-white/10",
          animated && "animate-scale-in",
          className
        )}
      >
        <div className={cn("text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent", colorClass)}>
          {score}%
        </div>
        <div className="text-sm text-white/70">{getScoreLabel(score)}</div>
        <div className="w-full mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={cn("h-full bg-gradient-to-r rounded-full transition-all duration-1000", colorClass)}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold",
        "bg-gradient-to-r text-white shadow-lg",
        colorClass,
        animated && "animate-scale-in",
        className
      )}
    >
      <span>{score}%</span>
      {showLabel && <span className="text-white/80 font-normal">match</span>}
    </div>
  );
};

export default TasteMatchBadge;
