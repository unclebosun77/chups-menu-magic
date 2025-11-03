import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, X } from "lucide-react";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type OrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderItem[];
  restaurantId: string;
  restaurantName: string;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  totalAmount: number;
  onSuccess: () => void;
};

const OrderDialog = ({
  open,
  onOpenChange,
  order,
  restaurantId,
  restaurantName,
  onUpdateQuantity,
  onRemoveItem,
  totalAmount,
  onSuccess,
}: OrderDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from("orders").insert({
      restaurant_id: restaurantId,
      customer_name: formData.get("name") as string,
      customer_email: formData.get("email") as string,
      customer_phone: formData.get("phone") as string,
      items: order.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
      total: totalAmount,
    });

    if (error) {
      toast({ title: "Error placing order", description: error.message, variant: "destructive" });
    } else {
      setShowConfirmation(true);
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    onSuccess();
    setShowConfirmation(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {!showConfirmation ? (
          <>
            <DialogHeader>
              <DialogTitle>Your Order</DialogTitle>
              <DialogDescription>Review and confirm your order from {restaurantName}</DialogDescription>
            </DialogHeader>

            {order.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Your cart is empty. Add some items to get started!
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {order.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="w-20 text-right font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Contact Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" type="tel" />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Placing Order..." : "Place Order"}
                  </Button>
                </form>
              </>
            )}
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">Order Confirmed! 🎉</DialogTitle>
            </DialogHeader>
            <div className="py-8 text-center space-y-4">
              <p className="text-lg">Thank you for your order!</p>
              <p className="text-muted-foreground">
                Your order has been sent to {restaurantName}. You'll receive a confirmation email shortly.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold mb-2">Order Summary</p>
                <p className="text-2xl font-bold text-primary">${totalAmount.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {order.reduce((sum, item) => sum + item.quantity, 0)} items
                </p>
              </div>
              <Button onClick={handleClose} className="w-full">
                Back to Menu
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;
