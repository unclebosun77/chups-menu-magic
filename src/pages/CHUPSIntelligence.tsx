import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Zap, TrendingUp, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTasteProfile } from "@/context/TasteProfileContext";

const CHUPSIntelligence = () => {
  const navigate = useNavigate();
  const { profile } = useTasteProfile();

  const { data: menuItems } = useQuery({
    queryKey: ["demo-menu-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const valuePoints = [
    {
      icon: Brain,
      text: "Predicts cravings before you order",
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      icon: TrendingUp,
      text: "Helps restaurants optimize menus using real customer taste signals",
      color: "bg-green-500/10 text-green-500",
    },
    {
      icon: Zap,
      text: "Makes ordering feel effortless, fast, and personal",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      icon: Sparkles,
      text: "Sends orders straight to the kitchen. No delivery. No stress.",
      color: "bg-orange-500/10 text-orange-500",
    },
  ];

  const handleResetDemo = () => {
    // Clear any demo state if needed
    navigate("/restaurant/onboarding");
  };

  return (
    <div className="min-h-screen bg-gradient-app">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="inline-block">
            <Badge className="text-sm px-4 py-2 mb-4 bg-gradient-warm text-white border-0">
              AI-Powered Restaurant Intelligence
            </Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            The taste engine that{" "}
            <span className="bg-gradient-warm bg-clip-text text-transparent">
              understands food and humans.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            CHUPS learns menus, taste patterns, and dish-level data to power smarter restaurant growth and faster customer decisions. Built for kitchens, fueled by human behavior.
          </p>
          {profile && (
            <p className="text-sm text-purple mt-2">
              This view and recommendations adapt to each diner's taste profile.
            </p>
          )}
        </div>

        {/* Value Points */}
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {valuePoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <Card
                key={index}
                className="p-6 flex items-start gap-4 hover:shadow-hover transition-all hover:-translate-y-1"
              >
                <div className={`p-3 rounded-full ${point.color} flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-base font-medium leading-relaxed pt-2">
                  {point.text}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Dish Preview */}
        {menuItems && menuItems.length > 0 && (
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Dishes optimized by CHUPS AI</h2>
              <p className="text-muted-foreground">
                Real menu intelligence in action
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {menuItems.slice(0, 3).map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-hover transition-all hover:-translate-y-1 group"
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-purple-glow">
                        <Sparkles className="w-12 h-12 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                    <p className="text-2xl font-bold text-primary">
                      ${item.price.toFixed(2)}
                    </p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center space-y-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <Card className="p-8 bg-gradient-warm text-white border-0 shadow-glow">
            <h3 className="text-2xl font-bold mb-4">Experience CHUPS in Action</h3>
            <p className="text-white/90 mb-6 max-w-xl mx-auto">
              See how restaurants onboard their menus and customers discover food they'll crave
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="h-14 px-8 text-lg font-semibold"
              onClick={handleResetDemo}
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Start Demo Again 🔁
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CHUPSIntelligence;
