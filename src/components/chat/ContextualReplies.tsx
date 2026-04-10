import { cn } from '@/lib/utils';

interface ContextualRepliesProps {
  messageContent: string;
  hasRestaurants: boolean;
  hasItinerary: boolean;
  onSelect?: (action: string) => void;
}

const getReplies = (content: string, hasRestaurants: boolean, hasItinerary: boolean): string[] => {
  const lower = content.toLowerCase();

  if (hasItinerary) {
    return ['Adjust the timing', 'Different restaurant', 'Save this plan'];
  }

  if (hasRestaurants) {
    // Try to extract a restaurant name for a more personal reply
    const replies: string[] = [];
    // Generic restaurant follow-ups
    replies.push('What should I order?', 'Book a table', 'Show me more options');
    return replies.slice(0, 3);
  }

  if (lower.includes('budget') || lower.includes('£') || lower.includes('price')) {
    return ['Show me options', 'Something fancier', 'Best value spots'];
  }

  if (lower.includes('spicy') || lower.includes('flavour') || lower.includes('taste')) {
    return ['More like this', 'Something different', 'Plan my evening'];
  }

  // Default follow-ups
  return ['Show me nearby', 'Help me decide', 'Plan my evening'];
};

const ContextualReplies = ({ messageContent, hasRestaurants, hasItinerary, onSelect }: ContextualRepliesProps) => {
  const replies = getReplies(messageContent, hasRestaurants, hasItinerary);

  if (!replies.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5 animate-fade-in" style={{ animationDelay: '400ms' }}>
      {replies.map((reply) => (
        <button
          key={reply}
          onClick={() => onSelect?.(reply)}
          className={cn(
            "px-3 py-1.5 rounded-full text-[12px] font-medium",
            "bg-purple/5 border border-purple/12 text-foreground/80",
            "hover:bg-purple/10 hover:border-purple/25",
            "transition-all active:scale-[0.96]"
          )}
        >
          {reply}
        </button>
      ))}
    </div>
  );
};

export default ContextualReplies;
