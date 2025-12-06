import { SuggestionReason } from '@/utils/outaSuggestEngine';
import { cn } from '@/lib/utils';

interface SuggestionReasonProps {
  reasons: SuggestionReason[];
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

const strengthStyles: Record<SuggestionReason['strength'], string> = {
  strong: 'text-purple-300 font-medium',
  medium: 'text-white/80',
  light: 'text-white/60',
};

const SuggestionReasonDisplay = ({ reasons, variant = 'default', className }: SuggestionReasonProps) => {
  if (reasons.length === 0) return null;

  if (variant === 'inline') {
    const primaryReason = reasons[0];
    return (
      <span className={cn("flex items-center gap-1 text-xs", strengthStyles[primaryReason.strength], className)}>
        <span>{primaryReason.icon}</span>
        <span>{primaryReason.text}</span>
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-1", className)}>
        {reasons.slice(0, 2).map((reason, index) => (
          <div 
            key={index}
            className={cn(
              "flex items-center gap-1.5 text-xs animate-fade-in",
              strengthStyles[reason.strength]
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="text-sm">{reason.icon}</span>
            <span>{reason.text}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2 p-3 rounded-xl bg-white/5 border border-white/10", className)}>
      <div className="text-xs text-white/50 uppercase tracking-wider font-medium">
        Why Outa suggests this
      </div>
      <div className="space-y-1.5">
        {reasons.map((reason, index) => (
          <div 
            key={index}
            className={cn(
              "flex items-center gap-2 text-sm animate-slide-up",
              strengthStyles[reason.strength]
            )}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <span className="text-base">{reason.icon}</span>
            <span>{reason.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionReasonDisplay;
