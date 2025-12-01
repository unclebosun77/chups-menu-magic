import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeft, Sparkles, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrder } from "@/context/OrderContext";

const AIOrderChat = () => {
  const navigate = useNavigate();
  const { orderItems, addToOrder, totalAmount, totalItems } = useOrder();

  const messages = [
    {
      role: "user",
      content: "What's good here?",
    },
    {
      role: "assistant",
      content: "The creamy jerk shrimp pasta is top-rated and pairs perfectly with coconut festival. Want me to add it to your order?",
      suggestion: {
        name: "Creamy Jerk Shrimp Pasta",
        price: 18.99,
      },
    },
  ];

  const handleAddSuggestion = (dish: { name: string; price: number }) => {
    addToOrder({
      id: `dish-${Date.now()}`,
      name: dish.name,
      price: dish.price,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center gap-3 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 flex-1">
              <div className="bg-gradient-warm rounded-full p-2">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">CHUPS AI</h1>
                <p className="text-xs text-muted-foreground">Your taste assistant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="p-4 space-y-4">
          <div className="text-center py-6">
            <div className="bg-gradient-warm rounded-full p-4 inline-block mb-3 animate-pulse-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Ask me anything</h2>
            <p className="text-sm text-muted-foreground">
              I know the menu inside out and can help you find exactly what you'll love
            </p>
          </div>

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Avatar className={`w-10 h-10 flex-shrink-0 ${
                message.role === "assistant" ? "bg-gradient-warm" : "bg-primary"
              }`}>
                {message.role === "assistant" ? (
                  <Sparkles className="w-5 h-5 text-white m-auto" />
                ) : (
                  <span className="text-white text-sm font-semibold m-auto">You</span>
                )}
              </Avatar>

              <div className="flex-1 max-w-[80%]">
                <Card
                  className={`p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-card"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </Card>

                {message.suggestion && (
                  <Card className="mt-2 p-4 border-2 border-primary/20 bg-gradient-purple-glow">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{message.suggestion.name}</p>
                        <p className="text-sm text-primary font-bold">
                          ${message.suggestion.price.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddSuggestion(message.suggestion!)}
                        className="flex-shrink-0"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add this to my order
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Helper Text + Order Summary */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
          <div className="max-w-lg mx-auto p-4 space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              We'll remember what you liked as you explore menus.
            </p>
            {totalItems > 0 ? (
              <Card className="p-4 bg-gradient-warm text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">{totalItems} items in order</p>
                    <p className="text-2xl font-bold">
                      ${totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => navigate("/discover")}
                  >
                    Continue to Menu
                  </Button>
                </div>
              </Card>
            ) : (
              <Button
                onClick={() => navigate("/discover")}
                className="w-full h-12 bg-purple text-white hover:bg-purple-hover"
              >
                Continue browsing restaurants
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIOrderChat;
