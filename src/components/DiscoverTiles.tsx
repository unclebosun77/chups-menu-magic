import { MapPin, UtensilsCrossed, Grid3x3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IconTile from "./IconTile";

const DiscoverTiles = () => {
  const navigate = useNavigate();

  const discoverOptions = [
    {
      icon: UtensilsCrossed,
      label: "Restaurants",
      onClick: () => navigate("/discover")
    },
    {
      icon: MapPin,
      label: "Near Me",
      onClick: () => navigate("/discover")
    },
    {
      icon: Grid3x3,
      label: "Categories",
      onClick: () => navigate("/discover")
    }
  ];

  return (
    <div>
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
        <span className="text-purple">🍽️</span> Discover
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {discoverOptions.map((option) => (
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

export default DiscoverTiles;
