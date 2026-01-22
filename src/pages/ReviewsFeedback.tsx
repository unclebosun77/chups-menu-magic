import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RestaurantLocationSelector from "@/components/reviews/RestaurantLocationSelector";
import ReviewCreationForm from "@/components/reviews/ReviewCreationForm";

type Restaurant = {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  cuisine_type: string;
  logo_url: string | null;
};

type Step = "select" | "create";

const ReviewsFeedback = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("select");
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setStep("create");
  };

  const handleBack = () => {
    if (step === "create") {
      setStep("select");
      setSelectedRestaurant(null);
    } else {
      navigate("/services");
    }
  };

  const handleSuccess = () => {
    // Navigate to the restaurant profile to see the review
    if (selectedRestaurant) {
      navigate(`/restaurant/${selectedRestaurant.id}`);
    } else {
      navigate("/services");
    }
  };

  if (step === "create" && selectedRestaurant) {
    return (
      <ReviewCreationForm
        restaurant={selectedRestaurant}
        onBack={handleBack}
        onSuccess={handleSuccess}
      />
    );
  }

  return (
    <RestaurantLocationSelector
      onSelect={handleSelectRestaurant}
      onBack={handleBack}
    />
  );
};

export default ReviewsFeedback;