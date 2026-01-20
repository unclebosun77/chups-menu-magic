import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Eye, MapPin, DollarSign, Tag, Image as ImageIcon, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { loadRestaurantDraft, clearDraft } from '@/utils/onboardingStore';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const OnboardingReview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);
  const [draft, setDraft] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const loadedDraft = loadRestaurantDraft();
      if (!loadedDraft.profile.name) {
        navigate('/restaurant/onboarding');
        return;
      }
      setDraft(loadedDraft);
    };
    init();
  }, [navigate]);

  const handlePublish = async (status: 'draft' | 'live') => {
    if (!draft) return;

    setIsPublishing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Error", description: "Please sign in to continue", variant: "destructive" });
        navigate('/auth');
        return;
      }

      const profile = draft.profile;
      const branding = draft.branding || {};
      const gallery = draft.gallery || [];

      // Build gallery URLs array
      const galleryUrls = gallery.map((img: any) => img.url);

      // Insert restaurant
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .insert({
          user_id: session.user.id,
          name: profile.name,
          description: profile.description,
          cuisine_type: profile.cuisines?.join(', ') || '',
          city: profile.region || 'Birmingham',
          address: profile.region || '',
          logo_url: branding.logo || null,
          gallery_images: galleryUrls,
          tags: profile.tags || [],
          latitude: profile.latitude ? parseFloat(profile.latitude) : null,
          longitude: profile.longitude ? parseFloat(profile.longitude) : null,
          brand_style: 'modern',
          primary_color: '#8B5CF6',
          secondary_color: '#10B981',
          status: status,
          is_open: status === 'live',
        })
        .select()
        .single();

      if (error) {
        console.error('Restaurant insert error:', error);
        toast({ 
          title: "Error", 
          description: error.message, 
          variant: "destructive" 
        });
        setIsPublishing(false);
        return;
      }

      // Clear draft
      clearDraft();

      toast({
        title: status === 'live' ? "Restaurant Published! 🎉" : "Draft Saved",
        description: status === 'live' 
          ? "Your restaurant is now live and visible to customers."
          : "Your restaurant has been saved as a draft.",
      });

      // Navigate to dashboard
      navigate('/restaurant/dashboard');

    } catch (err) {
      console.error('Publish error:', err);
      toast({ 
        title: "Error", 
        description: "Something went wrong. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (!draft) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const profile = draft.profile;
  const branding = draft.branding || {};
  const gallery = draft.gallery || [];
  const hasImages = branding.logo || gallery.length > 0;
  const hasTags = profile.tags && profile.tags.length > 0;

  return (
    <div className="min-h-screen bg-background pb-36">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/restaurant/onboarding/tags')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <p className="text-xs text-primary font-medium">Step 4 of 4</p>
              <h1 className="text-xl font-semibold">Review & Publish</h1>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-full bg-primary rounded-full transition-all duration-300" />
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5">
        {/* Preview Header */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-2">
            <Eye className="h-4 w-4" />
            Preview
          </div>
          <p className="text-sm text-muted-foreground">
            This is how your restaurant will appear to customers
          </p>
        </div>

        {/* Restaurant Preview Card */}
        <Card className="overflow-hidden">
          {/* Cover/Gallery Image */}
          {gallery.length > 0 ? (
            <div className="relative h-48 bg-muted">
              <img 
                src={gallery[0].url} 
                alt={profile.name}
                className="w-full h-full object-cover"
              />
              {gallery.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium">
                  +{gallery.length - 1} more
                </div>
              )}
            </div>
          ) : (
            <div className="h-32 bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                <p className="text-xs">No images uploaded</p>
              </div>
            </div>
          )}

          <div className="p-5">
            {/* Logo + Name */}
            <div className="flex items-start gap-3 mb-4">
              {branding.logo ? (
                <img 
                  src={branding.logo} 
                  alt="Logo"
                  className="w-14 h-14 rounded-xl object-cover border border-border"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {profile.name?.charAt(0) || 'R'}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <p className="text-sm text-muted-foreground">{profile.cuisines?.join(' • ')}</p>
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{profile.region || 'Birmingham'}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>{profile.priceRange || '££'}</span>
              </div>
            </div>

            {/* Description */}
            {profile.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {profile.description}
              </p>
            )}

            {/* Tags */}
            {hasTags && (
              <div className="flex flex-wrap gap-2">
                {profile.tags.slice(0, 5).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag.replace('-', ' ')}
                  </Badge>
                ))}
                {profile.tags.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{profile.tags.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Checklist */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Completion Checklist</h3>
          <div className="space-y-3">
            <ChecklistItem 
              completed={!!profile.name && !!profile.description} 
              label="Basic information"
            />
            <ChecklistItem 
              completed={hasImages} 
              label="Restaurant images"
              optional
            />
            <ChecklistItem 
              completed={hasTags} 
              label="Tags & attributes"
              optional
            />
          </div>
        </Card>

        {/* Status Explainer */}
        <Card className="p-5 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-primary mb-1">Draft vs Live</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Draft:</strong> Only you can see your restaurant. Perfect for setting up before launch.
                <br />
                <strong>Live:</strong> Your restaurant appears in search, discovery, and recommendations.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border space-y-2">
        <Button
          onClick={() => handlePublish('live')}
          disabled={isPublishing || !profile.name}
          className="w-full h-12 font-medium"
        >
          {isPublishing ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Publishing...
            </span>
          ) : (
            <>
              <Check className="h-5 w-5 mr-2" />
              Publish Live
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => handlePublish('draft')}
          disabled={isPublishing}
          className="w-full h-12"
        >
          Save as Draft
        </Button>
      </div>
    </div>
  );
};

const ChecklistItem = ({ 
  completed, 
  label, 
  optional 
}: { 
  completed: boolean; 
  label: string; 
  optional?: boolean;
}) => (
  <div className="flex items-center gap-3">
    <div className={cn(
      "w-5 h-5 rounded-full flex items-center justify-center",
      completed ? "bg-primary" : "bg-muted border border-border"
    )}>
      {completed && <Check className="h-3 w-3 text-primary-foreground" />}
    </div>
    <span className={cn(
      "text-sm",
      completed ? "text-foreground" : "text-muted-foreground"
    )}>
      {label}
      {optional && !completed && (
        <span className="text-xs text-muted-foreground ml-1">(optional)</span>
      )}
    </span>
  </div>
);

export default OnboardingReview;
