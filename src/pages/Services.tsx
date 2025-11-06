import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, Users, Calendar, ShoppingBag, Bike, Clock, Gift, MapPin, Phone } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: UtensilsCrossed,
      emoji: "🍽️",
      title: "Dine-In",
      description: "Reserve a table at your favorite spot",
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      icon: Bike,
      emoji: "🚴",
      title: "Delivery",
      description: "Get food delivered to your doorstep",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      icon: ShoppingBag,
      emoji: "🛍️",
      title: "Pickup",
      description: "Order ahead and skip the line",
      color: "bg-green-500/10 text-green-500",
    },
    {
      icon: Calendar,
      emoji: "🎉",
      title: "Catering",
      description: "Order for your next event",
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      icon: Clock,
      emoji: "⏰",
      title: "Pre-Order",
      description: "Schedule your meals in advance",
      color: "bg-pink-500/10 text-pink-500",
    },
    {
      icon: Users,
      emoji: "👥",
      title: "Group Dining",
      description: "Book for large parties and events",
      color: "bg-indigo-500/10 text-indigo-500",
    },
    {
      icon: Gift,
      emoji: "🎁",
      title: "Gift Cards",
      description: "Give the gift of great food",
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
      title: "Call & Order",
      description: "Quick phone ordering service",
      color: "bg-teal-500/10 text-teal-500",
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="pt-4">
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="text-muted-foreground mt-1">Explore what CHUPS offers</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Card key={service.title} className="cursor-pointer hover:shadow-lg transition-all hover-scale animate-fade-in">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${service.color} flex items-center justify-center w-16 h-16 flex-shrink-0`}>
                    <div className="relative">
                      <Icon className="h-7 w-7" />
                      <span className="absolute -top-1 -right-1 text-lg">{service.emoji}</span>
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription className="text-sm">{service.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Services;
