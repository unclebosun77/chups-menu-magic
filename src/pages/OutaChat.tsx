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
import { personalizedRestaurants } from '@/data/personalizedRestaurants';
import { enrichWithLocation } from '@/utils/mockLocations';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

const OutaChat = () => {
  const navigate = useNavigate();
  const { profile } = useTasteProfile();
  const { userLocation } = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with greeting
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

  // Get enriched restaurants for context
  const restaurants = personalizedRestaurants.map(r => enrichWithLocation({
    ...r,
    cuisine: r.cuisine || (r as any).cuisine_type,
  }));

  const streamAIResponse = async (userMessageContent: string, allMessages: ChatMessage[]) => {
    // Build conversation history for the AI
    const conversationHistory = allMessages
      .filter(m => m.type === 'user' || m.type === 'outa')
      .map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    // Add context about user preferences and nearby restaurants
    const contextMessage = `
User context:
- Location: ${userLocation ? 'Birmingham city centre' : 'Birmingham city centre'}
- Taste preferences: ${profile?.cuisines?.join(', ') || 'no preferences set'}
- Spice level: ${profile?.spiceLevel || 'medium'}

Available nearby restaurants: ${restaurants.slice(0, 5).map(r => 
  `${r.name} (${r.cuisine || 'varied'}, ${r.priceLevel || '££'}, ${r.distance || 'nearby'})`
).join('; ')}

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
            ...conversationHistory.slice(-10), // Keep last 10 messages for context
            { role: 'user', content: contextMessage },
          ],
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
              // Update message in real-time
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

      // Parse any remaining quick actions or restaurants from AI response
      const quickFilters = extractQuickActions(fullContent);
      const mentionedRestaurants = findMentionedRestaurants(fullContent, restaurants);

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

  // Extract quick actions from AI response
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

  // Find mentioned restaurants
  const findMentionedRestaurants = (content: string, allRestaurants: any[]): any[] => {
    const lower = content.toLowerCase();
    return allRestaurants.filter(r => 
      lower.includes(r.name.toLowerCase())
    ).slice(0, 3);
  };

  const handleSendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Create placeholder for streaming response
    const streamingId = `streaming-${generateMessageId()}`;
    const placeholderMessage: ChatMessage = {
      id: streamingId,
      type: 'outa',
      content: '',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, placeholderMessage]);
    setIsTyping(false);

    // Stream AI response
    const response = await streamAIResponse(content, [...messages, userMessage]);
    
    // Finalize message with full content and data
    setMessages(prev => 
      prev.map(m => 
        m.id === streamingId 
          ? {
              ...m,
              id: generateMessageId(), // Replace streaming ID
              content: response.content,
              data: {
                restaurants: response.restaurants,
                quickFilters: response.quickFilters,
              },
            }
          : m
      )
    );
  }, [messages, profile, userLocation, restaurants]);

  const handleQuickAction = useCallback((action: string) => {
    handleSendMessage(action);
  }, [handleSendMessage]);

  const handleRestaurantClick = useCallback((restaurant: any) => {
    navigate(`/restaurant/${restaurant.id}`);
  }, [navigate]);

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
                <h1 className="font-bold text-foreground">Ask Outa</h1>
                <p className="text-xs text-muted-foreground">Your AI dining guide</p>
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
      </div>

      {/* Input */}
      <ChatInput onSend={handleSendMessage} disabled={isTyping} />
    </div>
  );
};

export default OutaChat;
