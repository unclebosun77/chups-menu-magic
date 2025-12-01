import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Flame, Leaf, Star, ChefHat, X } from "lucide-react";

const dietaryTags = [
  { value: "spicy", label: "Spicy", icon: Flame, color: "text-red-500" },
  { value: "vegan", label: "Vegan", icon: Leaf, color: "text-green-500" },
  { value: "popular", label: "Popular", icon: Star, color: "text-yellow-500" },
  { value: "chef-special", label: "Chef's Special", icon: ChefHat, color: "text-purple" }
];

interface MenuItem {
  id: string;
  name: string;
  price: string;
  tags: string[];
}

interface MenuBuilderStepProps {
  menuItems: MenuItem[];
  onUpdate: (items: MenuItem[]) => void;
}

const MenuBuilderStep = ({ menuItems, onUpdate }: MenuBuilderStepProps) => {
  const [currentItem, setCurrentItem] = useState<Partial<MenuItem>>({
    name: "",
    price: "",
    tags: []
  });

  const addItem = () => {
    if (!currentItem.name || !currentItem.price) return;
    
    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: currentItem.name,
      price: currentItem.price,
      tags: currentItem.tags || []
    };
    
    onUpdate([...menuItems, newItem]);
    setCurrentItem({ name: "", price: "", tags: [] });
  };

  const removeItem = (id: string) => {
    onUpdate(menuItems.filter(item => item.id !== id));
  };

  const toggleTag = (tag: string) => {
    const tags = currentItem.tags || [];
    const newTags = tags.includes(tag)
      ? tags.filter(t => t !== tag)
      : [...tags, tag];
    setCurrentItem({ ...currentItem, tags: newTags });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold bg-gradient-warm bg-clip-text text-transparent">
          Build Your Menu
        </h2>
        <p className="text-muted-foreground">
          Add dishes that represent your restaurant
        </p>
      </div>

      <Card className="p-6 space-y-5 border-2 shadow-soft">
        <div className="space-y-2">
          <Label htmlFor="dishName" className="text-base font-semibold">Dish Name *</Label>
          <Input
            id="dishName"
            value={currentItem.name || ""}
            onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
            placeholder="Grilled Chicken Pasta"
            className="h-12 text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="text-base font-semibold">Price *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={currentItem.price || ""}
              onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
              placeholder="12.99"
              className="h-12 pl-8 text-lg"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">Dietary Tags</Label>
          <div className="grid grid-cols-2 gap-3">
            {dietaryTags.map((tag) => {
              const Icon = tag.icon;
              const isSelected = currentItem.tags?.includes(tag.value);
              return (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => toggleTag(tag.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-soft"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? tag.color : "text-muted-foreground"}`} />
                  <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                    {tag.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Button
          type="button"
          onClick={addItem}
          disabled={!currentItem.name || !currentItem.price}
          className="w-full h-12 text-base gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Item to Menu
        </Button>
      </Card>

      {menuItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Menu ({menuItems.length} items)</h3>
          </div>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Card key={item.id} className="p-4 hover:shadow-soft transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-base">{item.name}</h4>
                      <span className="text-lg font-bold text-primary">${item.price}</span>
                    </div>
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tagValue) => {
                          const tag = dietaryTags.find(t => t.value === tagValue);
                          if (!tag) return null;
                          const Icon = tag.icon;
                          return (
                            <Badge key={tagValue} variant="secondary" className="text-xs gap-1">
                              <Icon className={`w-3 h-3 ${tag.color}`} />
                              {tag.label}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {menuItems.length === 0 && (
        <Card className="p-8 text-center border-dashed border-2">
          <p className="text-muted-foreground">
            No menu items yet. Add your first dish above!
          </p>
        </Card>
      )}
    </div>
  );
};

export default MenuBuilderStep;
