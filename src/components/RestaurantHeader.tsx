import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface RestaurantHeaderProps {
  logoUrl?: string | null;
  name: string;
  cuisineType: string;
  description?: string | null;
  isOpen: boolean;
  orderCount: number;
  onCartClick: () => void;
}

const RestaurantHeader = ({ 
  logoUrl, 
  name, 
  cuisineType, 
  description, 
  isOpen, 
  orderCount,
  onCartClick 
}: RestaurantHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 border-b shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/discover")}
            className="hover:bg-primary/10 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          {logoUrl && (
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img 
                src={logoUrl} 
                alt={name}
                className="relative w-12 h-12 rounded-full object-cover shadow-lg ring-2 ring-primary/10 transition-transform group-hover:scale-110 duration-300"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {name}
            </h1>
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-xs text-muted-foreground">{cuisineType}</span>
              <Badge 
                variant={isOpen ? "default" : "secondary"}
                className="text-xs px-2 py-0"
              >
                {isOpen ? "Open" : "Closed"}
              </Badge>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="relative hover:bg-primary/10 transition-all hover:scale-105 shrink-0"
            onClick={onCartClick}
          >
            <ShoppingCart className="h-5 w-5" />
            {orderCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
                {orderCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantHeader;
