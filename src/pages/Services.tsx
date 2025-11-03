import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bike, UtensilsCrossed, Users, Calendar } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Bike,
      title: "Delivery",
      description: "Get food delivered to your door",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      icon: UtensilsCrossed,
      title: "Dine-In",
      description: "Reserve a table at your favorite spot",
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      icon: Users,
      title: "Community Events",
      description: "Join food lovers in your area",
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      icon: Calendar,
      title: "Catering",
      description: "Order for your next event",
      color: "bg-green-500/10 text-green-500",
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="pt-4">
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="text-muted-foreground mt-1">Explore what CHUPS offers</p>
      </div>

      <div className="grid gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Card key={service.title} className="cursor-pointer hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${service.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription className="text-base">{service.description}</CardDescription>
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
