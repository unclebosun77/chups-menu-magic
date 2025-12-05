import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, ArrowLeft, MapPin, Heart, Users, TrendingUp, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";

type Message = {
  role: "user" | "assistant";
  content: string;
  showRestaurants?: boolean;
};

const suggestionPrompts = [
  { text: "Find me a great date night spot", icon: <Heart className="h-3.5 w-3.5" /> },
  { text: "Show me top Nigerian restaurants nearby", icon: <MapPin className="h-3.5 w-3.5" /> },
  { text: "What's trending right now?", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { text: "Where should I go for solo dinner?", icon: <Utensils className="h-3.5 w-3.5" /> },
  { text: "Pick a place for a group hangout", icon: <Users className="h-3.5 w-3.5" /> },
];

const AIAssistant = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const restaurantContext = searchParams.get("restaurant");
  
  const getInitialMessage = () => {
    if (restaurantContext) {
      return `How can I help you with ${restaurantContext}? I can tell you about their menu, suggest dishes, or help you find similar spots.`;
    }
    return "Hey! 👋 I'm Outa, your personal dining assistant. Tell me what you're in the mood for, and I'll find the perfect spot.";
  };

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: getInitialMessage() },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: Message) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Rate limit exceeded",
            description: "Please try again in a moment.",
            variant: "destructive",
          });
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Service unavailable",
            description: "AI service requires payment. Please contact support.",
            variant: "destructive",
          });
          return;
        }
        throw new Error("Failed to start stream");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantContent = "";

      // Check if we should show restaurants based on user query
      const shouldShowRestaurants = userMessage.content.toLowerCase().includes("find") || 
        userMessage.content.toLowerCase().includes("show") ||
        userMessage.content.toLowerCase().includes("recommend") ||
        userMessage.content.toLowerCase().includes("spot") ||
        userMessage.content.toLowerCase().includes("restaurant");

      setMessages((prev) => [...prev, { role: "assistant", content: "", showRestaurants: shouldShowRestaurants }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantContent;
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    setHasInteracted(true);
    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    await streamChat(userMessage);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    handleSend(prompt);
  };

  // Transform restaurants for cards
  const recommendedRestaurants = personalizedRestaurants.slice(0, 2).map(r => ({
    id: r.id,
    name: r.name,
    rating: r.rating,
    cuisine: r.cuisine,
    price_level: r.priceLevel,
    description: r.description,
    images: [r.imageUrl],
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-purple/5 flex flex-col">
      {/* Header */}
      <div className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple to-purple/60 flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">Ask Outa</h1>
                <p className="text-xs text-muted-foreground/70">Your personal dining assistant</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-4">
        <div className="space-y-4 pb-4">
          {messages.map((message, index) => (
            <div key={index}>
              <div
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-purple text-white rounded-br-md"
                      : "bg-gradient-to-br from-card via-card to-purple/5 border border-border/60 text-foreground rounded-bl-md shadow-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
              
              {/* Restaurant Cards for AI responses */}
              {message.role === "assistant" && message.showRestaurants && message.content && (
                <div className="mt-3 ml-0">
                  <p className="text-xs text-muted-foreground/60 mb-2 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-purple" />
                    Outa recommends
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {recommendedRestaurants.map((restaurant) => (
                      <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-br from-card via-card to-purple/5 border border-border/60 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-purple/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-purple/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestion Prompts - Show only before user interacts */}
      {!hasInteracted && (
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground/60 mb-2">Try asking...</p>
          <div className="flex flex-wrap gap-2">
            {suggestionPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(prompt.text)}
                className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border/60 rounded-xl text-sm text-foreground hover:border-purple/40 hover:bg-purple/5 transition-all"
              >
                <span className="text-purple/70">{prompt.icon}</span>
                <span className="text-xs">{prompt.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border/60 bg-background/95 backdrop-blur px-4 py-3">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 bg-card border-border/60 text-foreground rounded-xl h-11 focus-visible:ring-purple/30"
          />
          <Button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-11 w-11 rounded-xl bg-purple hover:bg-purple/90 text-white shadow-md"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
