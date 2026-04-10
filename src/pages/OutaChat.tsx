import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import OutaMessage from '@/components/chat/OutaMessage';
import UserMessage from '@/components/chat/UserMessage';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { ChatMessage, getInitialMessage, generateMessageId, processUserMessage } from '@/utils/chatEngine';
import { useTasteProfile } from '@/context/TasteProfileContext';
import { useLocation } from '@/context/LocationContext';
import { useUserBehavior } from '@/context/UserBehaviorContext';
import { supabase } from '@/integrations/supabase/client';
import { personalizedRestaurants } from '@/data/personalizedRestaurants';
import { cn } from '@/lib/utils';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

interface SupabaseRestaurant {
  id: string;
  name: string;
  cuisine_type: string;
  address: string | null;
  is_open: boolean;
  description: string | null;
  vibes: string[] | null;
}

interface BudgetInfo {
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
}

const QUICK_PILLS = [
  "Plan my evening ✨",
  "Romantic dinner 💕",
  "Best spots nearby 📍",
  "Budget meal 💰",
  "Surprise me 🎲",
];

const OutaChat = () => {
  const navigate = useNavigate();
  const { profile } = useTasteProfile();
  const { userLocation } = useLocation();
  const { behavior, addRestaurantVisit, addSearch } = useUserBehavior();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [supabaseRestaurants, setSupabaseRestaurants] = useState<SupabaseRestaurant[]>([]);
  const [budgetMap, setBudgetMap] = useState<Record<string, BudgetInfo>>({});
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [restaurantRes, menuRes] = await Promise.all([
        supabase.from('restaurants').select('id, name, cuisine_type, address, is_open, description, vibes').eq('status', 'active'),
        supabase.from('menu_items').select('restaurant_id, price').eq('available', true),
      ]);

      if (!restaurantRes.error && restaurantRes.data) setSupabaseRestaurants(restaurantRes.data);

      if (!menuRes.error && menuRes.data) {
        const map: Record<string, { prices: number[] }> = {};
        for (const item of menuRes.data) {
          if (!map[item.restaurant_id]) map[item.restaurant_id] = { prices: [] };
          map[item.restaurant_id].prices.push(Number(item.price));
        }
        const result: Record<string, BudgetInfo> = {};
        for (const [rid, { prices }] of Object.entries(map)) {
          result[rid] = {
            minPrice: Math.min(...prices),
            avgPrice: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100,
            maxPrice: Math.max(...prices),
          };
        }
        setBudgetMap(result);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setMessages([getInitialMessage(profile)]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const buildRestaurantContext = useCallback(() => {
    return JSON.stringify(
      supabaseRestaurants.map(r => ({
        name: r.name,
        cuisine: r.cuisine_type,
        address: r.address,
        isOpen: r.is_open,
        description: r.description,
        vibes: r.vibes || [],
        minDishPrice: budgetMap[r.id]?.minPrice || null,
        avgMealPrice: budgetMap[r.id]?.avgPrice || null,
      }))
    );
  }, [supabaseRestaurants, budgetMap]);

  const buildUserContext = () => {
    const preferredCuisines = profile?.cuisines?.join(', ') || behavior.preferredCuisines.join(', ') || 'no preferences set';
    const recentRestaurants = behavior.visitedRestaurants.slice(0, 3).map(r => r.name).join(', ');
    const recentSearches = behavior.recentSearches.slice(0, 3).join(', ');

    const now = new Date();
    const timeContext = {
      dayOfWeek: now.toLocaleDateString('en-GB', { weekday: 'long' }),
      timeOfDay: now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening',
      hour: now.getHours(),
      isWeekend: [0, 6].includes(now.getDay()),
    };

    return {
      location: 'Birmingham city centre',
      cuisines: preferredCuisines,
      spiceLevel: profile?.spiceLevel || 'medium',
      pricePreference: profile?.pricePreference || 'mid',
      recentRestaurants: recentRestaurants || 'none yet',
      recentSearches: recentSearches || 'none yet',
      likesSpicy: behavior.likesSpicy,
      timeContext,
    };
  };

  const getLocalFallback = (userMessageContent: string) => {
    return processUserMessage(userMessageContent, profile, userLocation, personalizedRestaurants);
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
    const tc = userContext.timeContext;
    const contextMessage = `User context: Location: ${userContext.location}, Taste: ${userContext.cuisines}, Spice: ${userContext.spiceLevel}, Price: ${userContext.pricePreference}, Recent visits: ${userContext.recentRestaurants}, Recent searches: ${userContext.recentSearches}${userContext.likesSpicy ? ', Enjoys spicy food' : ''}. Current time context: It is ${tc.dayOfWeek} ${tc.timeOfDay} (${tc.hour}:00). Weekend: ${tc.isWeekend}.\n\nUser's message: ${userMessageContent}`;

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

      if (!resp.ok || !resp.body) {
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
    setInputValue('');

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
  }, [messages, profile, userLocation, supabaseRestaurants, addSearch, budgetMap]);

  const handleQuickAction = useCallback((action: string) => { handleSendMessage(action); }, [handleSendMessage]);

  const handleRestaurantClick = useCallback((restaurant: any) => {
    addRestaurantVisit({ id: restaurant.id, name: restaurant.name, cuisine: restaurant.cuisine || 'varied' });
    navigate(`/restaurant/${restaurant.id}`);
  }, [navigate, addRestaurantVisit]);

  const handleReset = () => {
    setMessages([getInitialMessage(profile)]);
    setInputValue('');
  };

  const handleSubmit = () => {
    if (inputValue.trim() && !isTyping) {
      handleSendMessage(inputValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasUserSentMessage = messages.some(m => m.type === 'user');

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border/40 bg-background/90 backdrop-blur-xl z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple to-purple/70 flex items-center justify-center shadow-md shadow-purple/20">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground text-[17px] leading-tight">Outa</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">Your dining guide 💜</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2 rounded-full hover:bg-secondary/60 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Reset conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 pb-36">
        {messages.map((message, index) => {
          const precedingUserMessage = message.type === 'outa' && index > 0
            ? messages.slice(0, index).reverse().find(m => m.type === 'user')
            : undefined;

          return message.type === 'user' ? (
            <UserMessage key={message.id} content={message.content} timestamp={message.timestamp} isNew={index === messages.length - 2} />
          ) : (
            <OutaMessage
              key={message.id}
              message={message}
              isNew={index === messages.length - 1}
              onQuickAction={handleQuickAction}
              onRestaurantClick={handleRestaurantClick}
              userMessageContent={precedingUserMessage?.content}
            />
          );
        })}
        {isTyping && <TypingIndicator />}

        {!hasUserSentMessage && messages.length <= 1 && !isTyping && (
          <div className="px-4 pt-2 pb-4">
            <p className="text-xs text-muted-foreground/50 mb-3 px-1">Try asking…</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PILLS.map(pill => (
                <button
                  key={pill}
                  onClick={() => handleSendMessage(pill)}
                  className="px-4 py-2.5 rounded-full bg-purple/5 border border-purple/15 text-[13px] font-medium text-foreground hover:bg-purple/10 hover:border-purple/30 transition-all active:scale-[0.97]"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 px-4 py-3 bg-background/90 backdrop-blur-xl border-t border-border/40">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Outa anything..."
            disabled={isTyping}
            rows={1}
            className={cn(
              "flex-1 px-4 py-3 rounded-full resize-none",
              "bg-secondary/50 border border-border/50",
              "focus:outline-none focus:ring-2 focus:ring-purple/30 focus:border-purple/40",
              "placeholder:text-muted-foreground/40 text-sm",
              "transition-all disabled:opacity-50",
              "max-h-[120px]"
            )}
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isTyping}
            className={cn(
              "h-11 w-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
              inputValue.trim()
                ? "bg-purple text-white shadow-md shadow-purple/25"
                : "bg-secondary text-muted-foreground/40"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutaChat;
