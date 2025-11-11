import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconTileProps {
  icon?: LucideIcon;
  emoji?: string;
  label: string;
  onClick?: () => void;
  className?: string;
}

export const IconTile = ({ icon: Icon, emoji, label, onClick, className }: IconTileProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center",
        "bg-gradient-to-br from-background to-muted/20",
        "rounded-2xl border border-border/50",
        "p-4 gap-2.5 min-w-[110px]",
        "hover:shadow-lg hover:scale-[1.02] hover:border-primary/30",
        "transition-all duration-300 ease-out",
        "active:scale-95",
        "backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
        {emoji ? (
          <span className="text-2xl">{emoji}</span>
        ) : Icon ? (
          <Icon className="h-5 w-5 text-primary" strokeWidth={2.5} />
        ) : null}
      </div>
      <span className="text-[11px] font-semibold text-foreground text-center leading-tight whitespace-nowrap">
        {label}
      </span>
    </button>
  );
};
