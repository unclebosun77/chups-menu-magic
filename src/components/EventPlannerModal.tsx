import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, Sparkles, PartyPopper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface EventPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  occasionType?: string;
}

export const EventPlannerModal = ({ isOpen, onClose, occasionType }: EventPlannerModalProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const greeting = occasionType
        ? `✨ Welcome to CHUPS Concierge! I'm here to help you plan an amazing ${occasionType}. Let's create something unforgettable together! What's the occasion about?`
        : `✨ Welcome to CHUPS Concierge! I'm your personal event planning assistant. I'll help you plan any celebration - from romantic proposals to grand parties. What occasion would you like to plan?`;
      
      setMessages([
        {
          role: "assistant",
          content: greeting,
        },
      ]);
    }
  }, [isOpen, occasionType]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: Message) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/event-planner`;

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
      let currentToolCall: any = null;
      let toolCallArguments = "";

      // Add empty assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

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
            
            // Handle tool calls
            const toolCalls = parsed.choices?.[0]?.delta?.tool_calls;
            if (toolCalls && toolCalls.length > 0) {
              const toolCall = toolCalls[0];
              
              if (toolCall.function?.name) {
                currentToolCall = toolCall;
                toolCallArguments = "";
                console.log("Tool call started:", toolCall.function.name);
              }
              
              if (toolCall.function?.arguments) {
                toolCallArguments += toolCall.function.arguments;
              }
            }

            // Handle finish reason for tool calls
            const finishReason = parsed.choices?.[0]?.finish_reason;
            if (finishReason === "tool_calls" && currentToolCall) {
              console.log("Tool call complete, executing...");
              const args = JSON.parse(toolCallArguments);
              
              let result;
              if (currentToolCall.function.name === "calculate_event_budget") {
                result = calculateEventBudget(args);
              } else if (currentToolCall.function.name === "recommend_menu_items") {
                result = await recommendMenuItems(args);
              }
              
              // Send tool result back to AI
              const toolResponseMessages = [
                ...messages,
                userMessage,
                {
                  role: "assistant",
                  content: null,
                  tool_calls: [{
                    id: currentToolCall.id || "call_1",
                    type: "function",
                    function: {
                      name: currentToolCall.function.name,
                      arguments: toolCallArguments
                    }
                  }]
                },
                {
                  role: "tool",
                  content: JSON.stringify(result),
                  tool_call_id: currentToolCall.id || "call_1"
                }
              ];

              // Make new request with tool result
              const toolResponse = await fetch(CHAT_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({ messages: toolResponseMessages }),
              });

              if (toolResponse.ok && toolResponse.body) {
                const toolReader = toolResponse.body.getReader();
                let toolTextBuffer = "";
                let toolStreamDone = false;

                while (!toolStreamDone) {
                  const { done: toolDone, value: toolValue } = await toolReader.read();
                  if (toolDone) break;
                  toolTextBuffer += decoder.decode(toolValue, { stream: true });

                  let toolNewlineIndex: number;
                  while ((toolNewlineIndex = toolTextBuffer.indexOf("\n")) !== -1) {
                    let toolLine = toolTextBuffer.slice(0, toolNewlineIndex);
                    toolTextBuffer = toolTextBuffer.slice(toolNewlineIndex + 1);

                    if (toolLine.endsWith("\r")) toolLine = toolLine.slice(0, -1);
                    if (toolLine.startsWith(":") || toolLine.trim() === "") continue;
                    if (!toolLine.startsWith("data: ")) continue;

                    const toolJsonStr = toolLine.slice(6).trim();
                    if (toolJsonStr === "[DONE]") {
                      toolStreamDone = true;
                      break;
                    }

                    try {
                      const toolParsed = JSON.parse(toolJsonStr);
                      const toolContent = toolParsed.choices?.[0]?.delta?.content;
                      if (toolContent) {
                        assistantContent += toolContent;
                        setMessages((prev) => {
                          const newMessages = [...prev];
                          newMessages[newMessages.length - 1].content = assistantContent;
                          return newMessages;
                        });
                      }
                    } catch {
                      toolTextBuffer = toolLine + "\n" + toolTextBuffer;
                      break;
                    }
                  }
                }
              }
              return; // Exit after tool call handling
            }

            // Handle regular content
            const content = parsed.choices?.[0]?.delta?.content;
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
      // Remove the empty assistant message
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const recommendMenuItems = async (params: any) => {
    const { cuisine_types, dietary_restrictions, occasion_type, course_preferences, guest_count } = params;
    
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Query menu items
      let query = supabase
        .from('menu_items')
        .select('*')
        .eq('available', true);
      
      // Execute query
      const { data: menuItems, error } = await query;
      
      if (error) throw error;
      
      if (!menuItems || menuItems.length === 0) {
        return {
          success: false,
          message: "No menu items found in the database",
          recommendations: []
        };
      }
      
      // Filter and score items based on criteria
      const scoredItems = menuItems.map(item => {
        let score = 0;
        const itemLower = `${item.name} ${item.description || ''} ${item.category}`.toLowerCase();
        
        // Cuisine matching
        if (cuisine_types && cuisine_types.length > 0) {
          cuisine_types.forEach((cuisine: string) => {
            if (itemLower.includes(cuisine.toLowerCase())) score += 3;
          });
        }
        
        // Dietary restrictions matching (boost vegetarian/vegan items)
        if (dietary_restrictions && dietary_restrictions.length > 0) {
          dietary_restrictions.forEach((restriction: string) => {
            if (restriction === 'vegetarian' && (itemLower.includes('veggie') || itemLower.includes('vegetarian'))) score += 2;
            if (restriction === 'vegan' && itemLower.includes('vegan')) score += 2;
            if (restriction === 'gluten-free' && itemLower.includes('rice')) score += 1;
          });
        }
        
        // Course preferences
        if (course_preferences && course_preferences.length > 0 && !course_preferences.includes('all')) {
          course_preferences.forEach((course: string) => {
            if (course === 'appetizer' && (itemLower.includes('dumpling') || itemLower.includes('wing'))) score += 2;
            if (course === 'main' && (itemLower.includes('rice') || itemLower.includes('noodle') || itemLower.includes('pasta'))) score += 2;
            if (course === 'dessert' && itemLower.includes('dessert')) score += 2;
          });
        }
        
        // Occasion-based scoring
        if (occasion_type === 'romantic' || occasion_type === 'proposal') {
          if (itemLower.includes('special') || itemLower.includes('premium')) score += 2;
        }
        if (occasion_type === 'wedding' || occasion_type === 'formal') {
          if (item.price && Number(item.price) > 15) score += 1;
        }
        if (occasion_type === 'casual' || occasion_type === 'family') {
          if (itemLower.includes('rice') || itemLower.includes('noodle')) score += 1;
        }
        
        return { ...item, score };
      });
      
      // Sort by score and get top recommendations
      const topItems = scoredItems
        .sort((a, b) => b.score - a.score)
        .slice(0, guest_count && guest_count > 10 ? 8 : 5);
      
      return {
        success: true,
        occasion_type,
        guest_count,
        dietary_restrictions: dietary_restrictions || [],
        cuisine_types: cuisine_types || [],
        recommendations: topItems.map(item => ({
          name: item.name,
          description: item.description,
          category: item.category,
          price: `$${Number(item.price).toFixed(2)}`,
          image_url: item.image_url,
          match_score: item.score
        }))
      };
    } catch (error) {
      console.error("Error fetching menu recommendations:", error);
      return {
        success: false,
        message: "Failed to fetch menu recommendations",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  };

  const calculateEventBudget = (params: any) => {
    const { guest_count, event_type, service_level, include_venue = true, include_drinks = true } = params;

    // Base costs per person
    const foodCosts = {
      basic: 25,
      standard: 45,
      premium: 75,
      luxury: 120,
    };

    const drinkCosts = {
      basic: 15,
      standard: 25,
      premium: 40,
      luxury: 65,
    };

    // Venue rental (flat fee + per person)
    const venueCosts = {
      basic: { flat: 200, perPerson: 5 },
      standard: { flat: 500, perPerson: 8 },
      premium: { flat: 1000, perPerson: 12 },
      luxury: { flat: 2500, perPerson: 20 },
    };

    // Event type multipliers
    const eventMultipliers: Record<string, number> = {
      proposal: 1.3,
      wedding: 1.5,
      birthday: 1.0,
      anniversary: 1.2,
      corporate: 1.1,
      graduation: 1.0,
      casual: 0.9,
      formal: 1.2,
    };

    const multiplier = eventMultipliers[event_type] || 1.0;
    
    // Calculate costs
    const foodTotal = foodCosts[service_level as keyof typeof foodCosts] * guest_count * multiplier;
    const drinksTotal = include_drinks 
      ? drinkCosts[service_level as keyof typeof drinkCosts] * guest_count * multiplier 
      : 0;
    
    const venueFlat = include_venue ? venueCosts[service_level as keyof typeof venueCosts].flat : 0;
    const venuePerPerson = include_venue 
      ? venueCosts[service_level as keyof typeof venueCosts].perPerson * guest_count 
      : 0;
    const venueTotal = (venueFlat + venuePerPerson) * multiplier;

    // Extras (decorations, staff, service charges) - 20% of food + drinks
    const extrasTotal = (foodTotal + drinksTotal) * 0.2;

    const subtotal = foodTotal + drinksTotal + venueTotal + extrasTotal;
    const tax = subtotal * 0.08; // 8% tax
    const gratuity = (foodTotal + drinksTotal) * 0.18; // 18% gratuity on food/drinks
    const total = subtotal + tax + gratuity;

    return {
      breakdown: {
        venue: {
          amount: venueTotal,
          description: include_venue 
            ? `${service_level} venue rental for ${guest_count} guests` 
            : "Venue not included"
        },
        food: {
          amount: foodTotal,
          description: `${service_level} catering for ${guest_count} guests`,
          per_person: foodCosts[service_level as keyof typeof foodCosts] * multiplier
        },
        drinks: {
          amount: drinksTotal,
          description: include_drinks 
            ? `${service_level} beverage package for ${guest_count} guests` 
            : "Beverages not included",
          per_person: include_drinks ? drinkCosts[service_level as keyof typeof drinkCosts] * multiplier : 0
        },
        extras: {
          amount: extrasTotal,
          description: "Decorations, service staff, and coordination"
        },
        tax: {
          amount: tax,
          description: "Sales tax (8%)"
        },
        gratuity: {
          amount: gratuity,
          description: "Service gratuity (18%)"
        }
      },
      summary: {
        subtotal,
        tax,
        gratuity,
        total,
        per_person: total / guest_count
      },
      event_details: {
        event_type,
        service_level,
        guest_count,
        includes_venue: include_venue,
        includes_drinks: include_drinks
      }
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="border-b p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <PartyPopper className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">CHUPS Concierge</DialogTitle>
              <p className="text-sm text-muted-foreground">Your AI Event Planning Assistant</p>
            </div>
          </div>
        </DialogHeader>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea ref={scrollRef} className="flex-1 px-6">
            <div className="space-y-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <Card
                    className={`max-w-[80%] ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-pink-500 to-purple-500 text-white"
                        : "bg-muted"
                    }`}
                  >
                    <div className="p-4">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </Card>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <Card className="bg-muted max-w-[80%]">
                    <div className="p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Tell me about your event..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              I can help with venues, menus, budgets, timing, and special touches ✨
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
