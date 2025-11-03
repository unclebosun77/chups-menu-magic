import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  available: boolean;
};

type MenuItemFormProps = {
  restaurantId: string;
  item?: MenuItem | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const MenuItemForm = ({ restaurantId, item, onSuccess, onCancel }: MenuItemFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [available, setAvailable] = useState(item?.available ?? true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    const data = {
      restaurant_id: restaurantId,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      category: formData.get("category") as string,
      image_url: (formData.get("image_url") as string) || null,
      available,
    };

    let error;
    if (item) {
      ({ error } = await supabase.from("menu_items").update(data).eq("id", item.id));
    } else {
      ({ error } = await supabase.from("menu_items").insert(data));
    }

    if (error) {
      toast({ title: "Error saving item", description: error.message, variant: "destructive" });
    } else {
      toast({ title: item ? "Item updated" : "Item added" });
      onSuccess();
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Item Name *</Label>
          <Input id="name" name="name" required defaultValue={item?.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Input id="category" name="category" required defaultValue={item?.category} placeholder="e.g., Appetizers" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={item?.price}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input id="image_url" name="image_url" type="url" defaultValue={item?.image_url || ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={item?.description || ""}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="available" checked={available} onCheckedChange={setAvailable} />
        <Label htmlFor="available">Available</Label>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : item ? "Update Item" : "Add Item"}
        </Button>
      </div>
    </form>
  );
};

export default MenuItemForm;
