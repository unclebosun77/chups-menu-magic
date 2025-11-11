import { ShoppingBag, Clock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IconTile from "./IconTile";

const OrderTiles = () => {
  const navigate = useNavigate();

  const orderOptions = [
    {
      icon: ShoppingBag,
      label: "Current",
      onClick: () => navigate("/my-orders")
    },
    {
      icon: CheckCircle2,
      label: "Past",
      onClick: () => navigate("/my-orders")
    },
    {
      icon: Clock,
      label: "Scheduled",
      onClick: () => navigate("/my-orders")
    }
  ];

  return (
    <div>
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
        <span className="text-purple">📦</span> Orders
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {orderOptions.map((option) => (
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

export default OrderTiles;
