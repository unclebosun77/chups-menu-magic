import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserMessage from '@/components/chat/UserMessage';
import OutaMessage from '@/components/chat/OutaMessage';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ChatInput from '@/components/chat/ChatInput';
import { ChatMessage, getInitialMessage, generateMessageId } from '@/utils/chatEngine';
import { useTasteProfile } from '@/context/TasteProfileContext';
import { useLocation } from '@/context/LocationContext';
import { useUserBehavior } from '@/context/UserBehaviorContext';
import { supabase } from '@/integrations/supabase/client';

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

  // Fetch restaurants from Supabase on mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, cuisine_type, address, is_open, description')
        .eq('status', 'active');
      
      if (!error && data) {
        setSupabaseRestaurants(data);
      }
    };
    fetchRestaurants();
  }, []);

  // Initialize with personalized greeting
  useEffect(() => {
    const initialMessage = getInitialMessage(profile);
    setMessages([initialMessage]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Build restaurant context string for AI
  const buildRestaurantContext = useCallback(() => {
    return JSON.stringify(
      supabaseRestaurants.map(r => ({
        name: r.name,
        cuisine: r.cuisine_type,
        address: r.address,
        isOpen: r.is_open,
        description: r.description,
      }))
    );
  }, [supabaseRestaurants]);

  // Build context from user profile and behavior
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

  const streamAIResponse = async (userMessageContent: string, allMessages: ChatMessage[]) => {
    const conversationHistory = allMessages
      .filter(m => m.type === 'user' || m.type === 'outa')
      .map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

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
          messages: [
            ...conversationHistory.slice(-10),
            { role: 'user', content: contextMessage },
          ],
          restaurantContext: buildRestaurantContext(),
        }),
      });

      if (resp.status === 429) {
        return { content: "I'm getting a lot of requests right now. Please try again in a moment! ⏳" };
      }
      
      if (resp.status === 402) {
        return { content: "AI service is temporarily unavailable. Try again later! 🔧" };
      }

      if (!resp.ok || !resp.body) {
        throw new Error('Failed to start stream');
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
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.type === 'outa' && last.id.startsWith('streaming-')) {
                  return prev.map((m, i) => 
                    i === prev.length - 1 
                      ? { ...m, content: fullContent }
                      : m
                  );
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

      const quickFilters = extractQuickActions(fullContent);
      const mentionedRestaurants = findMentionedRestaurants(fullContent);

      return { 
        content: fullContent, 
        restaurants: mentionedRestaurants,
        quickFilters 
      };
    } catch (error) {
      console.error('AI streaming error:', error);
      return { 
        content: "Sorry, I'm having trouble connecting. Let me help you find something great nearby! 🍽️",
        quickFilters: ['Show nearby restaurants', 'Popular this week', 'Surprise me'],
      };
    }
  };

  const extractQuickActions = (content: string): string[] => {
    const actions: string[] = [];
    if (content.toLowerCase().includes('book') || content.toLowerCase().includes('reserv')) {
      actions.push('Make a reservation');
    }
    if (content.toLowerCase().includes('menu')) {
      actions.push('View full menu');
    }
    if (content.toLowerCase().includes('more option')) {
      actions.push('Show more options');
    }
    if (actions.length === 0) {
      actions.push('Tell me more', 'Find something else');
    }
    return actions.slice(0, 3);
  };

  // Match restaurant names from AI response against Supabase data
  const findMentionedRestaurants = (content: string): any[] => {
    const lower = content.toLowerCase();
    return supabaseRestaurants
      .filter(r => lower.includes(r.name.toLowerCase()))
      .slice(0, 3)
      .map(r => ({
        id: r.id,
        name: r.name,
        cuisine: r.cuisine_type,
        address: r.address,
        isOpen: r.is_open,
      }));
  };

  const handleSendMessage = useCallback(async (content: string) => {
    addSearch(content);

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    const streamingId = `streaming-${generateMessageId()}`;
    const placeholderMessage: ChatMessage = {
      id: streamingId,
      type: 'outa',
      content: '',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, placeholderMessage]);
    setIsTyping(false);

    const response = await streamAIResponse(content, [...messages, userMessage]);
    
    setMessages(prev => 
      prev.map(m => 
        m.id === streamingId 
          ? {
              ...m,
              id: generateMessageId(),
              content: response.content,
              data: {
                restaurants: response.restaurants,
                quickFilters: response.quickFilters,
              },
            }
          : m
      )
    );
  }, [messages, profile, userLocation, supabaseRestaurants, addSearch]);

  const handleQuickAction = useCallback((action: string) => {
    handleSendMessage(action);
  }, [handleSendMessage]);

  const handleRestaurantClick = useCallback((restaurant: any) => {
    addRestaurantVisit({
      id: restaurant.id,
      name: restaurant.name,
      cuisine: restaurant.cuisine || 'varied',
    });
    navigate(`/restaurant/${restaurant.id}`);
  }, [navigate, addRestaurantVisit]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/30 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-neon-pink flex items-center justify-center shadow-lg shadow-purple/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">Ask CHUPS</h1>
                <p className="text-xs text-muted-foreground">Your AI dining assistant</p>
              </div>
            </div>
            
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-4 pb-24"
      >
        {messages.map((message, index) => (
          message.type === 'user' ? (
            <UserMessage 
              key={message.id}
              content={message.content}
              timestamp={message.timestamp}
              isNew={index === messages.length - 1}
            />
          ) : (
            <OutaMessage 
              key={message.id}
              message={message}
              isNew={index === messages.length - 1}
              onQuickAction={handleQuickAction}
              onRestaurantClick={handleRestaurantClick}
            />
          )
        ))}
        
        {isTyping && <TypingIndicator />}

        {messages.length <= 1 && !isTyping && (
          <div className="px-4 pb-4">
            <p className="text-xs text-muted-foreground/60 mb-3 px-1">Try asking…</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Easy dinner tonight",
                "£20–£30, good vibes",
                "Something new but safe",
                "Date night spot nearby",
              ].map((prompt) => (
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

      {/* Input */}
      <ChatInput onSend={handleSendMessage} disabled={isTyping} />
    </div>
  );
};

export default OutaChat;
