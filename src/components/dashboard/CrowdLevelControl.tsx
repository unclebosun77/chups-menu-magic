import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Lightbulb } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const CROWD_LEVELS = [
  { value: "quiet", label: "Quiet", color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-100 dark:bg-green-950/40" },
  { value: "moderate", label: "Moderate", color: "bg-amber-500", textColor: "text-amber-700", bgLight: "bg-amber-100 dark:bg-amber-950/40" },
  { value: "busy", label: "Busy", color: "bg-orange-500", textColor: "text-orange-700", bgLight: "bg-orange-100 dark:bg-orange-950/40" },
  { value: "very_busy", label: "Very Busy", color: "bg-red-500", textColor: "text-red-700", bgLight: "bg-red-100 dark:bg-red-950/40" },
] as const;

interface CrowdLevelControlProps {
  restaurantId: string;
  currentLevel: string | null;
  updatedAt: string | null;
  orders: { created_at: string; status: string }[];
  onUpdate: () => void;
}

const CrowdLevelControl = ({ restaurantId, currentLevel, updatedAt, orders, onUpdate }: CrowdLevelControlProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // Auto-suggest based on orders in last hour
  const suggestedLevel = useMemo(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOrders = orders.filter(
      (o) => new Date(o.created_at) >= oneHourAgo && !["cancelled"].includes(o.status)
    ).length;

    if (recentOrders === 0) return "quiet";
    if (recentOrders <= 3) return "moderate";
    if (recentOrders <= 8) return "busy";
    return "very_busy";
  }, [orders]);

  const handleSetLevel = async (level: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("restaurants")
        .update({ crowd_level: level, crowd_updated_at: new Date().toISOString() })
        .eq("id", restaurantId);

      if (error) throw error;

      toast({ title: "Crowd level updated", description: `Set to ${CROWD_LEVELS.find(l => l.value === level)?.label}` });
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const suggestedConfig = CROWD_LEVELS.find(l => l.value === suggestedLevel);
  const showSuggestion = suggestedLevel !== currentLevel;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Current Crowd Level</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {CROWD_LEVELS.map((level) => (
            <Button
              key={level.value}
              variant={currentLevel === level.value ? "default" : "outline"}
              className={`h-auto py-3 flex flex-col gap-1.5 ${
                currentLevel === level.value ? "ring-2 ring-offset-2 ring-primary" : ""
              }`}
              onClick={() => handleSetLevel(level.value)}
              disabled={isUpdating}
            >
              <span className={`w-3 h-3 rounded-full ${level.color}`} />
              <span className="text-xs font-medium">{level.label}</span>
            </Button>
          ))}
        </div>

        {/* Updated time */}
        {updatedAt && (
          <p className="text-xs text-muted-foreground text-center">
            Updated {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
          </p>
        )}

        {/* Auto-suggestion */}
        {showSuggestion && suggestedConfig && (
          <div className={`flex items-center justify-between p-3 rounded-lg border ${suggestedConfig.bgLight}`}>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span className="text-sm">
                Suggested: <strong>{suggestedConfig.label}</strong>
                <span className="text-muted-foreground ml-1 text-xs">(based on recent orders)</span>
              </span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleSetLevel(suggestedLevel)}
              disabled={isUpdating}
            >
              Set this
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { CROWD_LEVELS };
export default CrowdLevelControl;
