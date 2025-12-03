import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { DemoMenuItem, getTagEmoji } from "@/data/demoRestaurantMenus";

interface AskOutaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantName: string;
  menu: DemoMenuItem[];
  onAddToOrder?: (item: DemoMenuItem) => void;
}

type Message = {
  role: "user" | "assistant";
  content: string;
  suggestions?: DemoMenuItem[];
};

const quickPrompts = [
  { label: "Something spicy 🌶️", prompt: "Recommend something spicy" },
  { label: "Vegetarian options 🥬", prompt: "Show me vegetarian dishes" },
  { label: "What's popular? ⭐", prompt: "What's most popular here?" },
  { label: "Chef's picks 👨‍🍳", prompt: "What does the chef recommend?" },
  { label: "Sharing plates 🍽️", prompt: "Something good for sharing" },
];

const AskOutaModal = ({ open, onOpenChange, restaurantName, menu, onAddToOrder }: AskOutaModalProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hey! 👋 I'm Outa, your dining companion at ${restaurantName}. What are you in the mood for today?`
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const findMatchingDishes = (query: string): DemoMenuItem[] => {
    const q = query.toLowerCase();
    
    // Check for specific keywords
    if (q.includes("spicy") || q.includes("hot")) {
      return menu.filter(item => item.tags.includes("spicy")).slice(0, 3);
    }
    if (q.includes("vegetarian") || q.includes("veg")) {
      return menu.filter(item => item.tags.includes("veg") || item.tags.includes("vegan")).slice(0, 3);
    }
    if (q.includes("vegan")) {
      return menu.filter(item => item.tags.includes("vegan")).slice(0, 3);
    }
    if (q.includes("popular") || q.includes("best") || q.includes("favourite") || q.includes("favorite")) {
      return menu.filter(item => item.tags.includes("popular")).slice(0, 3);
    }
    if (q.includes("chef") || q.includes("recommend") || q.includes("suggestion")) {
      return menu.filter(item => item.tags.includes("chef-pick")).slice(0, 3);
    }
    if (q.includes("sharing") || q.includes("share") || q.includes("group")) {
      return menu.filter(item => item.tags.includes("sharing") || item.category === "starters").slice(0, 3);
    }
    if (q.includes("gluten") || q.includes("gf")) {
      return menu.filter(item => item.tags.includes("gluten-free")).slice(0, 3);
    }
    if (q.includes("dessert") || q.includes("sweet")) {
      return menu.filter(item => item.category === "desserts").slice(0, 3);
    }
    if (q.includes("drink") || q.includes("cocktail") || q.includes("wine")) {
      return menu.filter(item => item.category === "drinks").slice(0, 3);
    }
    if (q.includes("starter") || q.includes("appetizer")) {
      return menu.filter(item => item.category === "starters").slice(0, 3);
    }
    if (q.includes("main") || q.includes("entree")) {
      return menu.filter(item => item.category === "mains").slice(0, 3);
    }
    
    // Default: return chef picks or popular items
    const chefPicks = menu.filter(item => item.tags.includes("chef-pick") || item.tags.includes("popular"));
    return chefPicks.slice(0, 3);
  };

  const generateResponse = (query: string, dishes: DemoMenuItem[]): string => {
    const q = query.toLowerCase();
    
    if (dishes.length === 0) {
      return "Hmm, I couldn't find exactly what you're looking for. Let me show you some of our popular dishes instead!";
    }
    
    if (q.includes("spicy")) {
      return `Love the heat! 🔥 Here are some dishes that'll bring the fire:`;
    }
    if (q.includes("vegetarian") || q.includes("veg")) {
      return `Great choice! Here are some delicious vegetarian options:`;
    }
    if (q.includes("popular") || q.includes("best")) {
      return `These are what everyone's loving right now:`;
    }
    if (q.includes("chef") || q.includes("recommend")) {
      return `The chef's top picks for tonight 👨‍🍳:`;
    }
    if (q.includes("sharing")) {
      return `Perfect for the table! Here are some sharing favourites:`;
    }
    
    return `Based on what you're looking for, I'd suggest these:`;
  };

  const handleSend = async (message: string) => {
    if (!message.trim()) return;
    
    const userMessage: Message = { role: "user", content: message };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const matchingDishes = findMatchingDishes(message);
    const responseText = generateResponse(message, matchingDishes);
    
    const assistantMessage: Message = {
      role: "assistant",
      content: responseText,
      suggestions: matchingDishes.length > 0 ? matchingDishes : menu.filter(item => item.tags.includes("popular")).slice(0, 3)
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-purple/10">
              <Sparkles className="h-5 w-5 text-purple" />
            </div>
            <div>
              <span className="text-lg">Ask Outa</span>
              <p className="text-xs text-muted-foreground font-normal">Your AI dining companion</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="px-4 py-3 border-b">
            <p className="text-xs text-muted-foreground mb-2">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 border-purple/30 hover:bg-purple/10 hover:border-purple"
                  onClick={() => handleQuickPrompt(prompt.prompt)}
                >
                  {prompt.label}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${msg.role === "user" ? "bg-purple text-white" : "bg-secondary"} rounded-2xl px-4 py-3`}>
                  <p className="text-sm">{msg.content}</p>
                  
                  {/* Dish Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.suggestions.map((dish) => (
                        <div key={dish.id} className="bg-card rounded-xl p-3 border shadow-sm">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-sm text-foreground">{dish.name}</h4>
                            <span className="font-bold text-purple text-sm">£{dish.price}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{dish.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {dish.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-xs">{getTagEmoji(tag)}</span>
                              ))}
                            </div>
                            {onAddToOrder && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-purple text-purple hover:bg-purple hover:text-white"
                                onClick={() => onAddToOrder(dish)}
                              >
                                Add to Order
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-purple" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Input */}
        <div className="p-4 border-t">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the menu..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isLoading}
              className="bg-purple hover:bg-purple-hover shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AskOutaModal;
