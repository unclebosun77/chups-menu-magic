import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { loadRestaurantDraft, saveRestaurantDraft, updateDraftStep } from '@/utils/onboardingStore';
import { BIRMINGHAM_REGIONS } from '@/utils/mockLocations';
import { generateRestaurantTags } from '@/utils/aiTagging';
import { cn } from '@/lib/utils';

const CUISINES = [
  'Afro-Caribbean', 'Italian', 'Thai', 'Indian', 'Chinese', 
  'Japanese', 'Mexican', 'Mediterranean', 'British', 'American',
  'French', 'Korean', 'Vietnamese', 'Turkish', 'Greek'
];

const PRICE_RANGES = ['£', '££', '£££', '££££'];

const RestaurantDetailsForm = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    description: '',
    cuisines: [] as string[],
    region: '',
    priceRange: '££',
    tags: [] as string[],
    latitude: '52.4862',
    longitude: '-1.8904',
    phone: '',
    website: '',
  });
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const draft = loadRestaurantDraft();
    setProfile(draft.profile);
  }, []);

  // Generate AI tag suggestions when profile changes
  useEffect(() => {
    if (profile.name && profile.cuisines.length > 0) {
      const tags = generateRestaurantTags({
        name: profile.name,
        cuisine: profile.cuisines.join(', '),
        description: profile.description,
        priceLevel: profile.priceRange,
      });
      setSuggestedTags(tags.slice(0, 5).map(t => t.label));
    }
  }, [profile.name, profile.cuisines, profile.description, profile.priceRange]);

  const updateField = useCallback((field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const toggleCuisine = useCallback((cuisine: string) => {
    setProfile(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine]
    }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setProfile(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!profile.name.trim()) newErrors.name = 'Restaurant name is required';
    if (!profile.description.trim()) newErrors.description = 'Description is required';
    if (profile.cuisines.length === 0) newErrors.cuisines = 'Select at least one cuisine';
    if (!profile.region) newErrors.region = 'Select a region';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [profile]);

  const handleSave = useCallback(() => {
    if (!validate()) return;
    
    saveRestaurantDraft('profile', profile);
    updateDraftStep(3, true);
    navigate('/restaurant/onboarding/menu');
  }, [profile, navigate, validate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/30 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/restaurant/onboarding/branding')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <p className="text-xs text-purple font-medium">Step 2 of 6</p>
              <h1 className="text-xl font-bold text-foreground">Restaurant Details</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Basic Info */}
        <Card className="p-6 space-y-4 animate-slide-up">
          <div className="space-y-2">
            <Label htmlFor="name" className={errors.name ? 'text-destructive' : ''}>
              Restaurant Name *
            </Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., The Golden Spoon"
              className={cn(
                "h-12 rounded-xl transition-all focus:ring-2 focus:ring-purple/30",
                errors.name && "border-destructive focus:ring-destructive/30"
              )}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className={errors.description ? 'text-destructive' : ''}>
              Description *
            </Label>
            <Textarea
              id="description"
              value={profile.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Tell customers what makes your restaurant special..."
              className={cn(
                "min-h-[100px] rounded-xl transition-all focus:ring-2 focus:ring-purple/30",
                errors.description && "border-destructive"
              )}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>
        </Card>

        {/* Cuisines */}
        <Card className="p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <Label className={errors.cuisines ? 'text-destructive' : ''}>Cuisine Types *</Label>
          <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((cuisine) => (
              <Badge
                key={cuisine}
                variant={profile.cuisines.includes(cuisine) ? 'default' : 'outline'}
                className={cn(
                  "cursor-pointer transition-all hover:scale-105",
                  profile.cuisines.includes(cuisine) && "bg-purple hover:bg-purple/90"
                )}
                onClick={() => toggleCuisine(cuisine)}
              >
                {cuisine}
              </Badge>
            ))}
          </div>
          {errors.cuisines && <p className="text-xs text-destructive mt-2">{errors.cuisines}</p>}
        </Card>

        {/* Region & Price */}
        <Card className="p-6 space-y-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="space-y-2">
            <Label className={errors.region ? 'text-destructive' : ''}>Region *</Label>
            <Select value={profile.region} onValueChange={(v) => updateField('region', v)}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {BIRMINGHAM_REGIONS.filter(r => r !== 'All').map((region) => (
                  <SelectItem key={region} value={region}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {region}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.region && <p className="text-xs text-destructive">{errors.region}</p>}
          </div>

          <div className="space-y-2">
            <Label>Price Range</Label>
            <div className="flex gap-2">
              {PRICE_RANGES.map((range) => (
                <Button
                  key={range}
                  variant={profile.priceRange === range ? 'default' : 'outline'}
                  onClick={() => updateField('priceRange', range)}
                  className={cn(
                    "flex-1 h-12 rounded-xl",
                    profile.priceRange === range && "bg-purple hover:bg-purple/90"
                  )}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* AI Suggested Tags */}
        {suggestedTags.length > 0 && (
          <Card className="p-6 bg-purple/5 border-purple/20 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-purple" />
              <Label className="text-purple">AI Suggested Tags</Label>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Click to add tags that describe your restaurant
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={profile.tags.includes(tag) ? 'default' : 'outline'}
                  className={cn(
                    "cursor-pointer transition-all",
                    profile.tags.includes(tag) 
                      ? "bg-purple hover:bg-purple/90" 
                      : "border-purple/30 text-purple hover:bg-purple/10"
                  )}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Location Coordinates */}
        <Card className="p-6 space-y-4 animate-slide-up" style={{ animationDelay: '250ms' }}>
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location Coordinates
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Latitude</Label>
              <Input
                value={profile.latitude}
                onChange={(e) => updateField('latitude', e.target.value)}
                placeholder="52.4862"
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Longitude</Label>
              <Input
                value={profile.longitude}
                onChange={(e) => updateField('longitude', e.target.value)}
                placeholder="-1.8904"
                className="h-10 rounded-xl"
              />
            </div>
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-6 space-y-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <Label>Contact Information</Label>
          <div className="space-y-3">
            <Input
              value={profile.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="Phone number"
              className="h-12 rounded-xl"
            />
            <Input
              value={profile.website}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder="Website URL"
              className="h-12 rounded-xl"
            />
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50">
        <Button
          onClick={handleSave}
          className="w-full h-12 bg-gradient-to-r from-purple to-neon-pink text-white font-medium rounded-xl"
        >
          Continue to Menu
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default RestaurantDetailsForm;
