import { Share2, Heart, UtensilsCrossed, Navigation, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { vibrate } from "@/utils/haptics";
import { toast } from "@/hooks/use-toast";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { useAuth } from "@/context/AuthContext";

interface QuickActionsSheetProps {
  restaurant: {
    id: string;
    name: string;
    cuisine: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuickActionsSheet = ({ restaurant, open, onOpenChange }: QuickActionsSheetProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedRestaurants();

  if (!restaurant) return null;

  const isRestaurantSaved = isSaved(restaurant.id);

  const handleSave = async () => {
    vibrate(20);
    
    if (!user) {
      toast({ title: "Sign in to save", description: "Create an account to save restaurants" });
      onOpenChange(false);
      navigate("/auth");
      return;
    }

    const result = await toggleSave(restaurant.id);
    if (!result.error) {
      toast({ 
        title: isRestaurantSaved ? "Removed from favorites" : "Saved!", 
        description: isRestaurantSaved ? `${restaurant.name} removed` : `${restaurant.name} added to your favorites` 
      });
    }
    onOpenChange(false);
  };

  const actions = [
    {
      icon: Heart,
      label: isRestaurantSaved ? "Unsave" : "Save",
      color: isRestaurantSaved ? "text-red-500" : "text-muted-foreground",
      filled: isRestaurantSaved,
      action: handleSave
    },
    {
      icon: Share2,
      label: "Share",
      color: "text-blue-500",
      action: () => {
        vibrate(20);
        if (navigator.share) {
          navigator.share({
            title: restaurant.name,
            text: `Check out ${restaurant.name}!`,
            url: window.location.origin + `/restaurant/${restaurant.id}`,
          });
        } else {
          navigator.clipboard.writeText(window.location.origin + `/restaurant/${restaurant.id}`);
          toast({ title: "Link copied!", description: "Share link copied to clipboard" });
        }
        onOpenChange(false);
      }
    },
    {
      icon: UtensilsCrossed,
      label: "View Menu",
      color: "text-purple",
      action: () => {
        vibrate(20);
        onOpenChange(false);
        navigate(`/restaurant/${restaurant.id}`);
      }
    },
    {
      icon: Navigation,
      label: "Navigate",
      color: "text-green-500",
      action: () => {
        vibrate(20);
        toast({ title: "Opening Maps...", description: `Navigate to ${restaurant.name}` });
        onOpenChange(false);
      }
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-6 pb-8 pt-4">
        {/* Handle */}
        <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-6" />
        
        {/* Restaurant name */}
        <div className="text-center mb-6">
          <h3 className="font-semibold text-lg">{restaurant.name}</h3>
          <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
        </div>

        {/* Quick actions grid */}
        <div className="grid grid-cols-4 gap-4">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <action.icon className={`h-5 w-5 ${action.color} ${action.filled ? 'fill-current' : ''}`} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Close button */}
        <button 
          onClick={() => onOpenChange(false)}
          className="w-full mt-6 py-3 rounded-xl bg-secondary text-muted-foreground font-medium hover:bg-secondary/80 transition-colors"
        >
          Cancel
        </button>
      </SheetContent>
    </Sheet>
  );
};

export default QuickActionsSheet;
