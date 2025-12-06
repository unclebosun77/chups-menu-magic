import { LucideIcon } from "lucide-react";

interface FilterChipProps {
  label: string;
  icon?: LucideIcon;
  isActive?: boolean;
  onClick?: () => void;
  variant?: "default" | "glow";
}

const FilterChip = ({ 
  label, 
  icon: Icon, 
  isActive = false, 
  onClick,
  variant = "default"
}: FilterChipProps) => {
  const baseClasses = "flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium transition-all duration-250 whitespace-nowrap active:scale-95";
  
  const activeClasses = variant === "glow"
    ? "bg-gradient-to-r from-purple to-neon-pink text-white shadow-[0_4px_20px_-4px_rgba(139,92,246,0.5),0_0_15px_rgba(139,92,246,0.3)] border border-purple/50"
    : "bg-purple text-white shadow-[0_4px_16px_-4px_rgba(139,92,246,0.4)] border border-purple/30";
  
  const inactiveClasses = variant === "glow"
    ? "bg-card/80 backdrop-blur-md text-muted-foreground border border-border/40 hover:border-purple/30 hover:bg-purple/10 hover:text-foreground hover:shadow-[0_4px_12px_-4px_rgba(139,92,246,0.15)]"
    : "bg-card/60 backdrop-blur-sm text-muted-foreground/80 border border-border/30 hover:border-purple/20 hover:bg-card/80 hover:text-foreground";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {Icon && (
        <Icon 
          className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-purple/60'}`} 
          strokeWidth={1.5} 
        />
      )}
      {label}
    </button>
  );
};

export default FilterChip;
