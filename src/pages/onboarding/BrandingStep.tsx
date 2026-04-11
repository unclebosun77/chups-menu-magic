import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Camera, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { loadRestaurantDraft, saveRestaurantDraft, updateDraftStep, saveDraftToSupabase } from '@/utils/onboardingStore';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BrandingStep = () => {
  const navigate = useNavigate();
  const [logo, setLogo] = useState<string>('');
  const [coverPhoto, setCoverPhoto] = useState<string>('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [logoSaved, setLogoSaved] = useState(false);
  const [coverSaved, setCoverSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const draft = loadRestaurantDraft();
    setLogo(draft.branding.logo || '');
    setCoverPhoto(draft.branding.coverPhoto || '');
  }, []);

  const getFileExt = (filename: string) => filename.split('.').pop()?.toLowerCase() || 'jpg';

  const uploadFile = async (file: File, bucket: string, prefix: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please sign in to upload files');
      return null;
    }
    const userId = session.user.id;
    const ext = getFileExt(file.name);
    const path = `${userId}/${prefix}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('row-level security') || msg.includes('policy')) {
        toast.error('Upload permissions not set up — please contact support');
      } else if (msg.includes('not found') || msg.includes('bucket')) {
        toast.error('Storage not configured — please try again');
      } else if (msg.includes('size')) {
        toast.error('File too large — please use an image under 5MB');
      } else {
        toast.error(`Upload failed: ${error.message}`);
      }
      return null;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    const url = await uploadFile(file, 'restaurant-logos', 'logo');
    if (url) {
      setLogo(url);
      const updated = saveRestaurantDraft('branding', { logo: url, coverPhoto });
      saveDraftToSupabase(updated);
      setLogoSaved(true);
      setTimeout(() => setLogoSaved(false), 2000);
    }
    setLogoUploading(false);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    const url = await uploadFile(file, 'restaurant-gallery', 'cover');
    if (url) {
      setCoverPhoto(url);
      const updated = saveRestaurantDraft('branding', { logo, coverPhoto: url });
      saveDraftToSupabase(updated);
      setCoverSaved(true);
      setTimeout(() => setCoverSaved(false), 2000);
    }
    setCoverUploading(false);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleSave = useCallback(() => {
    const updated = saveRestaurantDraft('branding', { logo, coverPhoto });
    updateDraftStep(2, true);
    saveDraftToSupabase(updated);
    navigate('/restaurant/onboarding/details');
  }, [logo, coverPhoto, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/30 pb-24">
      <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/restaurant/onboarding')} className="rounded-full">
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
          <p className="text-sm text-muted-foreground mb-4">Upload your logo for brand recognition</p>
          <div className="flex items-center gap-4">
            <div
              onClick={() => !logoUploading && logoInputRef.current?.click()}
              className={cn(
                "w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer",
                "transition-all hover:border-purple/50 hover:bg-purple/5",
                logo ? "border-purple/30 bg-purple/5" : "border-border"
              )}
            >
              {logoUploading ? (
                <Loader2 className="h-8 w-8 text-purple animate-spin" />
              ) : logo ? (
                <div className="relative w-full h-full">
                  <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setLogo(''); saveRestaurantDraft('branding', { logo: '', coverPhoto }); }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <Camera className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <Button variant="outline" onClick={() => !logoUploading && logoInputRef.current?.click()} disabled={logoUploading} className="gap-2">
              <Upload className="h-4 w-4" />
              {logoUploading ? 'Uploading…' : 'Upload Logo'}
            </Button>
          </div>
        </Card>

        {/* Cover Photo Upload */}
        <Card className="p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="font-semibold text-foreground mb-2">Cover Photo</h3>
          <p className="text-sm text-muted-foreground mb-4">A stunning hero image for your profile</p>
          <div
            onClick={() => !coverUploading && coverInputRef.current?.click()}
            className={cn(
              "w-full aspect-video rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer",
              "transition-all hover:border-purple/50 hover:bg-purple/5",
              coverPhoto ? "border-purple/30" : "border-border"
            )}
          >
            {coverUploading ? (
              <Loader2 className="h-10 w-10 text-purple animate-spin" />
            ) : coverPhoto ? (
              <div className="relative w-full h-full">
                <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover rounded-xl" />
                <button
                  onClick={(e) => { e.stopPropagation(); setCoverPhoto(''); saveRestaurantDraft('branding', { logo, coverPhoto: '' }); }}
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
        <Button onClick={handleSave} className="w-full h-12 bg-gradient-to-r from-purple to-neon-pink text-white font-medium rounded-xl">
          Continue
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default BrandingStep;
