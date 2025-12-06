import { LucideIcon, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  route: string;
  variant?: "hero" | "standard" | "compact";
  badge?: string;
  delay?: number;
}

const ServiceCard = ({ 
  icon: Icon, 
  title, 
  description, 
  route, 
  variant = "standard",
  badge,
  delay = 0 
}: ServiceCardProps) => {
  const navigate = useNavigate();

  if (variant === "hero") {
    return (
      <button
        onClick={() => navigate(route)}
        className="w-full relative overflow-hidden flex items-center gap-4 p-5 bg-gradient-to-br from-purple/20 via-purple/10 to-background border border-purple/20 rounded-3xl backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(139,92,246,0.3),0_0_0_1px_rgba(139,92,246,0.1)] hover:shadow-[0_16px_48px_-8px_rgba(139,92,246,0.4),0_0_20px_rgba(139,92,246,0.15)] hover:border-purple/40 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] group animate-fade-in"
        style={{ animationDelay: `${delay}ms` }}
      >
        {/* Glassmorphic glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple/10 via-transparent to-neon-pink/5 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple/20 rounded-full blur-3xl pointer-events-none group-hover:bg-purple/30 transition-colors" />
        
        {/* Premium icon container */}
        <div className="relative flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple/30 to-neon-pink/20 backdrop-blur-sm flex items-center justify-center shadow-[0_4px_20px_-4px_rgba(139,92,246,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-purple/20">
          <Icon className="h-6 w-6 text-purple transition-all duration-300 group-hover:scale-110 group-hover:text-white" strokeWidth={1.5} />
        </div>
        
        {/* Content */}
        <div className="relative flex-1 text-left">
          {badge && (
            <span className="inline-block text-[9px] font-bold text-purple tracking-wider uppercase mb-1 px-2 py-0.5 rounded-full bg-purple/10 border border-purple/20">
              {badge}
            </span>
          )}
          <p className="text-[17px] font-semibold text-foreground tracking-tight">{title}</p>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5 font-light">{description}</p>
        </div>
        
        {/* Arrow with glow */}
        <div className="relative w-10 h-10 rounded-full bg-purple/10 backdrop-blur-sm flex items-center justify-center border border-purple/20 group-hover:bg-purple/20 group-hover:border-purple/30 transition-all duration-300">
          <ChevronRight className="h-5 w-5 text-purple/70 group-hover:text-purple group-hover:translate-x-0.5 transition-all duration-300" strokeWidth={1.5} />
        </div>
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={() => navigate(route)}
        className="w-full flex items-center gap-3.5 p-3.5 bg-gradient-to-br from-card/80 to-background/60 backdrop-blur-md border border-border/40 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_-8px_rgba(139,92,246,0.25)] hover:border-purple/30 hover:bg-card/90 transition-all duration-250 active:scale-[0.98] group animate-fade-in"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple/15 to-purple/5 flex items-center justify-center border border-purple/10">
          <Icon className="h-[18px] w-[18px] text-purple/80 transition-all duration-200 group-hover:scale-110 group-hover:text-purple" strokeWidth={1.5} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-[13px] font-medium text-foreground tracking-tight">{title}</p>
          <p className="text-[10px] text-muted-foreground/50 mt-0.5 font-light">{description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-purple/60 group-hover:translate-x-0.5 transition-all duration-200" strokeWidth={1.5} />
      </button>
    );
  }

  // Standard variant
  return (
    <button
      onClick={() => navigate(route)}
      className="w-full relative overflow-hidden flex items-center gap-4 p-4 bg-gradient-to-br from-card/90 via-card/70 to-background/50 backdrop-blur-xl border border-border/30 rounded-2xl shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(139,92,246,0.05)] hover:shadow-[0_8px_32px_-8px_rgba(139,92,246,0.2),0_0_12px_rgba(139,92,246,0.08)] hover:border-purple/25 hover:scale-[1.01] transition-all duration-300 active:scale-[0.98] group animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle glow */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-purple/8 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Icon */}
      <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple/12 via-purple/8 to-transparent flex items-center justify-center border border-purple/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        <Icon className="h-5 w-5 text-purple/80 transition-all duration-200 group-hover:scale-110 group-hover:text-purple" strokeWidth={1.5} />
      </div>
      
      <div className="flex-1 text-left">
        <p className="text-[15px] font-medium text-foreground tracking-tight">{title}</p>
        <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-light">{description}</p>
      </div>
      
      <ChevronRight className="h-4.5 w-4.5 text-muted-foreground/30 group-hover:text-purple/50 group-hover:translate-x-0.5 transition-all duration-200" strokeWidth={1.5} />
    </button>
  );
};

export default ServiceCard;
