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
        "flex flex-col items-center justify-center gap-2 rounded-2xl bg-card-premium border border-white/10 transition-all duration-300 hover:shadow-premium-glow hover:scale-105 hover:border-purple-glow/50 active:scale-95 p-4 relative overflow-hidden group",
        sizeClasses[size],
        className
      )}
      style={{
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(139, 92, 246, 0.1)"
      }}
    >
      {/* Animated gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-glow/0 via-purple-glow/0 to-purple-glow/0 group-hover:from-purple-glow/10 group-hover:via-purple-glow/5 group-hover:to-transparent transition-all duration-500" />
      
      <div className="relative z-10">
        {/* Premium isometric shadow with glow */}
        <div 
          className="absolute inset-0 rounded-xl bg-purple-glow/20 transform translate-y-1 translate-x-1 group-hover:bg-purple-glow/30 transition-all duration-300"
          style={{ filter: "blur(6px)" }}
        />
        
        {/* Icon container with premium gradient and glow */}
        <div className="relative rounded-xl bg-gradient-to-br from-purple-glow/15 via-purple/10 to-transparent p-2.5 backdrop-blur-sm border border-white/5 group-hover:border-purple-glow/30 transition-all duration-300">
          <Icon className={cn("text-purple-glow drop-shadow-glow group-hover:scale-110 transition-transform duration-300", iconSizeClasses[size])} strokeWidth={1.5} />
        </div>
      </div>
      
      <div className="text-center w-full relative z-10">
        <p className="text-xs font-medium text-white line-clamp-1">{label}</p>
        {description && (
          <p className="text-[10px] text-white/60 line-clamp-1 mt-0.5">{description}</p>
        )}
      </div>
    </button>
  );
};

export default IconTile;
