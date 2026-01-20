import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Store, Utensils, DollarSign, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { loadRestaurantDraft, saveRestaurantDraft, updateDraftStep } from '@/utils/onboardingStore';
import { BIRMINGHAM_REGIONS } from '@/utils/mockLocations';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CUISINES = [
  'Afro-Caribbean', 'Italian', 'Thai', 'Indian', 'Chinese', 
  'Japanese', 'Mexican', 'Mediterranean', 'British', 'American',
  'French', 'Korean', 'Vietnamese', 'Turkish', 'Greek'
];

const PRICE_RANGES = [
  { value: '£', label: 'Budget-friendly' },
  { value: '££', label: 'Moderate' },
  { value: '£££', label: 'Upscale' },
  { value: '££££', label: 'Fine Dining' }
];

const OnboardingBasicInfo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    description: '',
    cuisines: [] as string[],
    region: '',
    address: '',
    priceRange: '££',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const init = async () => {
      // Check auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Load any existing draft
      const draft = loadRestaurantDraft();
      if (draft.profile.name) {
        setProfile({
          name: draft.profile.name,
          description: draft.profile.description,
          cuisines: draft.profile.cuisines || [],
          region: draft.profile.region || '',
          address: '',
          priceRange: draft.profile.priceRange || '££',
        });
      }
      setIsLoading(false);
    };
    init();
  }, [navigate]);

  const updateField = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleCuisine = (cuisine: string) => {
    setProfile(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : prev.cuisines.length < 3 ? [...prev.cuisines, cuisine] : prev.cuisines
    }));
    if (errors.cuisines) {
      setErrors(prev => ({ ...prev, cuisines: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!profile.name.trim()) newErrors.name = 'Restaurant name is required';
    if (!profile.description.trim()) newErrors.description = 'Description is required';
    if (profile.cuisines.length === 0) newErrors.cuisines = 'Select at least one cuisine';
    if (!profile.region) newErrors.region = 'Select a location';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Save to draft store
    saveRestaurantDraft('profile', {
      name: profile.name,
      description: profile.description,
      cuisines: profile.cuisines,
      region: profile.region,
      priceRange: profile.priceRange,
      tags: [],
      latitude: '52.4862',
      longitude: '-1.8904',
      phone: '',
      website: '',
    });
    updateDraftStep(2, true);
    navigate('/restaurant/onboarding/images');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <p className="text-xs text-primary font-medium">Step 1 of 4</p>
              <h1 className="text-xl font-semibold">Basic Information</h1>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-1/4 bg-primary rounded-full transition-all duration-300" />
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5">
        {/* Restaurant Name */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Store className="h-4 w-4 text-primary" />
            <Label htmlFor="name" className={cn("font-medium", errors.name && "text-destructive")}>
              Restaurant Name *
            </Label>
          </div>
          <Input
            id="name"
            value={profile.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g., The Golden Spoon"
            className={cn(
              "h-12",
              errors.name && "border-destructive"
            )}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </Card>

        {/* Cuisine Types */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Utensils className="h-4 w-4 text-primary" />
            <Label className={cn("font-medium", errors.cuisines && "text-destructive")}>
              Cuisine Type *
            </Label>
          </div>
          <p className="text-sm text-muted-foreground mb-3">Select up to 3</p>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((cuisine) => (
              <Badge
                key={cuisine}
                variant={profile.cuisines.includes(cuisine) ? 'default' : 'outline'}
                className={cn(
                  "cursor-pointer transition-all py-1.5 px-3",
                  profile.cuisines.includes(cuisine) 
                    ? "bg-primary hover:bg-primary/90" 
                    : "hover:bg-accent"
                )}
                onClick={() => toggleCuisine(cuisine)}
              >
                {cuisine}
              </Badge>
            ))}
          </div>
          {errors.cuisines && <p className="text-xs text-destructive mt-2">{errors.cuisines}</p>}
        </Card>

        {/* Location */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-primary" />
            <Label className={cn("font-medium", errors.region && "text-destructive")}>
              Location *
            </Label>
          </div>
          <Select value={profile.region} onValueChange={(v) => updateField('region', v)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select area" />
            </SelectTrigger>
            <SelectContent>
              {BIRMINGHAM_REGIONS.filter(r => r !== 'All').map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.region && <p className="text-xs text-destructive mt-1">{errors.region}</p>}
        </Card>

        {/* Price Range */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-primary" />
            <Label className="font-medium">Price Range</Label>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PRICE_RANGES.map((range) => (
              <Button
                key={range.value}
                variant={profile.priceRange === range.value ? 'default' : 'outline'}
                onClick={() => updateField('priceRange', range.value)}
                className={cn(
                  "h-12 flex-col gap-0.5 py-2",
                  profile.priceRange === range.value && "bg-primary hover:bg-primary/90"
                )}
              >
                <span className="text-base font-semibold">{range.value}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Description */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-primary" />
            <Label htmlFor="description" className={cn("font-medium", errors.description && "text-destructive")}>
              Description *
            </Label>
          </div>
          <Textarea
            id="description"
            value={profile.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Tell customers what makes your restaurant special..."
            className={cn(
              "min-h-[100px] resize-none",
              errors.description && "border-destructive"
            )}
          />
          {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          <p className="text-xs text-muted-foreground mt-2">
            {profile.description.length}/300 characters
          </p>
        </Card>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          onClick={handleContinue}
          className="w-full h-12 font-medium"
        >
          Continue to Images
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingBasicInfo;
