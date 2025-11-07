import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Sparkles, PartyPopper, History, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  role: "user" | "assistant";
  content: string;
  images?: string[];
};

interface EventPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  occasionType?: string;
}

interface SavedConversation {
  id: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export const EventPlannerModal = ({ isOpen, onClose, occasionType }: EventPlannerModalProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
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

  useEffect(() => {
    if (isOpen) {
      loadConversationHistory();
    }
  }, [isOpen]);

  const loadConversationHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSavedConversations((data || []).map(conv => ({
        ...conv,
        messages: conv.messages as Message[]
      })));
    } catch (error) {
      console.error('Error loading conversation history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveConversation = async (messagesToSave: Message[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (conversationId) {
        // Update existing conversation
        const { error } = await supabase
          .from('ai_conversations')
          .update({ 
            messages: messagesToSave,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId);

        if (error) throw error;
      } else {
        // Create new conversation
        const { data, error } = await supabase
          .from('ai_conversations')
          .insert({ 
            user_id: user.id,
            messages: messagesToSave 
          })
          .select()
          .single();

        if (error) throw error;
        setConversationId(data.id);
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setMessages((data.messages as Message[]) || []);
      setConversationId(id);
      toast({
        title: "Conversation loaded",
        description: "Your previous event planning session has been restored.",
      });
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setInput("");
  };

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
              } else if (currentToolCall.function.name === "check_venue_availability") {
                result = await checkVenueAvailability(args);
              } else if (currentToolCall.function.name === "show_visual_preview") {
                result = showVisualPreview(args);
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

  const showVisualPreview = (params: any) => {
    const { event_type, atmosphere, show_venue = true, show_food = true, cuisine_focus = [] } = params;
    
    const images: string[] = [];
    
    // Venue/Interior images
    if (show_venue) {
      const venueImages = {
        proposal: ['/src/assets/gallery/prox-interior-1.jpg', '/src/assets/gallery/prox-bar.jpg'],
        romantic: ['/src/assets/gallery/prox-interior-1.jpg', '/src/assets/gallery/prox-bar.jpg'],
        wedding: ['/src/assets/gallery/prox-interior-1.jpg', '/src/assets/gallery/prox-bar.jpg'],
        formal: ['/src/assets/gallery/prox-interior-1.jpg', '/src/assets/gallery/prox-bar.jpg'],
        birthday: ['/src/assets/gallery/prox-bar.jpg', '/src/assets/gallery/prox-interior-1.jpg'],
        celebration: ['/src/assets/gallery/prox-bar.jpg'],
        casual: ['/src/assets/gallery/prox-bar.jpg'],
        corporate: ['/src/assets/gallery/prox-interior-1.jpg'],
        anniversary: ['/src/assets/gallery/prox-interior-1.jpg', '/src/assets/gallery/prox-bar.jpg']
      };
      
      const selectedVenue = venueImages[event_type as keyof typeof venueImages] || venueImages.celebration;
      images.push(...selectedVenue);
    }
    
    // Food images based on cuisine focus
    if (show_food) {
      const foodImages: Record<string, string[]> = {
        Thai: [
          '/src/assets/gallery/prox-pad-thai.jpg',
          '/src/assets/gallery/prox-green-curry.jpg',
          '/src/assets/gallery/prox-tom-yum.jpg'
        ],
        Asian: [
          '/src/assets/menu/chicken-ramen.jpg',
          '/src/assets/menu/golden-dumplings.jpg',
          '/src/assets/menu/noodles-pickled.jpg'
        ],
        Japanese: [
          '/src/assets/menu/chicken-ramen.jpg',
          '/src/assets/menu/thai-omelet-noodles.jpg'
        ],
        Italian: [
          '/src/assets/menu/pasta-vegetables.jpg',
          '/src/assets/menu/spicy-pasta-chicken.jpg'
        ],
        American: [
          '/src/assets/menu/grilled-wings.jpg',
          '/src/assets/menu/rice-platter.jpg'
        ],
        Fusion: [
          '/src/assets/menu/spiced-chicken-rice.jpg',
          '/src/assets/menu/fried-rice-egg.jpg'
        ],
        dessert: ['/src/assets/gallery/prox-mango-sticky-rice.jpg']
      };
      
      if (cuisine_focus.length > 0) {
        cuisine_focus.forEach((cuisine: string) => {
          if (foodImages[cuisine]) {
            images.push(...foodImages[cuisine].slice(0, 2));
          }
        });
      } else {
        // Default food selection for event type
        if (event_type === 'romantic' || event_type === 'proposal' || event_type === 'anniversary') {
          images.push(
            '/src/assets/gallery/prox-pad-thai.jpg',
            '/src/assets/gallery/prox-mango-sticky-rice.jpg'
          );
        } else if (event_type === 'wedding' || event_type === 'formal') {
          images.push(
            '/src/assets/menu/spiced-chicken-rice.jpg',
            '/src/assets/gallery/prox-green-curry.jpg'
          );
        } else {
          images.push(
            '/src/assets/menu/chicken-ramen.jpg',
            '/src/assets/menu/golden-dumplings.jpg'
          );
        }
      }
    }
    
    // Update the last assistant message to include images
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages[newMessages.length - 1]?.role === "assistant") {
        newMessages[newMessages.length - 1].images = images;
      }
      return newMessages;
    });
    
