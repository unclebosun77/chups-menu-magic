import { useState, useEffect } from "react";
import { useTasteProfile, TasteProfile } from "@/context/TasteProfileContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface TasteProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CUISINES = [
  "Afro-Caribbean",
  "Thai",
  "Italian",
  "Mexican",
  "Japanese",
  "Indian",
  "Chinese",
  "Mediterranean",
  "American",
];

const PROTEINS = ["Chicken", "Seafood", "Beef", "Vegetarian"];

const TasteProfileDialog = ({ open, onOpenChange }: TasteProfileDialogProps) => {
  const { profile, setProfile, resetProfile } = useTasteProfile();
  const { toast } = useToast();
  
  const [spiceLevel, setSpiceLevel] = useState<"mild" | "medium" | "hot">("medium");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [pricePreference, setPricePreference] = useState<"budget" | "mid" | "premium">("mid");
  const [selectedProteins, setSelectedProteins] = useState<string[]>([]);

  // Load existing profile when dialog opens
  useEffect(() => {
    if (open && profile) {
      setSpiceLevel(profile.spiceLevel);
      setSelectedCuisines(profile.cuisines);
      setPricePreference(profile.pricePreference);
      setSelectedProteins(profile.proteins);
    }
  }, [open, profile]);

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
    );
  };

  const toggleProtein = (protein: string) => {
    setSelectedProteins((prev) =>
      prev.includes(protein) ? prev.filter((p) => p !== protein) : [...prev, protein]
    );
  };

  const handleSave = () => {
    if (selectedCuisines.length === 0 || selectedProteins.length === 0) {
      toast({
        title: "Please select at least one cuisine and protein",
        variant: "destructive",
      });
      return;
    }

    const newProfile: TasteProfile = {
      spiceLevel,
      cuisines: selectedCuisines,
      pricePreference,
      proteins: selectedProteins,
    };

    setProfile(newProfile);
    toast({
      title: "Taste profile saved",
      description: "We'll personalize your experience based on your preferences.",
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    resetProfile();
    setSpiceLevel("medium");
    setSelectedCuisines([]);
    setPricePreference("mid");
    setSelectedProteins([]);
    toast({
      title: "Profile reset",
      description: "Your taste preferences have been cleared.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set your taste profile</DialogTitle>
          <DialogDescription>
            Help us personalize your food discovery experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Spice Level */}
          <div className="space-y-3">
            <Label>How spicy do you like your food?</Label>
            <div className="flex gap-2">
              {(["mild", "medium", "hot"] as const).map((level) => (
                <Button
                  key={level}
                  variant={spiceLevel === level ? "default" : "outline"}
                  onClick={() => setSpiceLevel(level)}
                  className="flex-1 capitalize"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Cuisines */}
          <div className="space-y-3">
            <Label>What cuisines do you enjoy?</Label>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant={selectedCuisines.includes(cuisine) ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => toggleCuisine(cuisine)}
                >
                  {cuisine}
                </Badge>
              ))}
            </div>
          </div>

          {/* Price Preference */}
          <div className="space-y-3">
            <Label>What's your usual budget?</Label>
            <div className="flex gap-2">
              {(["budget", "mid", "premium"] as const).map((price) => (
                <Button
                  key={price}
                  variant={pricePreference === price ? "default" : "outline"}
                  onClick={() => setPricePreference(price)}
                  className="flex-1 capitalize"
                >
                  {price}
                </Button>
              ))}
            </div>
          </div>

          {/* Proteins */}
          <div className="space-y-3">
            <Label>What do you usually go for?</Label>
            <div className="flex flex-wrap gap-2">
              {PROTEINS.map((protein) => (
                <Badge
                  key={protein}
                  variant={selectedProteins.includes(protein) ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => toggleProtein(protein)}
                >
                  {protein}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Save my taste profile
          </Button>
          {profile && (
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TasteProfileDialog;
