import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { 
  UtensilsCrossed, Users, Calendar, Gift, MapPin, Phone, Bell,
  Wine, ChefHat, Crown, PartyPopper, Heart, Sparkles, Home, 
  Music, GlassWater, Cake, Coffee, Wheat, Map, Award, BookOpen,
  Leaf, Shield
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ExperienceDetailModal } from "@/components/ExperienceDetailModal";
import { EventPlannerModal } from "@/components/EventPlannerModal";
import { IconTile } from "@/components/IconTile";

const Services = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [reminderNote, setReminderNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<typeof experienceCategories[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventPlannerOpen, setIsEventPlannerOpen] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState<string | undefined>();

  const quickServices = [
    {
      icon: UtensilsCrossed,
      label: "Dine-In",
      onClick: () => navigate("/discover"),
    },
    {
      icon: Calendar,
      label: "Catering",
      onClick: () => navigate("/catering"),
    },
    {
      icon: Gift,
      label: "Rewards",
      onClick: () => navigate("/rewards"),
    },
    {
      icon: MapPin,
      label: "Locations",
      onClick: () => navigate("/discover"),
    },
    {
      icon: Phone,
      label: "Book Table",
      onClick: () => navigate("/bookings"),
    },
  ];

  const experienceCategories = [
    {
      id: "dining",
      title: "Exclusive",
      icon: UtensilsCrossed,
      emoji: "🍽️",
      color: "bg-gradient-to-br from-orange-500/10 to-red-500/10",
      items: [
        { name: "Private Dining", icon: Users, description: "Intimate setups or hidden chef's tables" },
        { name: "Chef's Table Nights", icon: ChefHat, description: "Behind-the-scenes tasting menus" },
        { name: "Home Dining", icon: Home, description: "Chef comes to you" },
        { name: "Pop-Up Restaurants & Food Events", icon: Sparkles, description: "Limited-time culinary adventures" },
        { name: "Rooftop / Outdoor Dining", icon: UtensilsCrossed, description: "Dine under the stars" },
        { name: "Surprise Dining", icon: Gift, description: "Mystery chef, mystery menu" },
      ],
    },
    {
      id: "pairings",
      title: "Pairings",
      icon: Wine,
      emoji: "🍷",
      color: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
      items: [
        { name: "Wine Pairing Nights", icon: Wine, description: "Perfect wine & food combinations" },
        { name: "Cocktail Mixology", icon: GlassWater, description: "Learn to craft signature cocktails" },
        { name: "Dessert Pairings", icon: Cake, description: "Sweet endings with perfect drinks" },
        { name: "Craft Beer Tastings", icon: Coffee, description: "Explore local & international brews" },
        { name: "Food & Music Pairing", icon: Music, description: "Harmonize flavors with melodies" },
      ],
    },
    {
      id: "learning",
      title: "Classes",
      icon: ChefHat,
      emoji: "👩🏽‍🍳",
      color: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
      items: [
        { name: "Cooking Classes", icon: ChefHat, description: "Master new cuisines & techniques" },
        { name: "Chef Masterclasses", icon: Award, description: "Learn from culinary legends" },
        { name: "Ingredient Workshops", icon: Wheat, description: "Deep dive into quality ingredients" },
        { name: "Farm-to-Table Tours", icon: Map, description: "Visit farms & see food sources" },
        { name: "Family Cooking", icon: Users, description: "Fun culinary activities for all ages" },
      ],
    },
    {
      id: "wellness",
      title: "Health",
      icon: Leaf,
      emoji: "🌿",
      color: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
      items: [
        { name: "Dietary Menus", icon: BookOpen, description: "Keto, vegan, paleo & more" },
        { name: "Nutritionist-Approved", icon: Heart, description: "Healthy & delicious balanced meals" },
        { name: "Calorie Tracking", icon: Award, description: "Know exactly what you're eating" },
        { name: "Allergen-Free Options", icon: Shield, description: "Safe meals for all dietary needs" },
        { name: "Organic & Local", icon: Leaf, description: "Farm-fresh sustainable ingredients" },
        { name: "Meal Prep Plans", icon: Calendar, description: "Weekly healthy meal subscriptions" },
        { name: "Detox Programs", icon: Sparkles, description: "Cleanse & rejuvenate your body" },
        { name: "Fitness Meals", icon: Award, description: "High-protein post-workout nutrition" },
      ],
    },
    {
      id: "celebrations",
      title: "Events",
      icon: PartyPopper,
      emoji: "🎉",
      color: "bg-gradient-to-br from-pink-500/10 to-rose-500/10",
      items: [
        { name: "CHUPS Concierge", icon: Sparkles, description: "AI-powered event planning assistant" },
        { name: "Special Occasions", icon: PartyPopper, description: "Celebrate life's big moments" },
        { name: "Proposal Packages", icon: Heart, description: "Make your moment unforgettable" },
        { name: "Seasonal Events", icon: Calendar, description: "Festive seasonal celebrations" },
        { name: "Themed Nights", icon: Sparkles, description: "Immersive culinary themes" },
        { name: "Group Dining", icon: Users, description: "Perfect for parties & gatherings" },
      ],
    },
    {
      id: "addons",
      title: "Add-Ons",
      icon: Gift,
      emoji: "✨",
      color: "bg-gradient-to-br from-indigo-500/10 to-violet-500/10",
      items: [
        { name: "Experience Gifting", icon: Gift, description: "Give memorable dining experiences" },
        { name: "Dine & Stay Packages", icon: Home, description: "Complete getaway experiences" },
        { name: "Restaurant Tours", icon: Map, description: "Behind-the-scenes kitchen tours" },
      ],
    },
  ];

  const handleCategoryClick = (category: typeof experienceCategories[0]) => {
    // Special handling for Occasions & Celebrations - open event planner for CHUPS Concierge
    if (category.id === "celebrations") {
      setIsEventPlannerOpen(true);
      setSelectedOccasion(undefined);
      return;
    }
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleExperienceItemClick = (categoryId: string, itemName: string) => {
    if (categoryId === "celebrations" && itemName === "CHUPS Concierge") {
      setIsEventPlannerOpen(true);
      setSelectedOccasion(undefined);
    } else if (categoryId === "celebrations") {
      // For specific occasion types, open event planner with context
      setSelectedOccasion(itemName);
      setIsEventPlannerOpen(true);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="pt-4">
        <h1 className="text-3xl font-bold bg-gradient-purple-glow bg-clip-text text-transparent">Services & Experiences</h1>
        <p className="text-muted-foreground mt-1">Explore everything CHUPS offers</p>
      </div>

      {/* Quick Services */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-purple">⚡</span> Quick Services
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {quickServices.map((service) => (
            <IconTile
              key={service.label}
              icon={service.icon}
              label={service.label}
              onClick={service.onClick}
            />
          ))}
        </div>
      </div>

      {/* Experiences */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-purple">✨</span> Curated Experiences
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {experienceCategories.map((category) => (
            <IconTile
              key={category.id}
              icon={category.icon}
              label={category.title}
              onClick={() => handleCategoryClick(category)}
              className={category.id === 'celebrations' ? 'ring-2 ring-primary' : ''}
            />
          ))}
        </div>
      </div>

      {/* Experience Detail Modal */}
      <ExperienceDetailModal
        category={selectedCategory}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
        }}
        onItemClick={handleExperienceItemClick}
      />

      {/* Event Planner Modal */}
      <EventPlannerModal
        isOpen={isEventPlannerOpen}
        onClose={() => {
          setIsEventPlannerOpen(false);
          setSelectedOccasion(undefined);
        }}
        occasionType={selectedOccasion}
      />

      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Dining Reminders</CardTitle>
          </div>
          <CardDescription>Set reminders for your next dining experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">What do you want to eat?</label>
            <textarea
              value={reminderNote}
              onChange={(e) => setReminderNote(e.target.value)}
              placeholder="e.g., Thai food with friends, Anniversary dinner..."
              className="w-full min-h-[80px] px-3 py-2 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Services;
