import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import UserMessage from '@/components/chat/UserMessage';
import OutaMessage from '@/components/chat/OutaMessage';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ChatInput from '@/components/chat/ChatInput';
import { ChatMessage, getInitialMessage, generateMessageId, processUserMessage } from '@/utils/chatEngine';
import { useTasteProfile } from '@/context/TasteProfileContext';
import { useLocation } from '@/context/LocationContext';
import { useUserBehavior } from '@/context/UserBehaviorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { personalizedRestaurants } from '@/data/personalizedRestaurants';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

interface SupabaseRestaurant {
  id: string;
  name: string;
  cuisine_type: string;
  address: string | null;
  is_open: boolean;
  description: string | null;
}

const OutaChat = () => {
  const navigate = useNavigate();
  const { profile } = useTasteProfile();
  const { userLocation } = useLocation();
  const { behavior, addRestaurantVisit, addSearch } = useUserBehavior();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [supabaseRestaurants, setSupabaseRestaurants] = useState<SupabaseRestaurant[]>([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, cuisine_type, address, is_open, description')
        .eq('status', 'active');
      if (!error && data) setSupabaseRestaurants(data);
    };
    fetchRestaurants();
  }, []);

  useEffect(() => {
    setMessages([getInitialMessage(profile)]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const buildRestaurantContext = useCallback(() => {
    return JSON.stringify(
      supabaseRestaurants.map(r => ({
        name: r.name, cuisine: r.cuisine_type, address: r.address, isOpen: r.is_open, description: r.description,
      }))
    );
  }, [supabaseRestaurants]);

  const buildUserContext = () => {
    const preferredCuisines = profile?.cuisines?.join(', ') || behavior.preferredCuisines.join(', ') || 'no preferences set';
    const recentRestaurants = behavior.visitedRestaurants.slice(0, 3).map(r => r.name).join(', ');
    const recentSearches = behavior.recentSearches.slice(0, 3).join(', ');
    return {
      location: 'Birmingham city centre',
      cuisines: preferredCuisines,
      spiceLevel: profile?.spiceLevel || 'medium',
      pricePreference: profile?.pricePreference || 'mid',
      recentRestaurants: recentRestaurants || 'none yet',
      recentSearches: recentSearches || 'none yet',
      likesSpicy: behavior.likesSpicy,
    };
  };

  const getLocalFallback = (userMessageContent: string) => {
    const result = processUserMessage(userMessageContent, profile, userLocation, personalizedRestaurants);
    return result;
  };

  const extractQuickActions = (content: string): string[] => {
    const actions: string[] = [];
    if (content.toLowerCase().includes('book') || content.toLowerCase().includes('reserv')) actions.push('Make a reservation');
    if (content.toLowerCase().includes('menu')) actions.push('View full menu');
    if (content.toLowerCase().includes('more option')) actions.push('Show more options');
    if (actions.length === 0) actions.push('Tell me more', 'Find something else');
    return actions.slice(0, 3);
  };

  const findMentionedRestaurants = (content: string): any[] => {
    const lower = content.toLowerCase();
    return supabaseRestaurants
      .filter(r => lower.includes(r.name.toLowerCase()))
      .slice(0, 3)
      .map(r => ({ id: r.id, name: r.name, cuisine: r.cuisine_type, address: r.address, isOpen: r.is_open }));
  };

  const streamAIResponse = async (userMessageContent: string, allMessages: ChatMessage[]) => {
    const conversationHistory = allMessages
      .filter(m => m.type === 'user' || m.type === 'outa')
      .map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content }));

    const userContext = buildUserContext();
    const contextMessage = `
User context:
- Location: ${userContext.location}
- Taste preferences: ${userContext.cuisines}
- Spice level: ${userContext.spiceLevel}
- Price preference: ${userContext.pricePreference}
- Recently visited: ${userContext.recentRestaurants}
- Recent searches: ${userContext.recentSearches}
${userContext.likesSpicy ? '- User enjoys spicy food' : ''}

User's message: ${userMessageContent}
`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...conversationHistory.slice(-10), { role: 'user', content: contextMessage }],
          restaurantContext: buildRestaurantContext(),
        }),
      });

      if (resp.status === 429) {
        toast.error("Outa is busy right now, try again in a moment");
        const fallback = getLocalFallback(userMessageContent);
        return { content: fallback.content, restaurants: fallback.restaurants, quickFilters: fallback.quickFilters };
      }

      if (!resp.ok) {
        // Try to read error body
        let errorBody = '';
        try { errorBody = await resp.text(); } catch {}

        if (resp.status === 500 && errorBody.includes('OPENAI_API_KEY')) {
          toast.info("AI is being set up — using smart suggestions for now");
        }

        const fallback = getLocalFallback(userMessageContent);
        return { content: fallback.content, restaurants: fallback.restaurants, quickFilters: fallback.quickFilters };
      }

      if (!resp.body) {
        const fallback = getLocalFallback(userMessageContent);
        return { content: fallback.content, restaurants: fallback.restaurants, quickFilters: fallback.quickFilters };
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullContent = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.type === 'outa' && last.id.startsWith('streaming-')) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: fullContent } : m);
                }
                return prev;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      if (!fullContent.trim()) {
        const fallback = getLocalFallback(userMessageContent);
        return { content: fallback.content, restaurants: fallback.restaurants, quickFilters: fallback.quickFilters };
      }

      const quickFilters = extractQuickActions(fullContent);
      const mentionedRestaurants = findMentionedRestaurants(fullContent);
      return { content: fullContent, restaurants: mentionedRestaurants, quickFilters };
    } catch (error) {
      console.error('AI streaming error:', error);
      const fallback = getLocalFallback(userMessageContent);
      return { content: fallback.content, restaurants: fallback.restaurants, quickFilters: fallback.quickFilters };
    }
  };

  const handleSendMessage = useCallback(async (content: string) => {
    addSearch(content);
    const userMessage: ChatMessage = { id: generateMessageId(), type: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    const streamingId = `streaming-${generateMessageId()}`;
    const placeholderMessage: ChatMessage = { id: streamingId, type: 'outa', content: '', timestamp: new Date() };
    setMessages(prev => [...prev, placeholderMessage]);
    setIsTyping(false);

    const response = await streamAIResponse(content, [...messages, userMessage]);

    setMessages(prev =>
      prev.map(m =>
        m.id === streamingId
          ? { ...m, id: generateMessageId(), content: response.content, data: { restaurants: response.restaurants, quickFilters: response.quickFilters } }
          : m
      )
    );
  }, [messages, profile, userLocation, supabaseRestaurants, addSearch]);

  const handleQuickAction = useCallback((action: string) => { handleSendMessage(action); }, [handleSendMessage]);

  const handleRestaurantClick = useCallback((restaurant: any) => {
    addRestaurantVisit({ id: restaurant.id, name: restaurant.name, cuisine: restaurant.cuisine || 'varied' });
    navigate(`/restaurant/${restaurant.id}`);
  }, [navigate, addRestaurantVisit]);

  // Only show quick action pills on the initial message
  const hasUserSentMessage = messages.some(m => m.type === 'user');

  return (
    <div className="flex flex-col h-[100dvh]">
      {/* Header */}
      <div className="flex-shrink-0 bg-background/80 backdrop-blur-xl border-b border-border/50 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple via-neon-pink to-purple animate-[spin_4s_linear_infinite] bg-[length:200%_200%]" />
              <Sparkles className="h-5 w-5 text-white relative z-10" />
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-foreground text-lg leading-tight">Outa</h1>
              <p className="text-[11px] text-muted-foreground">Your dining guide</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 pb-2">
        {messages.map((message, index) => {
          // For outa messages after user has sent something, strip quickFilters
          const shouldShowQuickFilters = !hasUserSentMessage || index === messages.length - 1;
          const adjustedMessage = (!shouldShowQuickFilters && message.type === 'outa' && message.data?.quickFilters)
            ? { ...message, data: { ...message.data, quickFilters: undefined } }
            : message;

          return message.type === 'user' ? (
            <UserMessage key={message.id} content={message.content} timestamp={message.timestamp} isNew={index === messages.length - 2} />
          ) : (
            <OutaMessage
              key={message.id}
              message={adjustedMessage}
              isNew={index === messages.length - 1}
              onQuickAction={handleQuickAction}
              onRestaurantClick={handleRestaurantClick}
            />
          );
        })}
        {isTyping && <TypingIndicator />}

        {/* Initial quick prompts */}
        {messages.length <= 1 && !isTyping && (
          <div className="px-4 pb-4">
            <p className="text-xs text-muted-foreground/60 mb-3 px-1">Try asking…</p>
            <div className="flex flex-wrap gap-2">
              {["Easy dinner tonight", "£20–£30, good vibes", "Something new but safe", "Date night spot nearby"].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-4 py-2.5 rounded-2xl bg-card border border-border/50 text-[13px] font-medium text-foreground hover:border-purple/30 hover:bg-secondary/40 transition-all active:scale-[0.97]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input — sits above bottom nav (pb-16 for nav height) */}
      <div className="flex-shrink-0 pb-16">
        <ChatInput onSend={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
};

export default OutaChat;
