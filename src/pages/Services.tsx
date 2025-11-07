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

const Services = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [reminderNote, setReminderNote] = useState("");

  const quickServices = [
    {
      icon: UtensilsCrossed,
      emoji: "🍽️",
      title: "Dine-In",
      description: "Reserve a table at your favorite spot",
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      icon: Calendar,
      emoji: "🎉",
      title: "Catering",
      description: "Order for your next event",
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      icon: Gift,
      emoji: "🎁",
      title: "Rewards & Gift Cards",
      description: "Earn points and send gift cards",
      color: "bg-yellow-500/10 text-yellow-500",
    },
    {
      icon: MapPin,
      emoji: "📍",
      title: "Find Locations",
      description: "Discover restaurants near you",
      color: "bg-red-500/10 text-red-500",
    },
    {
      icon: Phone,
      emoji: "📞",
      title: "Call & Reserve",
      description: "Quick phone reservation service",
      color: "bg-teal-500/10 text-teal-500",
    },
  ];

  const experienceCategories = [
    {
      id: "dining",
      title: "Exclusive Dining",
      emoji: "🍽️",
      color: "bg-gradient-to-br from-orange-500/10 to-red-500/10",
      items: [
        { name: "Private Dining", icon: Users, description: "Intimate dining in exclusive spaces" },
        { name: "Chef's Table Nights", icon: ChefHat, description: "Watch chefs craft your meal" },
        { name: "Home Dining", icon: Home, description: "Restaurant quality at your home" },
        { name: "Pop-Up Restaurants", icon: Sparkles, description: "Limited-time culinary adventures" },
        { name: "Rooftop Dining", icon: UtensilsCrossed, description: "Dine under the stars" },
      ],
    },
    {
      id: "pairings",
      title: "Pairings & Tastings",
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
      title: "Learning & Classes",
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
      id: "membership",
      title: "Membership & Lifestyle",
      emoji: "💎",
      color: "bg-gradient-to-br from-yellow-500/10 to-amber-500/10",
      items: [
        { name: "VIP Membership", icon: Crown, description: "Exclusive benefits & priority access" },
        { name: "Gold/Platinum Tiers", icon: Award, description: "Premium tier dining privileges" },
        { name: "Dining Subscriptions", icon: Calendar, description: "Monthly curated meal plans" },
        { name: "Early Menu Access", icon: BookOpen, description: "Preview new dishes first" },
        { name: "Foodie Club Meetups", icon: Users, description: "Connect with fellow food lovers" },
      ],
    },
    {
      id: "celebrations",
      title: "Occasions & Celebrations",
      emoji: "🎉",
      color: "bg-gradient-to-br from-pink-500/10 to-rose-500/10",
      items: [
        { name: "Special Occasions", icon: PartyPopper, description: "Celebrate life's big moments" },
        { name: "Proposal Packages", icon: Heart, description: "Make your moment unforgettable" },
        { name: "Seasonal Events", icon: Calendar, description: "Festive seasonal celebrations" },
        { name: "Themed Nights", icon: Sparkles, description: "Immersive culinary themes" },
        { name: "Group Dining", icon: Users, description: "Perfect for parties & gatherings" },
      ],
    },
    {
      id: "wellness",
      title: "Health & Wellness",
      emoji: "🌿",
      color: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
      items: [
        { name: "Dietary Menus", icon: BookOpen, description: "Tailored to your needs" },
        { name: "Nutritionist-Approved", icon: Heart, description: "Healthy & delicious choices" },
        { name: "Mindful Eating", icon: Leaf, description: "Conscious culinary journeys" },
        { name: "Sustainable Dining", icon: Leaf, description: "Eco-friendly food choices" },
        { name: "Allergen-Free", icon: Shield, description: "Safe meals for all dietary needs" },
      ],
    },
    {
      id: "addons",
      title: "Add-On Experiences",
      emoji: "✨",
      color: "bg-gradient-to-br from-indigo-500/10 to-violet-500/10",
      items: [
        { name: "CHUPS Concierge", icon: Sparkles, description: "AI-powered outing planner" },
        { name: "Experience Gifting", icon: Gift, description: "Give memorable dining experiences" },
        { name: "Dine & Stay Packages", icon: Home, description: "Complete getaway experiences" },
        { name: "Restaurant Tours", icon: Map, description: "Behind-the-scenes kitchen tours" },
      ],
    },
  ];

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="pt-4">
        <h1 className="text-3xl font-bold bg-gradient-purple-glow bg-clip-text text-transparent">Services & Experiences</h1>
        <p className="text-muted-foreground mt-1">Explore everything CHUPS offers</p>
      </div>

      {/* Quick Services */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Quick Services</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {quickServices.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.title} className="cursor-pointer hover:shadow-lg transition-all hover-scale animate-fade-in">
                <CardHeader className="p-3">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`p-2 rounded-lg ${service.color} flex items-center justify-center w-12 h-12`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm mb-0.5">{service.title}</CardTitle>
                      <CardDescription className="text-xs">{service.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Experiences */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Curated Experiences</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {experienceCategories.map((category) => (
            <Card 
              key={category.id} 
              className={`cursor-pointer hover:shadow-lg transition-all hover-scale animate-fade-in aspect-square ${category.color}`}
            >
              <CardHeader className="p-3 h-full">
                <div className="flex flex-col items-center text-center gap-2 h-full justify-center">
                  <span className="text-4xl">{category.emoji}</span>
                  <div>
                    <CardTitle className="text-sm mb-0.5">{category.title}</CardTitle>
                    <CardDescription className="text-xs">
                      ({category.items.length} options)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

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
