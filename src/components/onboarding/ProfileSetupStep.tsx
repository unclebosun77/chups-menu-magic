import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Upload, Image as ImageIcon } from "lucide-react";
import { useRef } from "react";

const cuisineTypes = [
  "Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai", "French", "American",
  "Mediterranean", "Middle Eastern", "Korean", "Vietnamese", "Afro-Caribbean", "Fast Food", "Fusion", "Other"
];

const priceRanges = [
  { value: "$", label: "$ - Budget Friendly" },
  { value: "$$", label: "$$ - Moderate" },
  { value: "$$$", label: "$$$ - Upscale" },
  { value: "$$$$", label: "$$$$ - Fine Dining" }
];

interface ProfileSetupStepProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
}

const ProfileSetupStep = ({ formData, onUpdate }: ProfileSetupStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate("logo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold bg-gradient-warm bg-clip-text text-transparent">
          Restaurant Profile Setup
        </h2>
        <p className="text-muted-foreground">
          Tell us about your restaurant
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold">Restaurant Logo</Label>
        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
            id="logo-upload"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full h-32 border-2 border-dashed"
            onClick={() => fileInputRef.current?.click()}
          >
            {formData.logo ? (
              <div className="flex flex-col items-center gap-3">
                <img src={formData.logo} alt="Logo Preview" className="h-20 w-20 object-contain rounded" />
                <span className="text-sm">Change Logo</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8" />
                <span>Upload Restaurant Logo</span>
                <span className="text-xs text-muted-foreground">Recommended: Square image, min 200x200px</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-base font-semibold">Restaurant Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onUpdate("name", e.target.value)}
          placeholder="The Gourmet Kitchen"
          className="h-12 text-lg"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cuisine" className="text-base font-semibold">Cuisine Type *</Label>
        <Select value={formData.cuisine} onValueChange={(value) => onUpdate("cuisine", value)}>
          <SelectTrigger className="h-12 text-lg">
            <SelectValue placeholder="Select your cuisine type" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-[100]">
            {cuisineTypes.map((cuisine) => (
              <SelectItem key={cuisine} value={cuisine} className="text-lg py-3">
                {cuisine}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priceRange" className="text-base font-semibold">Price Range *</Label>
        <Select value={formData.priceRange} onValueChange={(value) => onUpdate("priceRange", value)}>
          <SelectTrigger className="h-12 text-lg">
            <SelectValue placeholder="Select price range" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-[100]">
            {priceRanges.map((range) => (
              <SelectItem key={range.value} value={range.value} className="text-lg py-3">
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hours" className="text-base font-semibold">Opening Hours *</Label>
        <Input
          id="hours"
          value={formData.hours}
          onChange={(e) => onUpdate("hours", e.target.value)}
          placeholder="Mon-Fri: 9:00 AM - 10:00 PM"
          className="h-12 text-lg"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-semibold">Restaurant Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onUpdate("description", e.target.value)}
          placeholder="Share your story, specialties, and what makes your restaurant unique..."
          className="min-h-[120px] text-base resize-none"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="story" className="text-base font-semibold">Restaurant Story</Label>
        <Textarea
          id="story"
          value={formData.story || ""}
          onChange={(e) => onUpdate("story", e.target.value)}
          placeholder="Tell customers what makes your kitchen special."
          className="min-h-[100px] text-base resize-none"
        />
      </div>

      <div className="bg-gradient-purple-glow border border-primary/20 rounded-xl p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 rounded-full p-2 mt-0.5">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground">CHUPS AI Integration</h4>
              <Badge variant="secondary" className="text-xs">SMART</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CHUPS AI will analyze your menu to help customers order faster and smarter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupStep;
