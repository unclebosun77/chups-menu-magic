import { UtensilsCrossed, ChefHat, PartyPopper } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IconTile from "./IconTile";

const ExperiencesTiles = () => {
  const navigate = useNavigate();

  const experienceOptions = [
    {
      icon: UtensilsCrossed,
      label: "Dine-in",
      onClick: () => navigate("/services")
    },
    {
      icon: ChefHat,
      label: "Private Chef",
      onClick: () => navigate("/services")
    },
    {
      icon: PartyPopper,
      label: "Events",
      onClick: () => navigate("/services")
    }
  ];

  return (
    <div>
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
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
