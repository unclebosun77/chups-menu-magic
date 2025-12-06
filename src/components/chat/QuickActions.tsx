import { cn } from '@/lib/utils';

interface QuickActionsProps {
  actions: string[];
  onSelect?: (action: string) => void;
}

const QuickActions = ({ actions, onSelect }: QuickActionsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide animate-slide-up" style={{ animationDelay: '300ms' }}>
      {actions.map((action, index) => (
        <button
          key={action}
          onClick={() => onSelect?.(action)}
          className={cn(
            "flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium",
            "bg-purple/10 border border-purple/30 text-purple",
            "hover:bg-purple/20 hover:border-purple/50 transition-all",
            "active:scale-95"
          )}
          style={{ animationDelay: `${400 + index * 50}ms` }}
        >
          {action}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
