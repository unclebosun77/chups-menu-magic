import { cn } from '@/lib/utils';
import ChatRestaurantCard from './ChatRestaurantCard';
import ItineraryCard from './ItineraryCard';
import QuickActions from './QuickActions';
import BudgetPlannerCard from './BudgetPlannerCard';
import ContextualReplies from './ContextualReplies';
import { ChatMessage } from '@/utils/chatEngine';

interface OutaMessageProps {
  message: ChatMessage;
  isNew?: boolean;
  onQuickAction?: (action: string) => void;
  onRestaurantClick?: (restaurant: any) => void;
  userMessageContent?: string;
}

const ALLOWED_TAGS = ['strong', 'em', 'p', 'ul', 'li'];

const sanitizeHtml = (html: string): string => {
  // Strip all tags except allowed ones
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi, (match, tag) => {
    const lower = tag.toLowerCase();
    if (ALLOWED_TAGS.includes(lower)) {
      // Only keep the tag itself, strip attributes except class
      if (match.startsWith('</')) return `</${lower}>`;
      const classMatch = match.match(/class="([^"]*)"/);
      return classMatch ? `<${lower} class="${classMatch[1]}">` : `<${lower}>`;
    }
    return '';
  });
};

const parseMarkdown = (text: string): string => {
  let html = text
    // Escape HTML entities first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic *text*
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // List items starting with - or •
    .replace(/^[•\-]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li[^>]*>.*?<\/li>\s*)+)/g, '<ul class="my-1 space-y-0.5">$1</ul>');

  // Paragraph breaks on double newlines
  html = html
    .split(/\n\n+/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      if (block.startsWith('<ul')) return block;
      return `<p>${block}</p>`;
    })
    .join('');

  // Single newlines to <br> inside paragraphs
  html = html.replace(/(?<!<\/li>)\n(?!<li)/g, '<br/>');

  return sanitizeHtml(html);
};

const OutaMessage = ({ message, isNew = false, onQuickAction, onRestaurantClick, userMessageContent }: OutaMessageProps) => {
  const { content, data } = message;

  const hasRestaurants = data?.restaurants && data.restaurants.length > 0;
  const hasItinerary = data?.itinerary && data.itinerary.length > 0;
  const isBudgetQuery = userMessageContent && /budget|£|\bspend\b|\bafford\b/i.test(userMessageContent);

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
              <div
                className="text-sm leading-relaxed text-foreground [&_ul]:list-disc [&_ul]:pl-4 [&_li]:text-sm [&_p]:mb-1.5 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
              />
            </div>
            
            {/* Restaurant cards */}
            {hasRestaurants && (
              <div className="space-y-2" style={{ animationDelay: '200ms' }}>
                {data!.restaurants!.map((restaurant: any, index: number) => (
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
            {hasItinerary && (
              <ItineraryCard steps={data!.itinerary!} onRestaurantClick={onRestaurantClick} />
            )}

            {/* Budget planner card */}
            {isBudgetQuery && (
              <BudgetPlannerCard onSubmit={(budget) => onQuickAction?.(`Find restaurants under £${budget} per person`)} />
            )}
            
            {/* Contextual quick replies */}
            {isNew && content && (
              <ContextualReplies
                messageContent={content}
                hasRestaurants={!!hasRestaurants}
                hasItinerary={!!hasItinerary}
                onSelect={onQuickAction}
              />
            )}

            {/* Legacy quick actions */}
            {data?.quickFilters && data.quickFilters.length > 0 && !isNew && (
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
