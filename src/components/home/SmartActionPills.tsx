import { useNavigate } from "react-router-dom";

const smartActions = [
  { emoji: "🤖", text: "Ask Outa", route: "/ai-assistant" },
  { emoji: "🍽️", text: "Dine-In near you", route: "/discover" },
  { emoji: "📅", text: "Reserve a table", route: "/services" },
  { emoji: "🔥", text: "Vibes-match tonight", route: "/discover" },
  { emoji: "⚡", text: "Open now", route: "/discover" },
];

const SmartActionPills = () => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
      {smartActions.map((action, index) => (
        <button
          key={index}
          onClick={() => navigate(action.route)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-full text-xs font-medium text-foreground hover:border-purple/30 hover:bg-secondary/30 transition-all whitespace-nowrap"
        >
          <span className="text-sm">{action.emoji}</span>
          <span>{action.text}</span>
        </button>
      ))}
    </div>
  );
};

export default SmartActionPills;
