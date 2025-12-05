import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
import { getMenuImage } from "@/utils/menuImageMapper";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  available: boolean;
};

type MenuItemCardProps = {
  item: MenuItem;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
  onAddToOrder?: (item: MenuItem) => void;
  isOwner?: boolean;
};

const MenuItemCard = ({ item, onEdit, onDelete, onAddToOrder, isOwner }: MenuItemCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-hover transition-shadow">
      {item.image_url && (
        <div className="h-48 overflow-hidden">
          <img
            src={getMenuImage(item.image_url) || ''}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{item.name}</CardTitle>
          {!item.available && <Badge variant="secondary">Unavailable</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {item.description && (
          <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
        )}
        <p className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        {isOwner ? (
          <>
            <Button variant="outline" size="sm" onClick={() => onEdit?.(item)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete?.(item.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </>
        ) : (
          <Button
            className="w-full"
            onClick={() => onAddToOrder?.(item)}
            disabled={!item.available}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add to Order
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MenuItemCard;
