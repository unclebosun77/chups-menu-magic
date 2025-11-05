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
    <div className="border-b bg-card/80 backdrop-blur-lg supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-start gap-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/discover")}
            className="mt-2 hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          {logoUrl && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img 
                src={logoUrl} 
                alt={name}
                className="relative w-24 h-24 rounded-2xl object-cover shadow-lg ring-2 ring-primary/10 transition-transform group-hover:scale-105 duration-300"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {name}
            </h1>
            <div className="flex gap-2 items-center flex-wrap mb-3">
              <Badge variant="outline" className="text-sm px-3 py-1 bg-primary/5 border-primary/20">
                {cuisineType}
              </Badge>
              <Badge 
                variant={isOpen ? "default" : "secondary"}
                className="text-sm px-3 py-1"
              >
                {isOpen ? "Open Now" : "Closed"}
              </Badge>
            </div>
            {description && (
              <p className="text-muted-foreground leading-relaxed max-w-2xl">
                {description}
              </p>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="relative hover:bg-primary/10 transition-all hover:scale-105 mt-2"
            onClick={onCartClick}
          >
            <ShoppingCart className="h-5 w-5" />
            {orderCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-bounce-gentle">
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
