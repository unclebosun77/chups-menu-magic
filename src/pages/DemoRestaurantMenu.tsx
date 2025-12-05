import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Legacy redirect component - all demo restaurants now use unified RestaurantProfile
const DemoRestaurantMenu = () => {
  const { demoId } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to unified restaurant profile
    if (demoId) {
      navigate(`/restaurant/${demoId}`, { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [demoId, navigate]);
  
  return null;
};

export default DemoRestaurantMenu;
