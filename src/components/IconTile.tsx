import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconTileProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
  emoji?: string;
}

export const IconTile = ({ icon: Icon, label, onClick, className, emoji }: IconTileProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center relative overflow-hidden",
        "bg-gradient-to-br from-white to-purple/5 backdrop-blur-sm",
        "rounded-2xl border border-purple/10 shadow-soft",
        "p-4 gap-2 min-w-[90px]",
        "hover:shadow-hover hover:scale-105 hover:border-purple/30 hover:-translate-y-1",
        "active:scale-95 active:translate-y-0",
        "transition-all duration-300 ease-out",
        "group",
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple/0 via-purple/0 to-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon container with animation */}
      <div className="relative flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
        {emoji ? (
          <span className="text-3xl filter drop-shadow-sm">{emoji}</span>
        ) : (
          <Icon className="h-7 w-7 text-purple group-hover:text-purple-hover transition-colors duration-300" strokeWidth={2.5} />
        )}
      </div>
      
      {/* Label */}
      <span className="relative text-[9px] font-medium text-foreground text-center leading-tight group-hover:text-purple transition-colors duration-300">
        {label}
      </span>
    </button>
  );
};
