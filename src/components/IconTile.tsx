import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconTileProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
}

export const IconTile = ({ icon: Icon, label, onClick, className }: IconTileProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center",
        "bg-white rounded-xl border border-border",
        "p-3 gap-2",
        "hover:shadow-hover hover:scale-105 transition-all duration-200",
        "active:scale-95",
        "w-[72px]",
        className
      )}
    >
      <div className="flex items-center justify-center">
        <Icon className="h-6 w-6 text-purple" strokeWidth={2} />
      </div>
      <span className="text-[10px] font-medium text-foreground text-center leading-tight">
        {label}
      </span>
    </button>
  );
};
