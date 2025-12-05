import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { 
  UtensilsCrossed, Users, Calendar, Gift, MapPin, Phone, Bell,
  Wine, ChefHat, Crown, PartyPopper, Heart, Sparkles, Home, 
  Music, GlassWater, Cake, Coffee, Wheat, Map, Award, BookOpen,
  Leaf, Shield, Rocket
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
      color: "bg-gradient-to-br from-orange-500/10 to-red-500/10",
      items: [
        { name: "Private Dining", icon: Users, description: "Intimate setups or hidden chef's tables" },
        { name: "Chef's Table Nights", icon: ChefHat, description: "Behind-the-scenes tasting menus" },
        { name: "Pop-Up Events", icon: Sparkles, description: "Limited-time culinary adventures" },
      ],
    },
    {
      id: "pairings",
      title: "Pairings",
      icon: Wine,
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
      id: "wellness",
      title: "Health",
      icon: Leaf,
      color: "bg-gradient-to-br from-green-500/10 to-blue-500/10",
      items: [
        { name: "Meal Prep Plans", icon: Calendar, description: "Weekly healthy meal subscriptions" },
        { name: "Cooking Classes", icon: ChefHat, description: "Master new cuisines & techniques" },
        { name: "Chef Masterclasses", icon: Award, description: "Learn from culinary legends" },
        { name: "Ingredient Workshops", icon: Wheat, description: "Deep dive into quality ingredients" },
        { name: "Dietary Menus", icon: BookOpen, description: "Keto, vegan, paleo & more" },
        { name: "Nutritionist-Approved", icon: Heart, description: "Healthy & delicious balanced meals" },
        { name: "Calorie Tracking", icon: Award, description: "Know exactly what you're eating" },
        { name: "Allergen-Free Options", icon: Shield, description: "Safe meals for all dietary needs" },
        { name: "Organic & Local", icon: Leaf, description: "Farm-fresh sustainable ingredients" },
      ],
    },
    {
      id: "celebrations",
      title: "Events",
      icon: PartyPopper,
      color: "bg-gradient-to-br from-pink-500/10 to-rose-500/10",
      items: [
        { name: "Outa Concierge", icon: Rocket, description: "AI-powered event planning assistant" },
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
      color: "bg-gradient-to-br from-indigo-500/10 to-violet-500/10",
      items: [
        { name: "Experience Gifting", icon: Gift, description: "Give memorable dining experiences" },
        { name: "Dine & Stay Packages", icon: Home, description: "Complete getaway experiences" },
        { name: "Restaurant Tours", icon: Map, description: "Behind-the-scenes kitchen tours" },
      ],
    },
  ];

  const handleCategoryClick = (category: typeof experienceCategories[0]) => {
    // Special handling for Occasions & Celebrations - open event planner for Outa Concierge
    if (category.id === "celebrations") {
      setIsEventPlannerOpen(true);
      setSelectedOccasion(undefined);
      return;
    }
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleExperienceItemClick = (categoryId: string, itemName: string) => {
    if (categoryId === "celebrations" && itemName === "Outa Concierge") {
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
      <div className="pt-4 pb-2">
        <h1 className="text-3xl font-bold text-gradient-neon">Services & Experiences</h1>
        <p className="text-muted-foreground mt-1">Explore everything Outa offers</p>
      </div>

      {/* Quick Services */}
      <div className="space-y-4 p-5 rounded-3xl bg-secondary/50 border border-border shadow-soft">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Rocket className="h-5 w-5 text-purple" strokeWidth={1.5} />
          <span className="text-gradient-neon">Quick Services</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
      <div className="space-y-4 p-5 rounded-3xl bg-secondary/50 border border-border shadow-soft">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Sparkles className="h-5 w-5 text-purple" strokeWidth={1.5} />
          <span className="text-gradient-neon">Curated Experiences</span>
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {experienceCategories.map((category) => (
            <IconTile
              key={category.id}
              icon={category.icon}
              label={category.title}
              onClick={() => handleCategoryClick(category)}
              className={category.id === 'celebrations' ? 'ring-2 ring-purple animate-pulse-glow' : ''}
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

      <Card className="animate-fade-in border border-purple/30 shadow-hover bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple/20">
              <Bell className="h-5 w-5 text-purple" strokeWidth={1.5} />
            </div>
            <CardTitle className="text-gradient-neon">Dining Reminders</CardTitle>
          </div>
          <CardDescription>Set reminders for your next outing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border border-border bg-card"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">What's the vibe?</label>
            <textarea
              value={reminderNote}
              onChange={(e) => setReminderNote(e.target.value)}
              placeholder="e.g., Thai food with friends, Anniversary dinner..."
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Services;
