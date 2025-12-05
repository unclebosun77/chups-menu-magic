import { useState, useRef, useEffect } from "react";
import { DemoMenuItem } from "@/data/demoRestaurantMenus";
import CategoryTabs from "./CategoryTabs";
import MenuCategory from "./MenuCategory";
import DishCard from "./DishCard";
import DishQuickViewModal from "./DishQuickViewModal";
import SignatureDishes from "./SignatureDishes";

interface MenuSectionProps {
  menu: DemoMenuItem[];
  signatureDishes: string[];
  onAddToOrder: (dish: DemoMenuItem, quantity: number) => void;
}

const CATEGORIES = ["all", "starters", "mains", "sides", "desserts", "drinks", "specials"];
const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  starters: "Starters",
  mains: "Mains",
  sides: "Sides",
  desserts: "Desserts",
  drinks: "Drinks",
  specials: "Specials"
};

const MenuSection = ({ menu, signatureDishes, onAddToOrder }: MenuSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isTabsSticky, setIsTabsSticky] = useState(false);
  const [selectedDish, setSelectedDish] = useState<DemoMenuItem | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get signature items from menu
  const signatureItems = menu.filter(item => 
    signatureDishes.some(sig => 
      item.name.toLowerCase().includes(sig.toLowerCase().split(" ")[0])
    )
  );

  // Filter menu by category
  const filteredMenu = selectedCategory === "all" 
    ? menu 
    : menu.filter(item => item.category === selectedCategory);

  // Group menu by category for "all" view
  const groupedMenu = menu.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, DemoMenuItem[]>);

  // Get available categories (ones that have items)
  const availableCategories = CATEGORIES.filter(cat => 
    cat === "all" || menu.some(item => item.category === cat)
  );

  // Handle sticky tabs
  useEffect(() => {
    const handleScroll = () => {
      if (menuRef.current) {
        const rect = menuRef.current.getBoundingClientRect();
        setIsTabsSticky(rect.top <= 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSelectDish = (dish: DemoMenuItem) => {
    setSelectedDish(dish);
    setShowQuickView(true);
  };

  const handleAddFromQuickView = (dish: DemoMenuItem, quantity: number) => {
    onAddToOrder(dish, quantity);
    setShowQuickView(false);
    setSelectedDish(null);
  };

  if (menu.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <p className="text-muted-foreground/60 text-sm">Menu coming soon</p>
      </div>
    );
  }

  return (
    <div ref={menuRef}>
      {/* Signature Dishes */}
      <SignatureDishes 
        dishes={signatureItems} 
        onSelectDish={handleSelectDish}
      />

      {/* Menu Header */}
      <div className="px-5 pb-4">
        <h2 className="text-lg font-bold tracking-tight">🍽️ Full Menu</h2>
      </div>

      {/* Category Tabs */}
      <div className="px-5 pb-4">
        <CategoryTabs
          categories={availableCategories}
          categoryLabels={CATEGORY_LABELS}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          isSticky={isTabsSticky}
        />
      </div>

      {/* Spacer when tabs are sticky */}
      {isTabsSticky && <div className="h-14" />}

      {/* Menu Content */}
      <div className="px-5">
        {selectedCategory === "all" ? (
          // Grouped view - show all categories
          Object.entries(groupedMenu)
            .sort(([a], [b]) => {
              const order = ["starters", "mains", "sides", "desserts", "drinks", "specials"];
              return order.indexOf(a) - order.indexOf(b);
            })
            .map(([category, dishes]) => (
              <MenuCategory
                key={category}
                title={CATEGORY_LABELS[category] || category}
                dishes={dishes}
                onSelectDish={handleSelectDish}
              />
            ))
        ) : (
          // Filtered view - single category
          <div className="space-y-3 pb-6">
            {filteredMenu.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onSelect={handleSelectDish}
              />
            ))}
            {filteredMenu.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground/60 text-sm">No items in this category</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <DishQuickViewModal
        dish={selectedDish}
        open={showQuickView}
        onOpenChange={setShowQuickView}
        onAddToOrder={handleAddFromQuickView}
      />
    </div>
  );
};

export default MenuSection;
