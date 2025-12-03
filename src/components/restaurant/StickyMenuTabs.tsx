import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface StickyMenuTabsProps {
  categories: string[];
  categoryLabels: Record<string, string>;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  isSticky?: boolean;
}

const StickyMenuTabs = ({ 
  categories, 
  categoryLabels, 
  selectedCategory, 
  onSelectCategory,
  isSticky = false
}: StickyMenuTabsProps) => {
  return (
    <div className={`transition-all duration-200 ${
      isSticky 
        ? "fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm py-3 px-4" 
        : "py-2"
    }`}>
      <ScrollArea className="w-full">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${
                selectedCategory === cat 
                  ? "bg-purple text-white shadow-sm" 
                  : "bg-secondary/50 text-foreground hover:bg-secondary border border-border/40"
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default StickyMenuTabs;
