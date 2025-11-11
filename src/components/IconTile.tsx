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
        "flex flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-br from-white via-purple/5 to-white border-2 border-black/80 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-purple hover:from-purple/10 hover:via-purple/5 hover:to-white active:scale-95 p-5 relative overflow-hidden group",
        sizeClasses[size],
        className
      )}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple/0 via-transparent to-purple/0 opacity-0 group-hover:opacity-100 group-hover:from-purple/20 group-hover:to-transparent transition-all duration-500" />
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 bg-purple/5 blur-xl transition-opacity duration-500" />
      
      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* Icon container with gradient background */}
        <div className="relative rounded-2xl bg-gradient-to-br from-purple/10 via-white to-purple/5 p-3 border-2 border-black/20 group-hover:border-purple group-hover:from-purple/20 group-hover:to-purple/10 transition-all duration-300 shadow-sm">
          <Icon className={cn("text-purple group-hover:text-black group-hover:scale-110 transition-all duration-300", iconSizeClasses[size])} strokeWidth={2} />
        </div>
        
        {/* Label with gradient on hover */}
        <p className="text-sm font-semibold text-black group-hover:bg-gradient-to-r group-hover:from-purple group-hover:to-black group-hover:bg-clip-text group-hover:text-transparent line-clamp-1 transition-all duration-300">{label}</p>
        {description && (
          <p className="text-[10px] text-gray-600 group-hover:text-purple/70 line-clamp-1 transition-colors duration-300">{description}</p>
        )}
      </div>
    </button>
  );
};

export default IconTile;
