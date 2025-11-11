import { MapPin, Compass, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IconTile from "./IconTile";

const DiscoverTiles = () => {
  const navigate = useNavigate();

  const discoverOptions = [
    {
      icon: Compass,
      label: "Discover",
      onClick: () => navigate("/discover")
    },
    {
      icon: MapPin,
      label: "Near Me",
      onClick: () => navigate("/discover")
    },
    {
      icon: Tag,
      label: "Offers",
      onClick: () => navigate("/discover")
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 bg-gradient-to-r from-black via-purple to-black bg-clip-text text-transparent">
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
