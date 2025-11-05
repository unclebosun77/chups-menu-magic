import { MapPin, Phone, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RestaurantInfoProps {
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  hours?: Record<string, string> | null;
  isOpen?: boolean;
}

const RestaurantInfo = ({ address, city, phone, hours, isOpen }: RestaurantInfoProps) => {
  const getCurrentDayHours = () => {
    if (!hours) return null;
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    return hours[today as keyof typeof hours];
  };

  const todayHours = getCurrentDayHours();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Address */}
      {(address || city) && (
        <Card className="overflow-hidden animate-fade-in-up">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Location</h3>
                <p className="text-sm text-muted-foreground">
                  {address}
                  {city && <>, {city}</>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phone */}
      {phone && (
        <Card className="overflow-hidden animate-fade-in-up [animation-delay:0.1s]">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Phone</h3>
                <a 
                  href={`tel:${phone}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {phone}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hours */}
      {todayHours && (
        <Card className="overflow-hidden animate-fade-in-up [animation-delay:0.2s]">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">Hours Today</h3>
                  <Badge variant={isOpen ? "default" : "secondary"} className="text-xs">
                    {isOpen ? "Open" : "Closed"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{todayHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RestaurantInfo;
