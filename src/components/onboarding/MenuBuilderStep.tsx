import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, X, Flame, Leaf, Star, ChefHat, Upload, Image as ImageIcon } from "lucide-react";
import { useState, useRef } from "react";

const dietaryTags = [
  { value: "spicy", label: "Spicy", icon: Flame, color: "bg-red-500/10 text-red-500 border-red-500/20" },
  { value: "vegan", label: "Vegan", icon: Leaf, color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { value: "popular", label: "Popular", icon: Star, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { value: "chef", label: "Chef's Special", icon: ChefHat, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
];

interface MenuItem {
  id: string;
  name: string;
  price: number;
  tags: string[];
  image?: string;
}

interface MenuBuilderStepProps {
  menuItems: MenuItem[];
  onUpdate: (items: MenuItem[]) => void;
}

const MenuBuilderStep = ({ menuItems, onUpdate }: MenuBuilderStepProps) => {
  const [currentItem, setCurrentItem] = useState({
    name: "",
    price: "",
    tags: [] as string[],
    image: "" as string,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentItem({ ...currentItem, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    if (currentItem.name && currentItem.price) {
      const newItem: MenuItem = {
        id: Date.now().toString(),
        name: currentItem.name,
        price: parseFloat(currentItem.price),
        tags: currentItem.tags,
        image: currentItem.image,
      };
      onUpdate([...menuItems, newItem]);
      setCurrentItem({ name: "", price: "", tags: [], image: "" });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeItem = (id: string) => {
    onUpdate(menuItems.filter(item => item.id !== id));
  };

  const toggleTag = (tag: string) => {
    setCurrentItem({
      ...currentItem,
      tags: currentItem.tags.includes(tag)
        ? currentItem.tags.filter(t => t !== tag)
        : [...currentItem.tags, tag]
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold bg-gradient-warm bg-clip-text text-transparent">
          Build Your Menu
        </h2>
        <p className="text-muted-foreground">
          Add your dishes with images and details
        </p>
      </div>

      <Card className="p-6 space-y-4 border-2">
        <div className="space-y-2">
          <Label htmlFor="dishName" className="text-base font-semibold">Dish Name *</Label>
          <Input
            id="dishName"
            value={currentItem.name}
            onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
            placeholder="e.g., Jerk Chicken Pasta"
            className="h-12 text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="text-base font-semibold">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={currentItem.price}
            onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
            placeholder="0.00"
            className="h-12 text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold">Dish Image</Label>
          <div className="flex flex-col gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full h-24 border-2 border-dashed"
              onClick={() => fileInputRef.current?.click()}
            >
              {currentItem.image ? (
                <div className="flex items-center gap-3">
                  <img src={currentItem.image} alt="Preview" className="h-16 w-16 object-cover rounded" />
                  <span>Change Image</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6" />
                  <span>Upload or drag image</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">Dietary Tags</Label>
          <div className="flex flex-wrap gap-2">
            {dietaryTags.map((tag) => {
              const Icon = tag.icon;
              const isSelected = currentItem.tags.includes(tag.value);
              return (
                <Badge
                  key={tag.value}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm ${isSelected ? tag.color : ""}`}
                  onClick={() => toggleTag(tag.value)}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {tag.label}
                </Badge>
              );
            })}
          </div>
        </div>

        <Button
          onClick={addItem}
          className="w-full h-12 text-lg font-semibold"
          disabled={!currentItem.name || !currentItem.price}
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Item
        </Button>
      </Card>

      {menuItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-bold">Menu Items ({menuItems.length})</h3>
          {menuItems.map((item) => (
            <Card key={item.id} className="p-4 flex gap-4 items-start hover:shadow-md transition-shadow">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg truncate">{item.name}</h4>
                    <p className="text-lg font-bold text-primary">${item.price.toFixed(2)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag) => {
                      const tagConfig = dietaryTags.find(t => t.value === tag);
                      const Icon = tagConfig?.icon;
                      return (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {Icon && <Icon className="w-3 h-3 mr-1" />}
                          {tagConfig?.label}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {menuItems.length === 0 && (
        <Card className="p-8 text-center border-dashed border-2">
          <p className="text-muted-foreground">No dishes added yet. Start building your menu above!</p>
        </Card>
      )}
    </div>
  );
};

export default MenuBuilderStep;
