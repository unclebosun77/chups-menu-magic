import { Sparkles, Calendar, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IconTile from "./IconTile";

const AskChupsTiles = () => {
  const navigate = useNavigate();

  const askChupsOptions = [
    {
      icon: Sparkles,
      label: "AI Assistant",
      onClick: () => navigate("/ai-assistant")
    },
    {
      icon: Calendar,
      label: "Plan Outing",
      onClick: () => navigate("/services")
    },
    {
      icon: DollarSign,
      label: "Budget Help",
      onClick: () => navigate("/ai-assistant")
    }
  ];

  return (
    <div>
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
        <span className="text-purple">✨</span> Ask CHUPS
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {askChupsOptions.map((option) => (
          <IconTile
            key={option.label}
            icon={option.icon}
            label={option.label}
            onClick={option.onClick}
            size="md"
          />
        ))}
      </div>
    </div>
  );
};

export default AskChupsTiles;
