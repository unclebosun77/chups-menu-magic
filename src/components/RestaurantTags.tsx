import { RestaurantTag } from '@/utils/aiTagging';
import { cn } from '@/lib/utils';

interface RestaurantTagsProps {
  tags: RestaurantTag[];
  variant?: 'default' | 'compact' | 'minimal';
  maxTags?: number;
  className?: string;
  animated?: boolean;
}

const categoryColors: Record<RestaurantTag['category'], string> = {
  vibe: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  dietary: 'bg-green-500/20 text-green-300 border-green-500/30',
  occasion: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  price: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  time: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

const RestaurantTags = ({ 
  tags, 
  variant = 'default', 
  maxTags = 4,
  className,
  animated = true 
}: RestaurantTagsProps) => {
  const displayTags = tags.slice(0, maxTags);
  const remainingCount = tags.length - maxTags;

  if (variant === 'minimal') {
    return (
      <div className={cn("flex flex-wrap gap-1", className)}>
        {displayTags.map((tag, index) => (
          <span
            key={tag.label}
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/70",
              animated && "animate-fade-in",
            )}
            style={animated ? { animationDelay: `${index * 50}ms` } : undefined}
          >
            {tag.label}
          </span>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-wrap gap-1.5", className)}>
        {displayTags.map((tag, index) => (
          <span
            key={tag.label}
            className={cn(
              "text-xs px-2 py-0.5 rounded-full border",
              categoryColors[tag.category],
              animated && "animate-fade-in",
            )}
            style={animated ? { animationDelay: `${index * 60}ms` } : undefined}
          >
            {tag.label}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
            +{remainingCount}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {displayTags.map((tag, index) => (
        <div
          key={tag.label}
          className={cn(
            "group relative px-3 py-1.5 rounded-full border text-sm font-medium",
            "transition-all duration-200 hover:scale-105",
            categoryColors[tag.category],
            animated && "animate-scale-in",
          )}
          style={animated ? { animationDelay: `${index * 80}ms` } : undefined}
        >
          <span>{tag.label}</span>
          {tag.confidence >= 80 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
        </div>
      ))}
      {remainingCount > 0 && (
        <span className="px-3 py-1.5 rounded-full bg-white/5 text-white/40 text-sm border border-white/10">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
};

export default RestaurantTags;
