import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  type?: "horizontal" | "vertical" | "grid";
  className?: string;
}

const SkeletonCard = ({ type = "vertical", className }: SkeletonCardProps) => {
  if (type === "horizontal") {
    return (
      <Card className={cn("overflow-hidden bg-white animate-fade-in-up animate-shimmer-border", className)}>
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-purple/2 to-transparent bg-[length:1000px_100%]" />
        <div className="flex gap-3 p-2.5 relative">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-muted to-muted/50 animate-shimmer flex-shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-muted rounded-md animate-shimmer w-3/4" />
            <div className="h-3 bg-muted/60 rounded-md animate-shimmer w-1/2" />
          </div>
        </div>
      </Card>
    );
  }

  if (type === "grid") {
    return (
      <Card className={cn("overflow-hidden bg-white animate-fade-in-up animate-shimmer-border relative", className)}>
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-purple/2 to-transparent bg-[length:1000px_100%]" />
        <div className="relative h-32 bg-gradient-to-br from-muted to-muted/50 animate-shimmer" />
        <CardContent className="p-3 space-y-2 relative">
          <div className="h-4 bg-muted rounded-md animate-shimmer w-full" />
          <div className="h-3 bg-muted/60 rounded-md animate-shimmer w-2/3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden bg-white animate-fade-in-up animate-shimmer-border relative", className)}>
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-purple/2 to-transparent bg-[length:1000px_100%]" />
      <div className="relative h-40 bg-gradient-to-br from-muted to-muted/50 animate-shimmer" />
      <CardContent className="p-4 space-y-3 relative">
        <div className="h-4 bg-muted rounded-md animate-shimmer w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-muted/60 rounded-md animate-shimmer w-full" />
          <div className="h-3 bg-muted/60 rounded-md animate-shimmer w-2/3" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SkeletonCard;
