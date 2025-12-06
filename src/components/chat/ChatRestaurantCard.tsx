import { MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import TasteMatchBadge from '@/components/TasteMatchBadge';

interface ChatRestaurantCardProps {
  restaurant: any;
  onClick?: () => void;
  delay?: number;
}

const ChatRestaurantCard = ({ restaurant, onClick, delay = 0 }: ChatRestaurantCardProps) => {
  const matchScore = restaurant.tasteScore || restaurant.combinedScore || 85;
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex gap-3 p-3 rounded-xl cursor-pointer",
        "bg-background/50 border border-border/50",
        "hover:bg-background/80 hover:border-purple/30 transition-all",
        "active:scale-[0.98] animate-scale-in"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <img 
          src={restaurant.image || restaurant.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-foreground text-sm truncate">{restaurant.name}</h4>
          <TasteMatchBadge score={matchScore} variant="compact" />
        </div>
        
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {restaurant.cuisine || restaurant.cuisine_type}
        </p>
        
        <div className="flex items-center gap-3 mt-1.5">
          {restaurant.distanceText && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{restaurant.distanceText}</span>
            </div>
          )}
          
          {restaurant.rating && (
            <div className="flex items-center gap-1 text-xs">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-foreground">{restaurant.rating}</span>
            </div>
          )}
          
          {restaurant.priceLevel && (
            <span className="text-xs text-muted-foreground">{restaurant.priceLevel}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRestaurantCard;
