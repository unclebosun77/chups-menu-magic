import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Image, Plus, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { loadRestaurantDraft, saveRestaurantDraft, updateDraftStep, generateId, GalleryImageDraft } from '@/utils/onboardingStore';
import { cn } from '@/lib/utils';

const IMAGE_TYPES: { value: GalleryImageDraft['type']; label: string; emoji: string }[] = [
  { value: 'interior', label: 'Interior', emoji: '🏠' },
  { value: 'exterior', label: 'Exterior', emoji: '🏢' },
  { value: 'food', label: 'Food', emoji: '🍽️' },
  { value: 'staff', label: 'Staff', emoji: '👨‍🍳' },
];

// Mock images for demo
const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
];

const GalleryUploader = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<GalleryImageDraft[]>([]);

  useEffect(() => {
    const draft = loadRestaurantDraft();
    setImages(draft.gallery);
  }, []);

  const handleSave = useCallback(() => {
    saveRestaurantDraft('gallery', images);
    updateDraftStep(5, true);
    navigate('/restaurant/onboarding/hours');
  }, [images, navigate]);

  const addImage = useCallback(() => {
    // Mock: Add a random image
    const mockUrl = MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)];
    const newImage: GalleryImageDraft = {
      id: generateId(),
      url: mockUrl,
      type: 'interior',
      order: images.length,
    };
    setImages(prev => [...prev, newImage]);
  }, [images.length]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id).map((img, i) => ({ ...img, order: i })));
  }, []);

  const updateImageType = useCallback((id: string, type: GalleryImageDraft['type']) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, type } : img));
  }, []);

  const getTypeCount = (type: GalleryImageDraft['type']) => {
    return images.filter(img => img.type === type).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/30 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/restaurant/onboarding/menu')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <p className="text-xs text-purple font-medium">Step 4 of 6</p>
              <h1 className="text-xl font-bold text-foreground">Gallery</h1>
            </div>
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
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-secondary">
                {getTypeCount(type.value)}
              </span>
            </Card>
          ))}
        </div>

        {/* Upload Area */}
        <Card 
          onClick={addImage}
          className="p-8 border-2 border-dashed border-purple/30 bg-purple/5 cursor-pointer hover:border-purple/50 transition-all animate-slide-up"
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple/20 flex items-center justify-center mx-auto mb-3">
              <Plus className="h-8 w-8 text-purple" />
            </div>
            <p className="font-medium text-foreground">Add Photos</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload high-quality images of your restaurant
            </p>
          </div>
        </Card>

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {images.map((image, index) => (
              <Card 
                key={image.id}
                className="relative overflow-hidden animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <img 
                  src={image.url} 
                  alt={`Gallery ${index + 1}`}
                  className="w-full aspect-square object-cover"
                />
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-grab">
                      <GripVertical className="h-4 w-4 text-white" />
                    </div>
                    <button 
                      onClick={() => removeImage(image.id)}
                      className="w-8 h-8 rounded-full bg-destructive/80 flex items-center justify-center"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                  
                  <Select 
                    value={image.type} 
                    onValueChange={(v: GalleryImageDraft['type']) => updateImageType(image.id, v)}
                  >
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
