import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  compact?: boolean;
}

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description,
  className,
  compact = false
}: EmptyStateProps) => {
  return (
    <Card className={cn(
      "text-center bg-[#FAFAFA] rounded-2xl border border-border shadow-soft overflow-hidden relative animate-fade-in-up animate-shimmer-border",
      compact ? "p-6" : "p-8",
      className
    )}>
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-purple/2 to-transparent bg-[length:1000px_100%]" />
      <div className="relative flex flex-col items-center">
        <div className={cn(
          "mx-auto rounded-full bg-purple/5 flex items-center justify-center animate-bounce-gentle",
          compact ? "w-12 h-12 mb-3" : "w-16 h-16 mb-4"
        )}>
          <Icon className={cn("text-purple", compact ? "h-6 w-6" : "h-8 w-8")} />
        </div>
        <p className={cn(
          "font-bold text-foreground animate-fade-in-text",
          compact ? "text-sm mb-1.5" : "text-base mb-2"
        )}>{title}</p>
        <p className={cn(
          "text-muted-foreground max-w-xs mx-auto animate-fade-in-subtext",
          compact ? "text-xs" : "text-sm"
        )}>{description}</p>
      </div>
    </Card>
  );
};

export default EmptyState;

