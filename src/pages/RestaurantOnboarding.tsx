import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProfileSetupStep from "@/components/onboarding/ProfileSetupStep";
import MenuBuilderStep from "@/components/onboarding/MenuBuilderStep";
import SuccessStep from "@/components/onboarding/SuccessStep";

interface MenuItem {
  id: string;
  name: string;
  price: string;
  tags: string[];
}

const RestaurantOnboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    name: "",
    cuisine: "",
    priceRange: "",
    hours: "",
    description: ""
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
        
        // Check if restaurant already exists
        const { data: restaurant } = await supabase
          .from("restaurants")
          .select("id")
          .eq("user_id", session.user.id)
          .single();
        
        if (restaurant) {
          navigate("/restaurant/dashboard");
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const updateProfileField = (field: string, value: any) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!profileData.name || !profileData.cuisine || !profileData.priceRange || 
          !profileData.hours || !profileData.description) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (currentStep === 1) {
      // Save restaurant profile
      if (!userId) return;
      
      setIsLoading(true);
      const { data, error } = await supabase.from("restaurants").insert({
        user_id: userId,
        name: profileData.name,
        cuisine_type: profileData.cuisine,
        description: profileData.description,
        brand_style: "modern",
        primary_color: "#8B5CF6",
        secondary_color: "#10B981",
      }).select().single();

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setIsLoading(false);
        return;
      }

      setRestaurantId(data.id);
      setIsLoading(false);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Save menu items
      if (!restaurantId || menuItems.length === 0) {
        toast({
          title: "Add Menu Items",
          description: "Please add at least one menu item to continue",
          variant: "destructive"
        });
        return;
      }

      setIsLoading(true);
      const itemsToInsert = menuItems.map(item => ({
        restaurant_id: restaurantId,
        name: item.name,
        price: parseFloat(item.price),
        category: "General",
        description: item.tags.join(", "),
        available: true
      }));

      const { error } = await supabase.from("menu_items").insert(itemsToInsert);

      if (error) {
        toast({ title: "Error saving menu", description: error.message, variant: "destructive" });
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercentage = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-app flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-hover">
        {/* Progress Bar */}
        {currentStep < 3 && (
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of 2
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-warm transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          {currentStep === 1 && (
            <ProfileSetupStep
              formData={profileData}
              onUpdate={updateProfileField}
            />
          )}

          {currentStep === 2 && (
            <MenuBuilderStep
              menuItems={menuItems}
              onUpdate={setMenuItems}
            />
          )}

          {currentStep === 3 && (
            <SuccessStep restaurantName={profileData.name} />
          )}
        </div>

        {/* Navigation */}
        {currentStep < 3 && (
          <div className="px-8 pb-8">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="gap-2"
                  disabled={isLoading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="flex-1 h-12 text-base gap-2"
              >
                {isLoading ? "Saving..." : currentStep === 2 ? "Complete Setup" : "Continue"}
                {!isLoading && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RestaurantOnboarding;
