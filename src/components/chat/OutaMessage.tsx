import { cn } from '@/lib/utils';
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

const formatMarkdown = (text: string): string => {
  let html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Convert lines starting with - or • into list items
  html = html.replace(/^([•\-])\s+(.+)$/gm, '<li class="ml-4 list-disc">$2</li>');
  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li[^>]*>.*?<\/li>\n?)+)/g, '<ul class="my-1">$1</ul>');
  return html;
};

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
        <div className="flex items-start gap-2.5">
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple to-purple/70 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-purple/20">
            <span className="text-white font-bold text-[11px]">O</span>
          </div>
          
          <div className="flex-1 space-y-2.5">
            {/* Message bubble */}
            <div className="bg-[hsl(265,60%,97%)] dark:bg-purple/10 border border-purple/8 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
              />
            </div>
            
            {/* Restaurant cards */}
            {data?.restaurants && data.restaurants.length > 0 && (
              <div className="space-y-2" style={{ animationDelay: '200ms' }}>
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
            
            {/* Quick actions */}
            {data?.quickFilters && data.quickFilters.length > 0 && (
              <QuickActions 
                actions={data.quickFilters} 
                onSelect={onQuickAction}
              />
            )}
          </div>
        </div>
        
        <p className="text-[10px] text-muted-foreground/40 mt-1 ml-10">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default OutaMessage;
