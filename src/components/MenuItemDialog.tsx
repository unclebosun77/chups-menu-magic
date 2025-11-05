import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  available: boolean;
};

type MenuItemDialogProps = {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToOrder?: (item: MenuItem) => void;
};

const MenuItemDialog = ({ item, open, onOpenChange, onAddToOrder }: MenuItemDialogProps) => {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{item.name}</DialogTitle>
          <DialogDescription className="text-lg font-bold text-primary">
            ${item.price.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        {item.image_url && (
          <div className="w-full aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {item.description && (
          <p className="text-muted-foreground">{item.description}</p>
        )}

        <div className="flex items-center gap-3">
          <Badge variant="outline">{item.category}</Badge>
          {!item.available && <Badge variant="secondary">Unavailable</Badge>}
        </div>

        <Button
          className="w-full"
          onClick={() => {
            onAddToOrder?.(item);
            onOpenChange(false);
          }}
          disabled={!item.available}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add to Order
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemDialog;
