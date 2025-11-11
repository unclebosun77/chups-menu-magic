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
        "flex flex-col items-center justify-center gap-2 rounded-2xl bg-white border-2 border-black transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-purple active:scale-95 p-4 relative overflow-hidden group shadow-md",
        sizeClasses[size],
        className
      )}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple/0 via-purple/0 to-purple/0 group-hover:from-purple/5 group-hover:via-purple/3 group-hover:to-transparent transition-all duration-500" />
      
      <div className="relative z-10">
        {/* Icon container */}
        <div className="relative rounded-xl bg-gray-50 p-2.5 border border-black/10 group-hover:bg-purple/5 transition-all duration-300">
          <Icon className={cn("text-black group-hover:text-purple group-hover:scale-110 transition-all duration-300", iconSizeClasses[size])} strokeWidth={1.5} />
        </div>
      </div>
      
      <div className="text-center w-full relative z-10">
        <p className="text-xs font-medium text-black group-hover:text-purple line-clamp-1 transition-colors">{label}</p>
        {description && (
          <p className="text-[10px] text-gray-600 line-clamp-1 mt-0.5">{description}</p>
        )}
      </div>
    </button>
  );
};

export default IconTile;
