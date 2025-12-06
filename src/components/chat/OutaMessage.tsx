import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import ChatRestaurantCard from './ChatRestaurantCard';
import ItineraryCard from './ItineraryCard';
import QuickActions from './QuickActions';
import { ChatMessage } from '@/utils/chatEngine';

interface OutaMessageProps {
  message: ChatMessage;
  isNew?: boolean;
  onQuickAction?: (action: string) => void;
  onRestaurantClick?: (restaurant: any) => void;
}

const OutaMessage = ({ message, isNew = false, onQuickAction, onRestaurantClick }: OutaMessageProps) => {
  const { content, data } = message;
  
  return (
    <div 
      className={cn(
        "flex justify-start mb-4 px-4",
        isNew && "animate-fade-in"
      )}
    >
      <div className="max-w-[85%]">
        {/* Avatar */}
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple to-neon-pink flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple/30">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          
          <div className="flex-1 space-y-3">
            {/* Main message bubble */}
            <div className="bg-secondary/80 backdrop-blur-xl border border-border/50 px-4 py-3 rounded-2xl rounded-tl-md shadow-lg">
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {content}
              </p>
            </div>
            
            {/* Restaurant recommendations */}
            {data?.restaurants && data.restaurants.length > 0 && (
              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
                {data.restaurants.map((restaurant, index) => (
                  <ChatRestaurantCard 
                    key={restaurant.id || index}
                    restaurant={restaurant}
                    onClick={() => onRestaurantClick?.(restaurant)}
                    delay={index * 100}
                  />
                ))}
              </div>
            )}
            
            {/* Itinerary */}
            {data?.itinerary && data.itinerary.length > 0 && (
              <ItineraryCard steps={data.itinerary} />
            )}
            
            {/* Quick action chips */}
            {data?.quickFilters && data.quickFilters.length > 0 && (
              <QuickActions 
                actions={data.quickFilters} 
                onSelect={onQuickAction}
              />
            )}
          </div>
        </div>
        
        <p className="text-[10px] text-muted-foreground/50 mt-1 ml-10">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default OutaMessage;
