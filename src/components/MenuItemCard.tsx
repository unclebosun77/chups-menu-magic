import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Loader2, Check } from "lucide-react";
import { getMenuImage } from "@/utils/menuImageMapper";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  available: boolean;
  sold_out_today?: boolean;
};

type MenuItemCardProps = {
  item: MenuItem;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
  onAddToOrder?: (item: MenuItem) => void;
  isOwner?: boolean;
  onItemUpdate?: (item: MenuItem) => void;
};

const MenuItemCard = ({ item, onEdit, onDelete, onAddToOrder, isOwner, onItemUpdate }: MenuItemCardProps) => {
  const { toast } = useToast();
  const [available, setAvailable] = useState(item.available);
  const [soldOut, setSoldOut] = useState(item.sold_out_today || false);
  const [isTogglingAvail, setIsTogglingAvail] = useState(false);
  const [isTogglingSold, setIsTogglingSold] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [priceValue, setPriceValue] = useState(item.price.toFixed(2));
  const [savedFlash, setSavedFlash] = useState(false);
  const priceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvailable(item.available);
    setSoldOut(item.sold_out_today || false);
    setPriceValue(item.price.toFixed(2));
  }, [item]);

  useEffect(() => {
    if (isEditingPrice && priceRef.current) {
      priceRef.current.focus();
      priceRef.current.select();
    }
  }, [isEditingPrice]);

  const toggleAvailability = async () => {
    setIsTogglingAvail(true);
    const newVal = !available;
    const { error } = await supabase
      .from("menu_items")
      .update({ available: newVal })
      .eq("id", item.id);

    if (error) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } else {
      setAvailable(newVal);
      onItemUpdate?.({ ...item, available: newVal });
    }
    setIsTogglingAvail(false);
  };

  const toggleSoldOut = async () => {
    setIsTogglingSold(true);
    const newVal = !soldOut;
    const { error } = await supabase
      .from("menu_items")
      .update({ sold_out_today: newVal } as any)
      .eq("id", item.id);

    if (error) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } else {
      setSoldOut(newVal);
      onItemUpdate?.({ ...item, sold_out_today: newVal });
    }
    setIsTogglingSold(false);
  };

  const savePrice = async () => {
    setIsEditingPrice(false);
    const newPrice = parseFloat(priceValue);
    if (isNaN(newPrice) || newPrice < 0) {
      setPriceValue(item.price.toFixed(2));
      toast({ title: "Invalid price", variant: "destructive" });
      return;
    }
    if (newPrice === item.price) return;

    const { error } = await supabase
      .from("menu_items")
      .update({ price: newPrice })
      .eq("id", item.id);

    if (error) {
      setPriceValue(item.price.toFixed(2));
      toast({ title: "Failed to save price", description: error.message, variant: "destructive" });
    } else {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
      onItemUpdate?.({ ...item, price: newPrice });
    }
  };

  const dimmed = !available || soldOut;
  const imgSrc = item.image_url ? getMenuImage(item.image_url) : null;

  // Consumer view
  if (!isOwner) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg border bg-card ${!item.available ? "opacity-50" : ""}`}>
        {imgSrc ? (
          <img src={imgSrc} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground flex-shrink-0">
            {item.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{item.name}</p>
          <p className="text-primary font-bold text-sm">£{item.price.toFixed(2)}</p>
        </div>
        <Button size="sm" onClick={() => onAddToOrder?.(item)} disabled={!item.available}>
          Add
        </Button>
      </div>
    );
  }

  // Owner view — compact row
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border bg-card transition-opacity ${dimmed ? "opacity-50" : ""}`}>
      {/* Thumbnail */}
      {imgSrc ? (
        <img src={imgSrc} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground flex-shrink-0">
          {item.name.charAt(0)}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm truncate">{item.name}</p>
          {soldOut && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Sold out</Badge>}
          {!available && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Unavailable</Badge>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {/* Inline price edit */}
          {isEditingPrice ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">£</span>
              <Input
                ref={priceRef}
                value={priceValue}
                onChange={e => setPriceValue(e.target.value)}
                onBlur={savePrice}
                onKeyDown={e => { if (e.key === "Enter") savePrice(); if (e.key === "Escape") { setPriceValue(item.price.toFixed(2)); setIsEditingPrice(false); } }}
                className="h-6 w-20 text-xs px-1"
                type="number"
                step="0.01"
                min="0"
              />
            </div>
          ) : (
            <button
              onClick={() => setIsEditingPrice(true)}
              className="text-primary font-bold text-sm hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              £{priceValue}
            </button>
          )}
          {savedFlash && (
            <span className="text-xs text-green-600 flex items-center gap-0.5 animate-in fade-in">
              <Check className="h-3 w-3" /> Saved
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Sold out toggle */}
        <Button
          variant={soldOut ? "destructive" : "outline"}
          size="sm"
          className="text-xs h-7 px-2"
          onClick={toggleSoldOut}
          disabled={isTogglingSold}
        >
          {isTogglingSold ? <Loader2 className="h-3 w-3 animate-spin" /> : soldOut ? "Restock" : "Sold out"}
        </Button>

        {/* Availability switch */}
        <div className="flex items-center gap-1">
          {isTogglingAvail ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Switch
              checked={available}
              onCheckedChange={toggleAvailability}
              className="scale-75"
            />
          )}
        </div>

        {/* Edit */}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit?.(item)}>
          <Edit className="h-3.5 w-3.5" />
        </Button>

        {/* Delete with confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{item.name}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove this item from your menu. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete?.(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default MenuItemCard;
