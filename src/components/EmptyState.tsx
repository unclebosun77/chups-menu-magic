import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className 
}: EmptyStateProps) => {
  return (
    <Card className={cn(
      "p-8 text-center bg-gradient-purple-glow rounded-2xl border border-border shadow-soft overflow-hidden relative",
      className
    )}>
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-purple/3 to-transparent bg-[length:1000px_100%]" />
      <div className="relative">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple/5 flex items-center justify-center">
          <Icon className="h-8 w-8 text-purple animate-pulse" />
        </div>
        <p className="text-base font-bold mb-2 text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {actionLabel && onAction && (
          <Button 
            onClick={onAction}
            className="bg-purple hover:bg-purple-hover text-white shadow-hover"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default EmptyState;
