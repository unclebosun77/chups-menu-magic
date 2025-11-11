import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconTileProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const IconTile = ({
  icon: Icon,
  label,
  description,
  onClick,
  className,
  size = "md"
}: IconTileProps) => {
  const sizeClasses = {
    sm: "h-20",
    md: "h-24",
    lg: "h-28"
  };

  const iconSizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl bg-background border border-border/50 transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95 p-4",
        sizeClasses[size],
        className
      )}
      style={{
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)"
      }}
    >
      <div className="relative">
        {/* Isometric shadow effect */}
        <div 
          className="absolute inset-0 rounded-xl bg-purple/5 transform translate-y-1 translate-x-1"
          style={{ filter: "blur(4px)" }}
        />
        
        {/* Icon container with gradient */}
        <div className="relative rounded-xl bg-gradient-to-br from-purple/10 via-purple/5 to-transparent p-2.5 backdrop-blur-sm">
          <Icon className={cn("text-purple", iconSizeClasses[size])} strokeWidth={1.5} />
        </div>
      </div>
      
      <div className="text-center w-full">
        <p className="text-xs font-medium text-foreground line-clamp-1">{label}</p>
        {description && (
          <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{description}</p>
        )}
      </div>
    </button>
  );
};

export default IconTile;
