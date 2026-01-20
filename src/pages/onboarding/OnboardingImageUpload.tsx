import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { loadRestaurantDraft, saveRestaurantDraft, updateDraftStep } from '@/utils/onboardingStore';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  uploading?: boolean;
}

const OnboardingImageUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [logo, setLogo] = useState<UploadedImage | null>(null);
  const [galleryImages, setGalleryImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUserId(session.user.id);

      // Load draft
      const draft = loadRestaurantDraft();
      if (!draft.profile.name) {
        navigate('/restaurant/onboarding');
        return;
      }

      // Load existing images from draft
      if (draft.branding?.logo) {
        setLogo({ id: 'logo', url: draft.branding.logo, name: 'Logo' });
      }
      if (draft.gallery?.length > 0) {
        setGalleryImages(draft.gallery.map((g: any) => ({
          id: g.id,
          url: g.url,
          name: g.type || 'Image'
        })));
      }
    };
    init();
  }, [navigate]);

  const uploadFile = useCallback(async (file: File, type: 'logo' | 'gallery'): Promise<string | null> => {
    if (!userId) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('restaurant-images')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast({
        title: "Upload failed",
        description: uploadError.message,
        variant: "destructive"
      });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('restaurant-images')
      .getPublicUrl(fileName);

    return publicUrl;
  }, [userId, toast]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Logo must be under 5MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const url = await uploadFile(file, 'logo');
    if (url) {
      setLogo({ id: 'logo', url, name: file.name });
    }
    setIsUploading(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    for (const file of Array.from(files)) {
      // Validate each file
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 10 * 1024 * 1024) continue;

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      
      // Add temporary preview
      const previewUrl = URL.createObjectURL(file);
      setGalleryImages(prev => [...prev, { id: tempId, url: previewUrl, name: file.name, uploading: true }]);

      const url = await uploadFile(file, 'gallery');
      
      if (url) {
        setGalleryImages(prev => 
          prev.map(img => img.id === tempId 
            ? { id: `img-${Date.now()}`, url, name: file.name, uploading: false }
            : img
          )
        );
      } else {
        setGalleryImages(prev => prev.filter(img => img.id !== tempId));
      }
    }
    
    setIsUploading(false);
  };

  const removeLogo = () => {
    setLogo(null);
  };

  const removeGalleryImage = (id: string) => {
    setGalleryImages(prev => prev.filter(img => img.id !== id));
  };

  const handleContinue = () => {
    // Save to draft
    saveRestaurantDraft('branding', {
      logo: logo?.url || '',
      coverPhoto: galleryImages[0]?.url || '',
    });
    saveRestaurantDraft('gallery', galleryImages.map(img => ({
      id: img.id,
      url: img.url,
      type: 'general',
    })));
    updateDraftStep(3, true);
    navigate('/restaurant/onboarding/tags');
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/restaurant/onboarding')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <p className="text-xs text-primary font-medium">Step 2 of 4</p>
              <h1 className="text-xl font-semibold">Upload Images</h1>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-2/4 bg-primary rounded-full transition-all duration-300" />
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5">
        {/* Logo Upload */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="h-4 w-4 text-primary" />
            <Label className="font-medium">Restaurant Logo</Label>
            <span className="text-xs text-muted-foreground">(Optional)</span>
          </div>
          
          {logo ? (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted">
              <img src={logo.url} alt="Logo" className="w-full h-full object-cover" />
              <button
                onClick={removeLogo}
                className="absolute top-1 right-1 p-1 bg-background/80 rounded-full hover:bg-background"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-1 right-1 p-1 bg-primary rounded-full">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Add Logo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Square format recommended (1:1 ratio)
          </p>
        </Card>

        {/* Gallery Upload */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <Label className="font-medium">Gallery Images</Label>
            </div>
            <span className="text-xs text-muted-foreground">{galleryImages.length} photos</span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Upload photos of your restaurant, food, and ambiance. These will appear on your profile.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {/* Upload Button */}
            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground text-center px-2">Add Photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>

            {/* Uploaded Images */}
            {galleryImages.map((image) => (
              <div 
                key={image.id} 
                className={cn(
                  "relative aspect-square rounded-xl overflow-hidden bg-muted",
                  image.uploading && "opacity-50"
                )}
              >
                <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
                {image.uploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <button
                    onClick={() => removeGalleryImage(image.id)}
                    className="absolute top-1 right-1 p-1 bg-background/80 rounded-full hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Tip: Include photos of your interior, signature dishes, and outdoor seating if available.
          </p>
        </Card>

        {/* Empty State Message */}
        {galleryImages.length === 0 && !logo && (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              You can add images later, but restaurants with photos get more engagement.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          onClick={handleContinue}
          className="w-full h-12 font-medium"
        >
          {galleryImages.length === 0 && !logo ? 'Skip for Now' : 'Continue to Tags'}
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingImageUpload;
