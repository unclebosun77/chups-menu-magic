import { useNavigate } from "react-router-dom";
import { useUserBehavior } from "@/context/UserBehaviorContext";
import { vibrate } from "@/utils/haptics";

type SmartAction = {
  emoji: string;
  text: string;
  route: string;
  filter?: {
    cuisine?: string;
    priceRange?: string;
    openNow?: boolean;
    sortBy?: string;
    spicy?: boolean;
  };
};

const SmartActionPills = () => {
  const navigate = useNavigate();
  const { shouldBoostCuisine, shouldBoostSpicy, behavior } = useUserBehavior();

  // Dynamic smart actions based on user behavior
  const getSmartActions = (): SmartAction[] => {
    const baseActions: SmartAction[] = [
      { emoji: "🤖", text: "Ask Outa", route: "/ai-assistant" },
      { emoji: "🍽️", text: "Dine-In near you", route: "/discover?openNow=true&sort=distance" },
      { emoji: "🔥", text: "Vibes tonight", route: "/discover?sort=rating" },
    ];

    // Add personalized actions based on behavior
    const personalizedActions: SmartAction[] = [];

    // If user likes spicy food
    if (shouldBoostSpicy()) {
      personalizedActions.push({
        emoji: "🌶️",
        text: "Spicy picks",
        route: "/discover?spicy=true",
        filter: { spicy: true },
      });
    }

    // Add cuisine-specific action if user has a preferred cuisine
    if (behavior.preferredCuisines.length > 0) {
      const topCuisine = behavior.preferredCuisines[0];
      const cuisineEmoji = 
        topCuisine.toLowerCase().includes("italian") ? "🍝" :
        topCuisine.toLowerCase().includes("thai") ? "🍜" :
        topCuisine.toLowerCase().includes("afro") || topCuisine.toLowerCase().includes("nigerian") ? "🥘" :
        "🍴";
      
      personalizedActions.push({
        emoji: cuisineEmoji,
        text: `${topCuisine} near you`,
        route: `/discover?cuisine=${encodeURIComponent(topCuisine)}`,
        filter: { cuisine: topCuisine },
      });
    }

    // Combine and limit to 3 visible
    return [...baseActions.slice(0, 2), ...personalizedActions.slice(0, 1)].slice(0, 3);
  };

  const smartActions = getSmartActions();

  const handleActionClick = (action: SmartAction) => {
    vibrate(15);
    navigate(action.route);
  };

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
      {smartActions.map((action, index) => (
        <button
          key={index}
          onClick={() => handleActionClick(action)}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 bg-card border border-border/60 rounded-full text-[11px] font-medium text-foreground hover:border-purple/20 hover:bg-secondary/20 transition-all whitespace-nowrap active:scale-95"
        >
          <span className="text-xs">{action.emoji}</span>
          <span>{action.text}</span>
        </button>
      ))}
    </div>
  );
};

export default SmartActionPills;
