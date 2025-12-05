import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, MapPin, Star, Users, Heart, Coffee, RefreshCw, ChevronRight, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";

const vibeTagsMap: Record<string, { label: string; icon: React.ReactNode }[]> = {
  "yakoyo-demo": [
    { label: "Cultural", icon: <Sparkles className="h-3 w-3" /> },
    { label: "Group Friendly", icon: <Users className="h-3 w-3" /> },
    { label: "Vibrant", icon: <TrendingUp className="h-3 w-3" /> },
  ],
  "cosby-demo": [
    { label: "Date Night", icon: <Heart className="h-3 w-3" /> },
    { label: "Romantic", icon: <Heart className="h-3 w-3" /> },
    { label: "Elegant", icon: <Star className="h-3 w-3" /> },
  ],
  "prox-demo": [
    { label: "Cozy", icon: <Coffee className="h-3 w-3" /> },
    { label: "Authentic", icon: <Sparkles className="h-3 w-3" /> },
    { label: "Premium", icon: <Star className="h-3 w-3" /> },
  ],
};

const reasonsMap: Record<string, string[]> = {
  "yakoyo-demo": [
    "Matches your love for African cuisine",
    "Highly rated for group dining",
    "Popular this week in your area",
    "Perfect for trying something new",
  ],
  "cosby-demo": [
    "Matches your Italian food preferences",
    "Top-rated for romantic dinners",
    "Close to your current location",
    "Exceptional reviews this month",
  ],
  "prox-demo": [
    "Matches your interest in Asian cuisine",
    "Great for cozy evening meals",
    "Authentic flavors you'll love",
    "Trending among people like you",
  ],
};

const YourNextSpot = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentRestaurant = personalizedRestaurants[currentIndex];
  const vibeTags = vibeTagsMap[currentRestaurant.id] || vibeTagsMap["yakoyo-demo"];
  const reasons = reasonsMap[currentRestaurant.id] || reasonsMap["yakoyo-demo"];

  const transformedRestaurant = {
    id: currentRestaurant.id,
    name: currentRestaurant.name,
    rating: currentRestaurant.rating,
    cuisine: currentRestaurant.cuisine,
    price_level: currentRestaurant.priceLevel,
    description: currentRestaurant.description,
    images: [currentRestaurant.imageUrl],
  };

  const handleShowAnother = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % personalizedRestaurants.length);
      setIsRefreshing(false);
    }, 500);
  };

  const handleViewRestaurant = () => {
    navigate(`/restaurant/${currentRestaurant.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-purple/5 pb-8">
      {/* Header */}
      <div className="px-4 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground tracking-tight">Your Next Spot</h1>
            <p className="text-sm text-muted-foreground/70 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-purple" />
              Outa picked this for you
            </p>
          </div>
        </div>

        {/* AI Confidence Badge */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple/10 border border-purple/20 rounded-full">
            <Sparkles className="h-3.5 w-3.5 text-purple" />
            <span className="text-xs font-medium text-purple">{currentRestaurant.matchScore}% match</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border/60 rounded-full">
            <Clock className="h-3 w-3 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground/70">Updated just now</span>
          </div>
        </div>

        {/* Restaurant Card - Centered */}
        <div className={`flex justify-center transition-all duration-300 ${isRefreshing ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
          <RestaurantCard restaurant={transformedRestaurant} />
        </div>

        {/* Vibe Tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {vibeTags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border/60 rounded-full"
            >
              <span className="text-purple/70">{tag.icon}</span>
              <span className="text-xs text-foreground">{tag.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Why Outa Picked This */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-br from-card via-card to-purple/5 border border-border/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-purple/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-purple" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Why Outa chose this for you</p>
              <p className="text-[11px] text-muted-foreground/60">Based on your preferences</p>
            </div>
          </div>
          
          <div className="space-y-2.5">
            {reasons.map((reason, index) => (
              <div key={index} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple/60 mt-1.5 flex-shrink-0" />
                <p className="text-sm text-foreground/80">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="px-4 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 bg-card border border-border/60 rounded-xl p-3 text-center">
            <MapPin className="h-4 w-4 text-purple mx-auto mb-1" />
            <p className="text-xs text-muted-foreground/60">Distance</p>
            <p className="text-sm font-medium text-foreground">{currentRestaurant.distance}</p>
          </div>
          <div className="flex-1 bg-card border border-border/60 rounded-xl p-3 text-center">
            <Star className="h-4 w-4 text-purple mx-auto mb-1" />
            <p className="text-xs text-muted-foreground/60">Rating</p>
            <p className="text-sm font-medium text-foreground">{currentRestaurant.rating}</p>
          </div>
          <div className="flex-1 bg-card border border-border/60 rounded-xl p-3 text-center">
            <TrendingUp className="h-4 w-4 text-purple mx-auto mb-1" />
            <p className="text-xs text-muted-foreground/60">Price</p>
            <p className="text-sm font-medium text-foreground">{currentRestaurant.priceLevel}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 space-y-3">
        <Button
          onClick={handleViewRestaurant}
          className="w-full h-12 bg-purple hover:bg-purple/90 text-white rounded-xl text-sm font-semibold shadow-lg"
        >
          View Restaurant
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
        
        <Button
          onClick={handleShowAnother}
          variant="outline"
          disabled={isRefreshing}
          className="w-full h-12 border-border/60 text-foreground hover:bg-secondary/30 rounded-xl text-sm font-medium"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Show Another Option
        </Button>
      </div>

      {/* AI Note */}
      <div className="px-4 mt-6">
        <p className="text-center text-xs text-muted-foreground/50">
          Recommendations powered by Outa Intelligence
        </p>
      </div>
    </div>
  );
};

export default YourNextSpot;
