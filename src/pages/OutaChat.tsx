import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserMessage from '@/components/chat/UserMessage';
import OutaMessage from '@/components/chat/OutaMessage';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ChatInput from '@/components/chat/ChatInput';
import { 
  ChatMessage, 
  processUserMessage, 
  getInitialMessage, 
  generateMessageId 
} from '@/utils/chatEngine';
import { useTasteProfile } from '@/context/TasteProfileContext';
import { useLocation } from '@/context/LocationContext';
import { personalizedRestaurants } from '@/data/personalizedRestaurants';
import { enrichWithLocation } from '@/utils/mockLocations';

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

  // Get enriched restaurants
  const restaurants = personalizedRestaurants.map(r => enrichWithLocation({
    ...r,
    cuisine: r.cuisine || (r as any).cuisine_type,
  }));

  const handleSendMessage = useCallback((content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      const response = processUserMessage(content, profile, userLocation, restaurants);
      
      const outaMessage: ChatMessage = {
        id: generateMessageId(),
        type: 'outa',
        content: response.content,
        timestamp: new Date(),
        data: {
          restaurants: response.restaurants,
          quickFilters: response.quickFilters,
          itinerary: response.itinerary,
        },
      };
      
      setIsTyping(false);
      setMessages(prev => [...prev, outaMessage]);
    }, 1200 + Math.random() * 800);
  }, [profile, userLocation, restaurants]);

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
