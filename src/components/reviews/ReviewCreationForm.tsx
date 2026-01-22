import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Star, Camera, X, UtensilsCrossed, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

type Restaurant = {
  id: string;
  name: string;
  city: string | null;
  cuisine_type: string;
};

type ReviewCreationFormProps = {
  restaurant: Restaurant;
  onBack: () => void;
  onSuccess: () => void;
};

const ReviewCreationForm = ({ restaurant, onBack, onSuccess }: ReviewCreationFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [dishTag, setDishTag] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    setIsUploading(true);
    const newPhotos: string[] = [];

    try {
      for (const file of Array.from(files).slice(0, 3 - photos.length)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('restaurant-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('restaurant-images')
          .getPublicUrl(fileName);

        newPhotos.push(publicUrl);
      }

      setPhotos(prev => [...prev, ...newPhotos].slice(0, 3));
      
      if (newPhotos.length > 0) {
        toast({ title: "Photos uploaded", description: `${newPhotos.length} photo(s) added` });
      }
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast({ title: "Upload failed", description: "Could not upload photos", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("reviews").insert([{
        restaurant_id: restaurant.id,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
        dish_tag: dishTag.trim() || null,
        photos: photos.length > 0 ? photos : [],
      }]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already reviewed",
            description: "You've already left a review for this location. You can edit it from the restaurant page.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Review submitted",
          description: "Thank you for your feedback!",
        });
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Could not submit your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatLocation = () => {
    if (restaurant.city) {
      return `${restaurant.name} — ${restaurant.city}`;
    }
    return restaurant.name;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Leave Feedback</h1>
            <p className="text-sm text-muted-foreground">{formatLocation()}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Rating */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Your Rating</label>
          <div className="flex gap-2 justify-center py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/40"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              {rating === 5 && "Exceptional!"}
              {rating === 4 && "Great experience"}
              {rating === 3 && "It was okay"}
              {rating === 2 && "Could be better"}
              {rating === 1 && "Disappointed"}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Your Feedback</label>
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="bg-muted/50 border-border/50 resize-none"
          />
          <p className="text-xs text-muted-foreground">
            What did you order? Anything good to know?
          </p>
        </div>

        {/* Dish Tag */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4" />
            What did you order?
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input
            placeholder="e.g. Jollof Rice, Pad Thai, Truffle Pasta..."
            value={dishTag}
            onChange={(e) => setDishTag(e.target.value)}
            className="bg-muted/50 border-border/50"
          />
        </div>

        {/* Photos */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Add Photos
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          
          <div className="flex gap-3 flex-wrap">
            {photos.map((photo, index) => (
              <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden">
                <img 
                  src={photo} 
                  alt={`Review photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            
            {photos.length < 3 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-24 h-24 rounded-lg border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-6 h-6" />
                    <span className="text-xs">Add</span>
                  </>
                )}
              </button>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />
          
          <p className="text-xs text-muted-foreground">
            Up to 3 photos
          </p>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="w-full h-12 text-base font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCreationForm;