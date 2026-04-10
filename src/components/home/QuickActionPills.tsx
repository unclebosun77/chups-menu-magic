import { useNavigate } from "react-router-dom";
import { vibrate } from "@/utils/haptics";

const pills = [
  { emoji: "🍽️", label: "Book a table", route: "/discover" },
  { emoji: "📱", label: "Order now", route: "/discover" },
  { emoji: "✨", label: "Ask Outa", route: "/outa-chat" },
  { emoji: "🎁", label: "Rewards", route: "/rewards" },
  { emoji: "📅", label: "My Bookings", route: "/bookings" },
];

const QuickActionPills = () => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
      {pills.map((pill) => (
        <button
          key={pill.label}
          onClick={() => { vibrate(10); navigate(pill.route); }}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-card border border-border/40 rounded-full text-[12px] font-medium text-foreground hover:border-purple/25 active:scale-[0.96] transition-all whitespace-nowrap"
        >
          <span>{pill.emoji}</span>
          <span>{pill.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActionPills;
