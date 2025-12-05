import { cn } from "@/lib/utils";

interface FilterPillProps {
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick: () => void;
}

const FilterPill = ({ label, icon, isActive, onClick }: FilterPillProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
        "border border-border/60",
        isActive
          ? "bg-purple text-primary-foreground border-purple shadow-md"
          : "bg-card text-foreground hover:bg-secondary/50 hover:border-purple/40"
      )}
    >
      {icon && <span className="text-sm">{icon}</span>}
      {label}
    </button>
  );
};

export default FilterPill;
