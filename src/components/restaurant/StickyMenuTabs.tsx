import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface StickyMenuTabsProps {
  categories: string[];
  categoryLabels: Record<string, string>;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  isSticky?: boolean;
}

const categoryIcons: Record<string, string> = {
  all: "🍽️",
  starters: "🥗",
  mains: "🍛",
  sides: "🍟",
  desserts: "🍰",
  drinks: "🍹",
  specials: "⭐",
};

const StickyMenuTabs = ({ 
  categories, 
  categoryLabels, 
  selectedCategory, 
  onSelectCategory,
  isSticky = false
}: StickyMenuTabsProps) => {
  return (
    <div className={cn(
      "transition-all duration-300",
      isSticky 
        ? "fixed top-0 left-0 right-0 z-40 bg-background/98 backdrop-blur-xl border-b border-border/40 shadow-lg py-3 px-4" 
        : "py-2"
    )}>
      <ScrollArea className="w-full">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={cn(
                "shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-medium transition-all duration-200",
                selectedCategory === cat 
                  ? "bg-purple text-white shadow-md shadow-purple/25" 
                  : "bg-card text-foreground hover:bg-secondary/70 border border-border/50"
              )}
            >
              <span className="text-sm">{categoryIcons[cat] || "📌"}</span>
              <span>{categoryLabels[cat]}</span>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
};

export default StickyMenuTabs;
