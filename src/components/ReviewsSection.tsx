import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Trash2, Camera, X, UtensilsCrossed, Loader2, Building2, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  photos: string[] | null;
  dish_tag: string | null;
  restaurant_response: string | null;
  restaurant_response_at: string | null;
};

type ReviewsSectionProps = {
  restaurantId: string;
  isOwner?: boolean;
};

const ReviewsSection = ({ restaurantId, isOwner = false }: ReviewsSectionProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [dishTag, setDishTag] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  useEffect(() => {
    loadReviews();
    if (user) {
      loadUserReview(user.id);
    }
  }, [restaurantId, user]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Parse photos from JSON
        const parsedReviews: Review[] = data.map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at || '',
          user_id: review.user_id,
          photos: Array.isArray(review.photos) ? (review.photos as string[]) : [],
          dish_tag: review.dish_tag,
          restaurant_response: review.restaurant_response,
          restaurant_response_at: review.restaurant_response_at,
        }));
        setReviews(parsedReviews);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserReview = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        const photosArray = Array.isArray(data.photos) ? (data.photos as string[]) : [];
        const parsedReview: Review = {
          id: data.id,
          rating: data.rating,
          comment: data.comment,
          created_at: data.created_at || '',
          user_id: data.user_id,
          photos: photosArray,
          dish_tag: data.dish_tag,
          restaurant_response: data.restaurant_response,
          restaurant_response_at: data.restaurant_response_at,
        };
        setUserReview(parsedReview);
        setRating(data.rating);
        setComment(data.comment || "");
        setDishTag(data.dish_tag || "");
        setPhotos(photosArray);
      } else {
        setUserReview(null);
        setRating(0);
        setComment("");
        setDishTag("");
        setPhotos([]);
      }
    } catch (error) {
      console.error("Error loading user review:", error);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    setIsUploading(true);
    const newPhotos: string[] = [];

    try {
      for (const file of Array.from(files).slice(0, 3 - photos.length)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
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
      toast({ title: "Upload failed", variant: "destructive" });
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
        title: "Authentication required",
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

    const reviewData = {
      restaurant_id: restaurantId,
      user_id: user.id,
      rating,
      comment: comment.trim() || null,
      dish_tag: dishTag.trim() || null,
      photos: photos.length > 0 ? photos : [],
    };

    const { error } = userReview
      ? await supabase.from("reviews").update(reviewData).eq("id", userReview.id)
      : await supabase.from("reviews").insert([reviewData]);

    if (error) {
      toast({
        title: "Error submitting review",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: userReview ? "Review updated!" : "Review submitted!",
        description: "Thank you for your feedback",
      });
      loadReviews();
      if (user) loadUserReview(user.id);
    }

    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!user || !userReview) return;
    
    setIsDeleting(true);
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", userReview.id);

    if (error) {
      toast({ title: "Error deleting review", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review deleted" });
      setUserReview(null);
      setRating(0);
      setComment("");
      setDishTag("");
      setPhotos([]);
      loadReviews();
    }
    setIsDeleting(false);
  };

  const handleSubmitResponse = async (reviewId: string) => {
    if (!responseText.trim()) return;

    setIsSubmittingResponse(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .update({
          restaurant_response: responseText.trim(),
          restaurant_response_at: new Date().toISOString(),
        })
        .eq("id", reviewId);

      if (error) throw error;

      toast({ title: "Response submitted" });
      setRespondingTo(null);
      setResponseText("");
      loadReviews();
    } catch (error) {
      console.error("Error submitting response:", error);
      toast({ title: "Error submitting response", variant: "destructive" });
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Get all photos from reviews for gallery
  const allPhotos = reviews.flatMap(r => r.photos || []).slice(0, 6);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Reviews & Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-muted-foreground">Loading reviews...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews & Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{avgRating.toFixed(1)}</div>
            <div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {reviews.length === 0 
                  ? "No reviews yet" 
                  : `Based on ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery from Reviews */}
      {allPhotos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground px-1">Photos from guests</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allPhotos.map((photo, index) => (
              <div key={index} className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={photo} 
                  alt={`Guest photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write/Edit Review */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {userReview ? "Update Your Review" : "Share Your Experience"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Rating */}
            <div>
              <p className="text-sm font-medium mb-2">Your Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <p className="text-sm font-medium mb-2">Your Feedback</p>
              <Textarea
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                What did you order? Anything good to know?
              </p>
            </div>

            {/* Dish Tag */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                What did you order?
                <span className="text-muted-foreground font-normal">(optional)</span>
              </p>
              <Input
                placeholder="e.g. Jollof Rice, Pad Thai..."
                value={dishTag}
                onChange={(e) => setDishTag(e.target.value)}
              />
            </div>

            {/* Photos */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Add Photos
                <span className="text-muted-foreground font-normal">(optional)</span>
              </p>
              
              <div className="flex gap-2 flex-wrap">
                {photos.map((photo, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <img 
                      src={photo} 
                      alt={`Review photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                
                {photos.length < 3 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
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
            </div>

            {/* Submit */}
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
              </Button>
              {userReview && (
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-foreground font-medium mb-1">No reviews yet</p>
              <p className="text-sm text-muted-foreground">
                {user ? "Be the first to leave a review!" : "Sign in to leave a review"}
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6 space-y-3">
                {/* Rating & Dish Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  {review.dish_tag && (
                    <span className="text-xs bg-muted/50 px-2 py-1 rounded-full text-muted-foreground flex items-center gap-1">
                      <UtensilsCrossed className="w-3 h-3" />
                      {review.dish_tag}
                    </span>
                  )}
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}

                {/* Review Photos */}
                {review.photos && review.photos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {review.photos.map((photo, index) => (
                      <div key={index} className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={photo} 
                          alt={`Review photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Restaurant Response */}
                {review.restaurant_response && (
                  <div className="bg-muted/30 rounded-lg p-3 mt-3 border-l-2 border-primary/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-primary">Restaurant Response</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.restaurant_response}</p>
                    {review.restaurant_response_at && (
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        {new Date(review.restaurant_response_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Owner Response Form */}
                {isOwner && !review.restaurant_response && (
                  <div className="pt-2">
                    {respondingTo === review.id ? (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Write your response..."
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          rows={2}
                          className="resize-none text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSubmitResponse(review.id)}
                            disabled={isSubmittingResponse || !responseText.trim()}
                          >
                            {isSubmittingResponse ? "Sending..." : "Submit Response"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setRespondingTo(null);
                              setResponseText("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-primary"
                        onClick={() => setRespondingTo(review.id)}
                      >
                        <ChevronRight className="w-3 h-3 mr-1" />
                        Respond to this review
                      </Button>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;