import { Calendar, Gift, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IconTile from "./IconTile";

const ExperiencesTiles = () => {
  const navigate = useNavigate();

  const experienceOptions = [
    {
      icon: Calendar,
      label: "📅 Book Table",
      onClick: () => navigate("/services")
    },
    {
      icon: Gift,
      label: "🎁 Gift Cards",
      onClick: () => navigate("/rewards")
    },
    {
      icon: Star,
      label: "⭐ Rewards",
      onClick: () => navigate("/rewards")
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 bg-gradient-to-r from-black via-purple to-black bg-clip-text text-transparent">
        <span className="text-purple">✨</span> Experiences
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {experienceOptions.map((option) => (
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

export default ExperiencesTiles;
