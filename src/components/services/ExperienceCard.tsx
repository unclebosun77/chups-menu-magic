import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExperienceCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  route: string;
  image?: string;
  tags?: string[];
  distance?: string;
  variant?: "featured" | "grid" | "horizontal";
  badge?: string;
  delay?: number;
}

const ExperienceCard = ({
  icon: Icon,
  title,
  subtitle,
  route,
  image,
  tags = [],
  distance,
  variant = "grid",
  badge,
  delay = 0
}: ExperienceCardProps) => {
  const navigate = useNavigate();

  if (variant === "featured") {
    return (
      <button
        onClick={() => navigate(route)}
        className="w-full relative overflow-hidden flex items-center gap-4 p-5 bg-gradient-to-br from-purple/15 via-purple/8 to-background border border-purple/15 rounded-3xl backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(139,92,246,0.25),0_0_0_1px_rgba(139,92,246,0.08)] hover:shadow-[0_16px_48px_-8px_rgba(139,92,246,0.35),0_0_24px_rgba(139,92,246,0.12)] hover:border-purple/30 hover:scale-[1.015] transition-all duration-350 active:scale-[0.98] group animate-fade-in"
        style={{ animationDelay: `${delay}ms` }}
      >
        {/* Glassmorphic shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple/8 via-transparent to-neon-pink/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple/15 rounded-full blur-3xl pointer-events-none" />
        
        {/* Image or Icon container */}
        {image ? (
          <div className="relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]">
            <img src={image} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        ) : (
          <div className="relative flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple/25 to-neon-pink/15 backdrop-blur-sm flex items-center justify-center shadow-[0_4px_20px_-4px_rgba(139,92,246,0.35),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-purple/20">
            <Icon className="h-7 w-7 text-purple transition-all duration-300 group-hover:scale-110" strokeWidth={1.5} />
          </div>
        )}
        
        {/* Content */}
        <div className="relative flex-1 text-left">
          {badge && (
            <span className="inline-block text-[9px] font-bold text-purple tracking-wider uppercase mb-1.5 px-2 py-0.5 rounded-full bg-purple/15 border border-purple/20">
              {badge}
            </span>
          )}
          <p className="text-[17px] font-semibold text-foreground tracking-tight">{title}</p>
          <p className="text-[12px] text-muted-foreground/70 mt-0.5 font-light">{subtitle}</p>
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-purple/10 text-purple/80 border border-purple/15">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {distance && (
            <span className="text-[10px] text-muted-foreground/50 mt-2 block">{distance}</span>
          )}
        </div>
        
        {/* Arrow */}
        <div className="relative w-10 h-10 rounded-full bg-purple/10 backdrop-blur-sm flex items-center justify-center border border-purple/15 group-hover:bg-purple/20 transition-all duration-300">
          <svg className="h-4 w-4 text-purple/70 group-hover:text-purple group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    );
  }

  if (variant === "horizontal") {
    return (
      <button
        onClick={() => navigate(route)}
        className="w-full relative overflow-hidden flex items-center gap-4 p-4 bg-gradient-to-br from-card/80 via-card/60 to-background/40 backdrop-blur-xl border border-border/30 rounded-2xl shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_28px_-8px_rgba(139,92,246,0.22)] hover:border-purple/25 hover:scale-[1.01] transition-all duration-300 active:scale-[0.98] group animate-fade-in"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-purple/8 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-purple/15 to-purple/5 flex items-center justify-center border border-purple/15">
          <Icon className="h-6 w-6 text-purple/80 transition-all duration-300 group-hover:scale-110 group-hover:text-purple" strokeWidth={1.5} />
        </div>
        
        <div className="relative flex-1 text-left">
          <span className="text-[15px] font-semibold text-foreground tracking-tight">{title}</span>
          <span className="block text-[11px] text-muted-foreground/60 mt-0.5 font-light">{subtitle}</span>
        </div>
        
        <div className="relative w-9 h-9 rounded-full bg-purple/8 flex items-center justify-center group-hover:bg-purple/15 transition-colors">
          <svg className="h-4 w-4 text-purple/50 group-hover:translate-x-0.5 group-hover:text-purple/70 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    );
  }

  // Grid variant (default)
  return (
    <button
      onClick={() => navigate(route)}
      className="relative flex flex-col items-start gap-3 p-4 bg-gradient-to-br from-card/80 via-card/50 to-background/30 backdrop-blur-xl border border-border/30 rounded-2xl shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(139,92,246,0.03)] hover:shadow-[0_12px_36px_-8px_rgba(139,92,246,0.22),0_0_16px_rgba(139,92,246,0.08)] hover:border-purple/25 hover:scale-[1.03] transition-all duration-300 active:scale-[0.97] group animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle glow on hover */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple/10 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Floating icon */}
      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple/15 via-purple/10 to-transparent backdrop-blur-sm flex items-center justify-center shadow-[0_3px_12px_-3px_rgba(139,92,246,0.2),inset_0_1px_1px_rgba(255,255,255,0.05)] border border-purple/15 group-hover:shadow-[0_6px_20px_-4px_rgba(139,92,246,0.3)]">
        <Icon className="h-5 w-5 text-purple/80 transition-all duration-300 group-hover:scale-110 group-hover:text-purple" strokeWidth={1.5} />
      </div>
      
      {/* Text */}
      <div className="relative flex flex-col items-start mt-1">
        <span className="text-[14px] font-semibold text-foreground tracking-tight leading-tight">
          {title}
        </span>
        <span className="text-[10px] text-muted-foreground/55 mt-1.5 font-light tracking-wide leading-relaxed">
          {subtitle}
        </span>
        
        {distance && (
          <span className="text-[9px] text-purple/50 mt-2 font-medium">{distance}</span>
        )}
      </div>
    </button>
  );
};

export default ExperienceCard;