    return {
      success: true,
      event_type,
      atmosphere,
      images_shown: images.length,
      message: `Showing ${images.length} visual previews for your ${event_type} event`
    };
  };

  const checkVenueAvailability = async (params: any) => {
    const { start_date, end_date, experience_name, category, party_size } = params;
    
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Query existing bookings in the date range
      let query = supabase
        .from('bookings')
        .select('experience_name, category_title, booking_date, time_slot, party_size')
        .gte('booking_date', start_date)
        .lte('booking_date', end_date);
      
      if (experience_name) {
        query = query.ilike('experience_name', `%${experience_name}%`);
      }
      
      if (category && category !== 'all') {
        query = query.ilike('category_title', `%${category}%`);
      }
      
      const { data: bookings, error } = await query;
      
      if (error) throw error;
      
      // Define available time slots
      const timeSlots = [
        "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", 
        "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", 
        "8:00 PM", "9:00 PM"
      ];
      
      // Group bookings by experience and date
      const bookedSlots = new Map<string, Set<string>>();
      bookings?.forEach(booking => {
        const key = `${booking.experience_name}_${booking.booking_date}`;
        if (!bookedSlots.has(key)) {
          bookedSlots.set(key, new Set());
        }
        bookedSlots.get(key)?.add(booking.time_slot);
      });
      
      // Calculate availability for each date in range
      const availabilityMap = new Map<string, any>();
      const startDateObj = new Date(start_date);
      const endDateObj = new Date(end_date);
      
      // Get unique experiences from bookings or use a default set
      const experiences = experience_name 
        ? [experience_name]
        : Array.from(new Set(bookings?.map(b => b.experience_name) || [
            "Rooftop Romance Package",
            "Private Dining Experience",
            "Garden Celebration",
            "Waterfront Event Space"
          ]));
      
      for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        experiences.forEach(exp => {
          const key = `${exp}_${dateStr}`;
          const booked = bookedSlots.get(key) || new Set();
          const available = timeSlots.filter(slot => !booked.has(slot));
          
          if (!availabilityMap.has(exp)) {
            availabilityMap.set(exp, []);
          }
          
          availabilityMap.get(exp).push({
            date: dateStr,
            day_of_week: d.toLocaleDateString('en-US', { weekday: 'long' }),
            available_slots: available,
            booked_slots: Array.from(booked),
            total_available: available.length,
            capacity_status: available.length > 8 ? "high" : available.length > 4 ? "medium" : "low"
          });
        });
      }
      
      // Convert map to array format
      const availability = Array.from(availabilityMap.entries()).map(([experience, dates]) => ({
        experience_name: experience,
        dates: dates
      }));
      
      return {
        success: true,
        search_period: { start_date, end_date },
        party_size: party_size || "Not specified",
        availability,
        summary: {
          total_experiences: availability.length,
          most_available: availability.reduce((max, curr) => {
            const currTotal = curr.dates.reduce((sum: number, d: any) => sum + d.total_available, 0);
            const maxTotal = max.dates.reduce((sum: number, d: any) => sum + d.total_available, 0);
            return currTotal > maxTotal ? curr : max;
          }, availability[0]),
          recommendation: availability.length > 0 
            ? "Multiple venues available - would you like to discuss specific options?"
            : "Limited availability in this period - consider alternative dates?"
        }
      };
    } catch (error) {
      console.error("Error checking venue availability:", error);
      return {
        success: false,
        message: "Failed to check venue availability",
        error: error instanceof Error ? error.message : "Unknown error"
      };
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

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    await streamChat(userMessage);
    setIsLoading(false);

    // Save conversation after response
    const updatedMessages = [...messages, userMessage];
    await saveConversation(updatedMessages);
    await loadConversationHistory();
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

        <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-6 mt-4 grid w-auto grid-cols-2">
            <TabsTrigger value="chat">Current Chat</TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0">
            {conversationId && (
              <div className="mx-6 mt-4 mb-2 flex items-center justify-between p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Continuing saved conversation</p>
                <Button size="sm" variant="outline" onClick={startNewConversation}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </div>
            )}

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
                          {message.images && message.images.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              {message.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`Event preview ${idx + 1}`}
                                  className="rounded-lg w-full h-32 object-cover"
                                />
                              ))}
                            </div>
                          )}
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
          </TabsContent>

          <TabsContent value="history" className="flex-1 flex flex-col min-h-0 mt-0 px-6 pb-6">
            <ScrollArea className="flex-1 mt-4">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : savedConversations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">No saved conversations yet</p>
                  <p className="text-sm">Start planning an event to create your first conversation</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedConversations.map((conv) => {
                    const firstUserMessage = conv.messages.find(m => m.role === 'user');
                    const preview = firstUserMessage?.content.slice(0, 80) || 'New conversation';
                    const date = new Date(conv.updated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <Card
                        key={conv.id}
                        className="p-4 hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => {
                          loadConversation(conv.id);
                          const chatTab = document.querySelector('[value="chat"]') as HTMLElement;
                          chatTab?.click();
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium line-clamp-2 flex-1">{preview}</h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-3">{date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {conv.messages.length} messages
                        </p>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
