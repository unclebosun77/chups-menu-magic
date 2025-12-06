import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { loadRestaurantDraft, saveRestaurantDraft, updateDraftStep } from '@/utils/onboardingStore';
import { cn } from '@/lib/utils';

const BrandingStep = () => {
  const navigate = useNavigate();
  const [logo, setLogo] = useState<string>('');
  const [coverPhoto, setCoverPhoto] = useState<string>('');

  useEffect(() => {
    const draft = loadRestaurantDraft();
    setLogo(draft.branding.logo || '');
    setCoverPhoto(draft.branding.coverPhoto || '');
  }, []);

  const handleSave = useCallback(() => {
    saveRestaurantDraft('branding', { logo, coverPhoto });
    updateDraftStep(2, true);
    navigate('/restaurant/onboarding/details');
  }, [logo, coverPhoto, navigate]);

  // Mock file upload - in production this would upload to storage
  const handleLogoUpload = () => {
    // Simulate file selection with a placeholder
    const mockUrl = 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=200&h=200&fit=crop';
    setLogo(mockUrl);
  };

  const handleCoverUpload = () => {
    const mockUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop';
    setCoverPhoto(mockUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/30 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
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
              <p className="text-xs text-purple font-medium">Step 1 of 6</p>
              <h1 className="text-xl font-bold text-foreground">Branding</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Logo Upload */}
        <Card className="p-6 animate-slide-up">
          <h3 className="font-semibold text-foreground mb-2">Restaurant Logo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload your logo for brand recognition
          </p>
          
          <div className="flex items-center gap-4">
            <div 
              onClick={handleLogoUpload}
              className={cn(
                "w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer",
                "transition-all hover:border-purple/50 hover:bg-purple/5",
                logo ? "border-purple/30 bg-purple/5" : "border-border"
              )}
            >
              {logo ? (
                <div className="relative w-full h-full">
                  <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setLogo(''); }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <Camera className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            
            <Button variant="outline" onClick={handleLogoUpload} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Logo
            </Button>
          </div>
        </Card>

        {/* Cover Photo Upload */}
        <Card className="p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="font-semibold text-foreground mb-2">Cover Photo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            A stunning hero image for your profile
          </p>
          
          <div 
            onClick={handleCoverUpload}
            className={cn(
              "w-full aspect-video rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer",
              "transition-all hover:border-purple/50 hover:bg-purple/5",
              coverPhoto ? "border-purple/30" : "border-border"
            )}
          >
            {coverPhoto ? (
              <div className="relative w-full h-full">
                <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover rounded-xl" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setCoverPhoto(''); }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload cover photo</p>
              </div>
            )}
          </div>
        </Card>

        {/* Tips */}
        <Card className="p-4 bg-purple/5 border-purple/20 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <p className="text-xs text-purple font-medium mb-1">💡 Pro Tip</p>
          <p className="text-sm text-muted-foreground">
            High-quality images increase customer engagement by 40%. Use photos that represent your restaurant's atmosphere.
          </p>
        </Card>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50">
        <Button
          onClick={handleSave}
          className="w-full h-12 bg-gradient-to-r from-purple to-neon-pink text-white font-medium rounded-xl"
        >
          Continue
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default BrandingStep;
