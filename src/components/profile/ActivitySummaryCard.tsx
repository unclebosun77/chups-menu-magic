import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Utensils, MessageSquare, ChevronRight, Sparkles } from "lucide-react";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { cn } from "@/lib/utils";

interface ActivitySummaryCardProps {
  className?: string;
}

const ActivitySummaryCard = ({ className }: ActivitySummaryCardProps) => {
  const navigate = useNavigate();
  const { behavior } = useUserBehavior();

  const recentVisits = behavior.visitedRestaurants.slice(0, 3);
  const recentSearches = behavior.recentSearches.slice(0, 3);
  const hasActivity = recentVisits.length > 0 || recentSearches.length > 0;

  return (
    <Card className={cn("glass-card overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple" />
            Activity Summary
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/activity")}
            className="text-xs text-purple hover:text-purple/80 p-1 h-auto"
          >
            Full History
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {!hasActivity ? (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Start exploring to build your history
            </p>
          </div>
        ) : (
          <>
            {/* Recent Restaurant Visits */}
            {recentVisits.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Utensils className="w-3 h-3" />
                  <span>Recent Visits</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentVisits.map((visit, index) => (
                    <div
                      key={visit.id}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/50 text-xs cursor-pointer hover:bg-secondary transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => navigate(`/restaurant/${visit.id}`)}
                    >
                      <span className="font-medium text-foreground">{visit.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MessageSquare className="w-3 h-3" />
                  <span>Recent Searches</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((search, index) => (
                    <div
                      key={search}
                      className="px-2 py-1 rounded-full bg-purple/10 text-xs text-purple cursor-pointer hover:bg-purple/20 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => navigate(`/discover?q=${encodeURIComponent(search)}`)}
                    >
                      {search}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning indicator */}
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs text-purple/70">
                <Sparkles className="w-3 h-3" />
                <span>Outa uses this to personalize your recommendations</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivitySummaryCard;