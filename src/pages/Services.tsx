import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { UtensilsCrossed, Users, Calendar, Gift, MapPin, Phone, Bell, Award } from "lucide-react";
import { useState } from "react";

const Services = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [reminderNote, setReminderNote] = useState("");

  const services = [
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
      title: "Call & Reserve",
      description: "Quick phone reservation service",
      color: "bg-teal-500/10 text-teal-500",
    },
    {
      icon: Award,
      emoji: "⭐",
      title: "Loyalty Points",
      description: "Earn rewards with every visit",
      color: "bg-yellow-500/10 text-yellow-500",
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="pt-4">
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="text-muted-foreground mt-1">Explore what CHUPS offers</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Card key={service.title} className="cursor-pointer hover:shadow-lg transition-all hover-scale animate-fade-in">
              <CardHeader className="p-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={`p-3 rounded-lg ${service.color} flex items-center justify-center w-14 h-14`}>
                    <div className="relative">
                      <Icon className="h-6 w-6" />
                      <span className="absolute -top-1 -right-1 text-base">{service.emoji}</span>
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-base mb-1">{service.title}</CardTitle>
                    <CardDescription className="text-xs">{service.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
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
