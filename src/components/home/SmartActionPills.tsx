import { useNavigate } from "react-router-dom";

const smartActions = [
  { emoji: "🍽️", text: "Dine-In near you", route: "/discover" },
  { emoji: "📅", text: "Reserve for 2", route: "/services" },
  { emoji: "🤖", text: "Ask Outa for a recommendation", route: "/ai-assistant" },
  { emoji: "🐝", text: "Budget-friendly spots nearby", route: "/discover" },
  { emoji: "⚡", text: "Show places open right now", route: "/discover" },
  { emoji: "🍸", text: "Find somewhere for drinks", route: "/discover" },
  { emoji: "🔥", text: "Vibes-match places for tonight", route: "/discover" },
  { emoji: "📘", text: "View my bookings", route: "/my-bookings" },
];

const SmartActionPills = () => {
  const navigate = useNavigate();
  
  const row1 = smartActions.slice(0, 4);
  const row2 = smartActions.slice(4);

  return (
    <div className="space-y-2">
      {/* Row 1 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
        {row1.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.route)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-card border border-purple/20 rounded-full text-sm font-medium text-foreground hover:border-purple/40 hover:bg-secondary/50 transition-all shadow-pill whitespace-nowrap"
          >
            <span className="text-base">{action.emoji}</span>
            <span>{action.text}</span>
          </button>
        ))}
      </div>
      
      {/* Row 2 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
        {row2.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.route)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-card border border-purple/20 rounded-full text-sm font-medium text-foreground hover:border-purple/40 hover:bg-secondary/50 transition-all shadow-pill whitespace-nowrap"
          >
            <span className="text-base">{action.emoji}</span>
            <span>{action.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SmartActionPills;
