import { useNavigate } from "react-router-dom";

const smartActions = [
  { emoji: "🤖", text: "Ask Outa", route: "/ai-assistant" },
  { emoji: "🍽️", text: "Dine-In near you", route: "/discover" },
  { emoji: "🔥", text: "Vibes tonight", route: "/discover" },
];

const SmartActionPills = () => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
      {smartActions.map((action, index) => (
        <button
          key={index}
          onClick={() => navigate(action.route)}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 bg-card border border-border/60 rounded-full text-[11px] font-medium text-foreground hover:border-purple/20 hover:bg-secondary/20 transition-all whitespace-nowrap"
        >
          <span className="text-xs">{action.emoji}</span>
          <span>{action.text}</span>
        </button>
      ))}
    </div>
  );
};

export default SmartActionPills;
