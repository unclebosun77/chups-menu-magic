import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  tags?: string[];
}

interface OrderContextType {
  orderItems: OrderItem[];
  addToOrder: (item: Omit<OrderItem, 'quantity'>) => void;
  removeFromOrder: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearOrder: () => void;
  totalAmount: number;
  totalItems: number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const { toast } = useToast();

  const addToOrder = (item: Omit<OrderItem, 'quantity'>) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        toast({
          title: "Updated order",
          description: `${item.name} quantity increased`,
        });
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      toast({
        title: "Added to order",
        description: `${item.name} added to your order`,
      });
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromOrder = (id: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Item removed",
      description: "Item has been removed from your order",
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(id);
      return;
    }
    setOrderItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearOrder = () => {
    setOrderItems([]);
  };

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <OrderContext.Provider
      value={{
        orderItems,
        addToOrder,
        removeFromOrder,
        updateQuantity,
        clearOrder,
        totalAmount,
        totalItems,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};
