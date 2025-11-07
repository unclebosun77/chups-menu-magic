import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UtensilsCrossed, Wine, ChefHat, Crown, PartyPopper, 
  Heart, Sparkles, Users, Home, Music, GlassWater,
  Cake, Coffee, Wheat, Carrot, BookOpen, Map,
  Gift, Award, Calendar, Leaf, Shield, Phone
} from "lucide-react";

const Experiences = () => {
  const categories = [
    {
      title: "🍽️ Exclusive Dining Experiences",
      color: "from-orange-500/10 to-red-500/10",
      borderColor: "border-orange-500/20",
      experiences: [
        { name: "Private Dining", description: "Intimate dining in exclusive spaces", icon: Users },
        { name: "Chef's Table Nights", description: "Watch chefs craft your meal", icon: ChefHat },
        { name: "Home Dining", description: "Restaurant quality at your home", icon: Home },
        { name: "Pop-Up Restaurants", description: "Limited-time culinary adventures", icon: Sparkles },
        { name: "Rooftop / Outdoor Dining", description: "Dine under the stars", icon: UtensilsCrossed },
        { name: "Surprise Dining", description: "Mystery menu experiences", icon: Gift },
      ],
    },
    {
      title: "🍷 Culinary Pairings & Tastings",
      color: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/20",
      experiences: [
        { name: "Wine Pairing Nights", description: "Perfect wine & food combinations", icon: Wine },
        { name: "Cocktail Mixology Sessions", description: "Learn to craft signature cocktails", icon: GlassWater },
        { name: "Dessert Pairings", description: "Sweet endings with perfect drinks", icon: Cake },
        { name: "Craft Beer Tastings", description: "Explore local & international brews", icon: Coffee },
        { name: "Food & Music Pairing", description: "Harmonize flavors with melodies", icon: Music },
      ],
    },
    {
      title: "👩🏽‍🍳 Learning & Immersive Sessions",
      color: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/20",
      experiences: [
        { name: "Cooking Classes", description: "Master new cuisines & techniques", icon: ChefHat },
        { name: "Chef Masterclasses", description: "Learn from culinary legends", icon: Award },
        { name: "Ingredient Workshops", description: "Deep dive into quality ingredients", icon: Wheat },
        { name: "Farm-to-Table Tours", description: "Visit farms & see food sources", icon: Map },
        { name: "Kids & Family Cooking", description: "Fun culinary activities for all ages", icon: Users },
      ],
    },
    {
      title: "💎 Membership & Lifestyle",
      color: "from-yellow-500/10 to-amber-500/10",
      borderColor: "border-yellow-500/20",
      experiences: [
        { name: "VIP Membership", description: "Exclusive benefits & priority access", icon: Crown },
        { name: "CHUPS Gold/Platinum", description: "Premium tier dining privileges", icon: Award },
        { name: "Dining Subscriptions", description: "Monthly curated meal plans", icon: Calendar },
        { name: "Early Menu Access", description: "Preview new dishes first", icon: BookOpen },
        { name: "Foodie Club Meetups", description: "Connect with fellow food lovers", icon: Users },
      ],
    },
    {
      title: "🎉 Occasions & Celebrations",
      color: "from-pink-500/10 to-rose-500/10",
      borderColor: "border-pink-500/20",
      experiences: [
        { name: "Special Occasion Packages", description: "Celebrate life's big moments", icon: PartyPopper },
        { name: "Proposal Packages", description: "Make your moment unforgettable", icon: Heart },
        { name: "Seasonal Events", description: "Festive seasonal celebrations", icon: Calendar },
        { name: "Themed Nights", description: "Immersive culinary themes", icon: Sparkles },
        { name: "Group Dining", description: "Perfect for parties & gatherings", icon: Users },
      ],
    },
    {
      title: "🌿 Health, Wellness & Preferences",
      color: "from-green-500/10 to-emerald-500/10",
      borderColor: "border-green-500/20",
      experiences: [
        { name: "Personalized Dietary Menus", description: "Tailored to your needs", icon: BookOpen },
        { name: "Nutritionist-Approved Dining", description: "Healthy & delicious choices", icon: Heart },
        { name: "Mindful Eating Experiences", description: "Conscious culinary journeys", icon: Leaf },
        { name: "Sustainable Dining Options", description: "Eco-friendly food choices", icon: Leaf },
        { name: "Allergen-Free Dining", description: "Safe meals for all dietary needs", icon: Shield },
      ],
    },
    {
      title: "✨ Add-On Experiences",
      color: "from-indigo-500/10 to-violet-500/10",
      borderColor: "border-indigo-500/20",
      experiences: [
        { name: "CHUPS Concierge", description: "AI-powered outing planner", icon: Sparkles },
        { name: "Experience Gifting", description: "Give memorable dining experiences", icon: Gift },
        { name: "Dine & Stay Packages", description: "Complete getaway experiences", icon: Home },
        { name: "Restaurant Tours", description: "Behind-the-scenes kitchen tours", icon: Map },
        { name: "Community Food Events", description: "Join local food happenings", icon: Users },
      ],
    },
  ];

  return (
    <div className="p-4 space-y-8 pb-24">
      <div className="pt-4">
        <h1 className="text-3xl font-bold bg-gradient-purple-glow bg-clip-text text-transparent">
          CHUPS Experiences
        </h1>
        <p className="text-muted-foreground mt-1">
          Curated dining and lifestyle experiences
        </p>
      </div>

      {categories.map((category, idx) => {
        return (
          <div key={idx} className="space-y-4 animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{category.title}</h2>
            </div>
            
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {category.experiences.map((exp, expIdx) => {
                const Icon = exp.icon;
                return (
                  <Card 
                    key={expIdx} 
                    className={`cursor-pointer hover:shadow-lg transition-all hover-scale border ${category.borderColor} bg-gradient-to-br ${category.color}`}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-background/50 backdrop-blur-sm">
                          <Icon className="h-5 w-5 text-purple" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base mb-1">{exp.name}</CardTitle>
                          <CardDescription className="text-xs">{exp.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex gap-2">
                        <Button size="sm" variant="purple" className="flex-1 text-xs">
                          Book Now
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-xs">
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Experiences;
