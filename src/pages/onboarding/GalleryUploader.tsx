// Storage bucket: "restaurant-gallery" — public read, authenticated upload
// Upload path: {userId}/{timestamp}-{filename}

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Image, Plus, X, GripVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { loadRestaurantDraft, saveRestaurantDraft, updateDraftStep, generateId, GalleryImageDraft, saveDraftToSupabase } from '@/utils/onboardingStore';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const MAX_IMAGES = 10;

const IMAGE_TYPES: { value: GalleryImageDraft['type']; label: string; emoji: string }[] = [
  { value: 'interior', label: 'Interior', emoji: '🏠' },
  { value: 'exterior', label: 'Exterior', emoji: '🏢' },
  { value: 'food', label: 'Food', emoji: '🍽️' },
  { value: 'staff', label: 'Staff', emoji: '👨‍🍳' },
];

const GalleryUploader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<GalleryImageDraft[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const draft = loadRestaurantDraft();
    setImages(draft.gallery);
  }, []);

  const handleSave = useCallback(() => {
    const updated = saveRestaurantDraft('gallery', images);
    updateDraftStep(5, true);
    saveDraftToSupabase(updated);
    navigate('/restaurant/onboarding/hours');
  }, [images, navigate]);

  const uploadFiles = useCallback(async (files: FileList) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Please log in to upload images", variant: "destructive" });
      return;
    }

    const userId = session.user.id;
    const remaining = MAX_IMAGES - images.length;
    const filesToUpload = Array.from(files).slice(0, remaining);

    if (filesToUpload.length === 0) {
      toast({ title: `Maximum ${MAX_IMAGES} images allowed`, variant: "destructive" });
      return;
    }

    setUploadingCount(filesToUpload.length);

    for (const file of filesToUpload) {
      const tempId = generateId();
      const ext = file.name.split('.').pop() || 'jpg';
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `${userId}/${Date.now()}-${safeName}`;

      setUploadProgress(prev => ({ ...prev, [tempId]: 10 }));

      try {
        const { error } = await supabase.storage
          .from('restaurant-gallery')
          .upload(path, file, { upsert: true });

        if (error) {
          console.error('Gallery upload error:', JSON.stringify(error), 'bucket: restaurant-gallery', 'path:', path);
          const msg = error.message.toLowerCase();
          const desc = msg.includes('row-level security') || msg.includes('policy')
            ? 'Upload permissions not set up — please contact support'
            : msg.includes('not found') || msg.includes('bucket')
            ? 'Storage not configured — please try again'
            : msg.includes('size')
            ? 'File too large — please use an image under 10MB'
            : `${file.name}: ${error.message}`;
          toast({ title: "Upload failed", description: desc, variant: "destructive" });
          setUploadProgress(prev => { const n = { ...prev }; delete n[tempId]; return n; });
          continue;
        }

        setUploadProgress(prev => ({ ...prev, [tempId]: 80 }));

        const { data: { publicUrl } } = supabase.storage
          .from('restaurant-gallery')
          .getPublicUrl(path);

        setUploadProgress(prev => ({ ...prev, [tempId]: 100 }));

        const newImage: GalleryImageDraft = {
          id: tempId,
          url: publicUrl,
          type: 'interior',
          order: images.length,
        };

        setImages(prev => [...prev, newImage]);

        // Clean up progress after a moment
        setTimeout(() => {
          setUploadProgress(prev => { const n = { ...prev }; delete n[tempId]; return n; });
        }, 800);
      } catch (err: any) {
        toast({ title: "Upload error", description: err.message, variant: "destructive" });
        setUploadProgress(prev => { const n = { ...prev }; delete n[tempId]; return n; });
      }
    }

    setUploadingCount(0);
  }, [images.length, toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
    e.target.value = '';
  }, [uploadFiles]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id).map((img, i) => ({ ...img, order: i })));
  }, []);

  const updateImageType = useCallback((id: string, type: GalleryImageDraft['type']) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, type } : img));
  }, []);

  const getTypeCount = (type: GalleryImageDraft['type']) => {
    return images.filter(img => img.type === type).length;
  };

  const activeUploads = Object.entries(uploadProgress);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/30 pb-32">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/restaurant/onboarding/menu')} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <p className="text-xs text-purple font-medium">Step 4 of 6</p>
              <h1 className="text-xl font-bold text-foreground">Gallery</h1>
            </div>
            <span className="text-sm text-muted-foreground">{images.length}/{MAX_IMAGES}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Type Summary */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {IMAGE_TYPES.map(type => (
            <Card
              key={type.value}
              className={cn(
                "flex-shrink-0 px-4 py-2 flex items-center gap-2",
                getTypeCount(type.value) > 0 && "border-purple/30 bg-purple/5"
              )}
            >
              <span>{type.emoji}</span>
              <span className="text-sm font-medium">{type.label}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-secondary">{getTypeCount(type.value)}</span>
            </Card>
          ))}
        </div>

        {/* Upload Area */}
        <Card
          onClick={() => images.length < MAX_IMAGES && fileInputRef.current?.click()}
          className={cn(
            "p-8 border-2 border-dashed border-purple/30 bg-purple/5 transition-all animate-slide-up",
            images.length < MAX_IMAGES ? "cursor-pointer hover:border-purple/50" : "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="text-center">
            {uploadingCount > 0 ? (
              <>
                <Loader2 className="h-8 w-8 text-purple mx-auto mb-3 animate-spin" />
                <p className="font-medium text-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-purple/20 flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-8 w-8 text-purple" />
                </div>
                <p className="font-medium text-foreground">Add Photos</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {images.length >= MAX_IMAGES
                    ? `Maximum ${MAX_IMAGES} images reached`
                    : "Upload high-quality images of your restaurant"}
                </p>
              </>
            )}
          </div>
        </Card>

        {/* Upload progress indicators */}
        {activeUploads.length > 0 && (
          <div className="space-y-2">
            {activeUploads.map(([id, progress]) => (
              <div key={id} className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-purple flex-shrink-0" />
                <Progress value={progress} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground w-8">{progress}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {images.map((image, index) => (
              <Card
                key={image.id}
                className="relative overflow-hidden animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <img src={image.url} alt={`Gallery ${index + 1}`} className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-grab">
                      <GripVertical className="h-4 w-4 text-white" />
                    </div>
                    <button onClick={() => removeImage(image.id)} className="w-8 h-8 rounded-full bg-destructive/80 flex items-center justify-center">
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                  <Select value={image.type} onValueChange={(v: GalleryImageDraft['type']) => updateImageType(image.id, v)}>
                    <SelectTrigger className="h-8 bg-black/50 border-0 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {IMAGE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.emoji} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tips */}
        {images.length < 3 && (
          <Card className="p-4 bg-amber-500/10 border-amber-500/20 animate-slide-up">
            <p className="text-xs text-amber-500 font-medium mb-1">📸 Tip</p>
            <p className="text-sm text-muted-foreground">
              Add at least 3 photos for a complete gallery. Include interior, food, and ambiance shots.
            </p>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50">
        <Button
          onClick={handleSave}
          disabled={uploadingCount > 0}
          className="w-full h-12 bg-gradient-to-r from-purple to-neon-pink text-white font-medium rounded-xl"
        >
          Continue to Hours
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default GalleryUploader;
