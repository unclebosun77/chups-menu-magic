import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface RestaurantOwnerCardProps {
  userId: string;
  className?: string;
}

const RestaurantOwnerCard = ({ userId, className }: RestaurantOwnerCardProps) => {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<{ id: string; name: string } | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("restaurants")
        .select("id, name")
        .eq("user_id", userId)
        .maybeSingle();
      setRestaurant(data);
      setChecked(true);
    };
    fetch();
  }, [userId]);

  if (!checked) return null;

  if (restaurant) {
    return (
      <Card className={cn("glass-card overflow-hidden", className)}>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple/10 to-secondary flex items-center justify-center">
            <Store className="h-5 w-5 text-purple" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{restaurant.name}</p>
            <p className="text-xs text-muted-foreground">Manage your restaurant</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/restaurant/dashboard")}
            className="text-purple"
          >
            Dashboard
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn("glass-card cursor-pointer hover:border-purple/20 transition-all", className)}
      onClick={() => navigate("/restaurant/onboarding")}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple/10 to-secondary flex items-center justify-center">
          <Store className="h-5 w-5 text-purple" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">Own a restaurant?</p>
          <p className="text-xs text-muted-foreground">Join Chups — it's free</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
      </CardContent>
    </Card>
  );
};

export default RestaurantOwnerCard;
