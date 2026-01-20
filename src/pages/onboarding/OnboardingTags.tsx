import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, Heart, Users, Briefcase, Gift, Music, Sun, Moon, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { loadRestaurantDraft, saveRestaurantDraft, updateDraftStep } from '@/utils/onboardingStore';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const DINING_VIBES = [
  { id: 'casual', label: 'Casual Dining', icon: Coffee },
  { id: 'date-night', label: 'Date Night', icon: Heart },
  { id: 'group-friendly', label: 'Group Friendly', icon: Users },
  { id: 'business', label: 'Business Lunch', icon: Briefcase },
  { id: 'premium', label: 'Premium', icon: Sparkles },
  { id: 'lively', label: 'Lively Atmosphere', icon: Music },
];

const OCCASIONS = [
  { id: 'birthday', label: 'Birthdays' },
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'family', label: 'Family Gatherings' },
  { id: 'solo', label: 'Solo Dining' },
  { id: 'brunch', label: 'Brunch' },
  { id: 'late-night', label: 'Late Night' },
  { id: 'quick-bite', label: 'Quick Bite' },
  { id: 'celebration', label: 'Celebrations' },
];

const FEATURES = [
  { id: 'outdoor', label: 'Outdoor Seating', icon: Sun },
  { id: 'late-hours', label: 'Open Late', icon: Moon },
  { id: 'live-music', label: 'Live Music', icon: Music },
  { id: 'private-dining', label: 'Private Dining', icon: Users },
  { id: 'vegetarian', label: 'Vegetarian Options' },
  { id: 'vegan', label: 'Vegan Options' },
  { id: 'halal', label: 'Halal' },
  { id: 'gluten-free', label: 'Gluten-Free Options' },
];

const OnboardingTags = () => {
  const navigate = useNavigate();
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Load draft - ensure we have basic info
      const draft = loadRestaurantDraft();
      if (!draft.profile.name) {
        navigate('/restaurant/onboarding');
        return;
      }

      // Load existing tags if any
      if (draft.profile.tags && draft.profile.tags.length > 0) {
        const tags = draft.profile.tags;
        setSelectedVibes(tags.filter((t: string) => DINING_VIBES.some(v => v.id === t)));
        setSelectedOccasions(tags.filter((t: string) => OCCASIONS.some(o => o.id === t)));
        setSelectedFeatures(tags.filter((t: string) => FEATURES.some(f => f.id === t)));
      }
    };
    init();
  }, [navigate]);

  const toggleVibe = (id: string) => {
    setSelectedVibes(prev => 
      prev.includes(id) 
        ? prev.filter(v => v !== id)
        : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const toggleOccasion = (id: string) => {
    setSelectedOccasions(prev => 
      prev.includes(id) 
        ? prev.filter(o => o !== id)
        : [...prev, id]
    );
  };

  const toggleFeature = (id: string) => {
    setSelectedFeatures(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id)
        : [...prev, id]
    );
  };

  const handleContinue = () => {
    const allTags = [...selectedVibes, ...selectedOccasions, ...selectedFeatures];
    
    // Update profile tags in draft
    const draft = loadRestaurantDraft();
    saveRestaurantDraft('profile', {
      ...draft.profile,
      tags: allTags,
    });
    updateDraftStep(4, true);
    navigate('/restaurant/onboarding/review');
  };

  const totalSelected = selectedVibes.length + selectedOccasions.length + selectedFeatures.length;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/restaurant/onboarding/images')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <p className="text-xs text-primary font-medium">Step 3 of 4</p>
              <h1 className="text-xl font-semibold">Tags & Attributes</h1>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-primary rounded-full transition-all duration-300" />
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <p className="text-sm text-muted-foreground">
          Help customers find you by selecting tags that describe your restaurant.
        </p>

        {/* Dining Vibes */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <Label className="font-medium">Dining Vibes</Label>
            <span className="text-xs text-muted-foreground ml-auto">Select up to 3</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DINING_VIBES.map((vibe) => {
              const Icon = vibe.icon;
              const isSelected = selectedVibes.includes(vibe.id);
              return (
                <button
                  key={vibe.id}
                  onClick={() => toggleVibe(vibe.id)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border transition-all text-left",
                    isSelected 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{vibe.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Occasions */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="h-4 w-4 text-primary" />
            <Label className="font-medium">Good For</Label>
          </div>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((occasion) => (
              <Badge
                key={occasion.id}
                variant={selectedOccasions.includes(occasion.id) ? 'default' : 'outline'}
                className={cn(
                  "cursor-pointer transition-all py-1.5 px-3",
                  selectedOccasions.includes(occasion.id) 
                    ? "bg-primary hover:bg-primary/90" 
                    : "hover:bg-accent"
                )}
                onClick={() => toggleOccasion(occasion.id)}
              >
                {occasion.label}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Features */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <Label className="font-medium">Features & Amenities</Label>
          </div>
          <div className="flex flex-wrap gap-2">
            {FEATURES.map((feature) => (
              <Badge
                key={feature.id}
                variant={selectedFeatures.includes(feature.id) ? 'default' : 'outline'}
                className={cn(
                  "cursor-pointer transition-all py-1.5 px-3",
                  selectedFeatures.includes(feature.id) 
                    ? "bg-primary hover:bg-primary/90" 
                    : "hover:bg-accent"
                )}
                onClick={() => toggleFeature(feature.id)}
              >
                {feature.label}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Selection Summary */}
        {totalSelected > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            {totalSelected} tag{totalSelected !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          onClick={handleContinue}
          className="w-full h-12 font-medium"
        >
          Review & Publish
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingTags;
