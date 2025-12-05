import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CategoryTabsProps {
  categories: string[];
  categoryLabels: Record<string, string>;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  isSticky?: boolean;
}

const CategoryTabs = ({ 
  categories, 
  categoryLabels, 
  selectedCategory, 
  onSelectCategory,
  isSticky = false
}: CategoryTabsProps) => {
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active tab into view when selection changes
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "nearest", 
        inline: "center" 
      });
    }
  }, [selectedCategory]);

  return (
    <div className={`${
      isSticky 
        ? 'fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 px-5 py-3 shadow-sm' 
        : ''
    }`}>
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <Button
                key={cat}
                ref={isActive ? activeRef : undefined}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectCategory(cat)}
                className={`rounded-full text-xs whitespace-nowrap font-medium transition-all ${
                  isActive 
                    ? "bg-purple hover:bg-purple/90 text-white shadow-md" 
                    : "border-border/50 hover:bg-secondary/50 hover:border-purple/30"
                }`}
              >
                {categoryLabels[cat] || cat}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default CategoryTabs;
