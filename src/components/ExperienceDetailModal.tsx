import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, Users, DollarSign } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ExperienceItem {
  name: string;
  icon: any;
  description: string;
  price?: string;
  duration?: string;
}

interface ExperienceCategory {
  id: string;
  title: string;
  emoji: string;
  color: string;
  items: ExperienceItem[];
}

interface ExperienceDetailModalProps {
  category: ExperienceCategory | null;
  isOpen: boolean;
  onClose: () => void;
}

const timeSlots = [
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "5:00 PM",
  "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM",
  "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"
];

const partySizes = ["1", "2", "3", "4", "5", "6", "7", "8", "10+"];

// Price ranges based on category
const getPricing = (categoryId: string, itemName: string): string => {
  const pricing: Record<string, Record<string, string>> = {
    dining: {
      "Private Dining": "$150-300 per person",
      "Chef's Table Nights": "$200-400 per person",
      "Home Dining": "$100-250 per person",
      "Pop-Up Restaurants & Food Events": "$75-150 per person",
      "Rooftop / Outdoor Dining": "$80-180 per person",
      "Surprise Dining": "$120-280 per person"
    },
    pairings: {
      default: "$60-150 per person"
    },
    learning: {
      default: "$80-200 per person"
    },
    membership: {
      "VIP Membership": "$299/month",
      "Gold/Platinum Tiers": "$499-999/month",
      "Dining Subscriptions": "$149/month",
      default: "Contact for pricing"
    },
    celebrations: {
      default: "$500-2000 per event"
    },
    wellness: {
      default: "Varies by restaurant"
    },
    addons: {
      default: "$50-500"
    }
  };

  return pricing[categoryId]?.[itemName] || pricing[categoryId]?.default || "$50-200 per person";
};

export const ExperienceDetailModal = ({ category, isOpen, onClose }: ExperienceDetailModalProps) => {
  const [selectedExperience, setSelectedExperience] = useState<ExperienceItem | null>(null);
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>();
  const [partySize, setPartySize] = useState<string>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const { toast } = useToast();

  if (!category) return null;

  const handleBooking = async () => {
    if (!selectedExperience || !date || !timeSlot || !partySize || !name || !email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to make a booking.",
          variant: "destructive",
        });
        return;
      }

      // Save booking to database
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          experience_name: selectedExperience.name,
          category_title: category?.title || '',
          booking_date: format(date, "yyyy-MM-dd"),
          time_slot: timeSlot,
          party_size: partySize,
          customer_name: name,
          customer_email: email,
          customer_phone: phone || null,
          special_requests: specialRequests || null,
          pricing: getPricing(category?.id || '', selectedExperience.name),
          status: 'pending',
        });

      if (bookingError) throw bookingError;

      // Send confirmation email
      await supabase.functions.invoke('send-booking-confirmation', {
        body: {
          experienceName: selectedExperience.name,
          categoryTitle: category?.title || '',
          date: format(date, "PPP"),
          timeSlot,
          partySize,
          name,
          email,
          phone,
          specialRequests,
          pricing: getPricing(category?.id || '', selectedExperience.name),
        },
      });

      toast({
        title: "Booking Confirmed! 🎉",
        description: `Your booking has been saved. A confirmation email has been sent to ${email}.`,
      });

      // Reset form
      setSelectedExperience(null);
      setDate(undefined);
      setTimeSlot(undefined);
      setPartySize(undefined);
      setName("");
      setEmail("");
      setPhone("");
      setSpecialRequests("");
      onClose();
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{category.emoji}</span>
            <div>
              <DialogTitle className="text-2xl">{category.title}</DialogTitle>
              <DialogDescription>
                Choose your experience and book your reservation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Experience Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Select Your Experience</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item, idx) => {
                const Icon = item.icon;
                const pricing = getPricing(category.id, item.name);
                return (
                  <Card
                    key={idx}
                    className={cn(
                      "cursor-pointer transition-all hover-scale",
                      selectedExperience?.name === item.name
                        ? "ring-2 ring-primary shadow-lg"
                        : "hover:shadow-md"
                    )}
                    onClick={() => setSelectedExperience(item)}
                  >
                    <CardHeader className="p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between">
                          <div className="p-2 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            <span className="text-[10px]">{pricing.split(' ')[0]}</span>
                          </div>
                        </div>
                        <div>
                          <CardTitle className="text-sm">{item.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {item.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Booking Form */}
          {selectedExperience && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30 animate-fade-in">
              <h3 className="font-semibold text-lg">Booking Details</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Date Selection */}
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Slot */}
                <div className="space-y-2">
                  <Label>Time *</Label>
                  <Select value={timeSlot} onValueChange={setTimeSlot}>
                    <SelectTrigger>
                      <Clock className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Party Size */}
                <div className="space-y-2">
                  <Label>Party Size *</Label>
                  <Select value={partySize} onValueChange={setPartySize}>
                    <SelectTrigger>
                      <Users className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Number of guests" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {partySizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size} {size === "1" ? "guest" : "guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div className="space-y-2">
                <Label>Special Requests or Dietary Restrictions</Label>
                <Textarea
                  placeholder="Any allergies, preferences, or special occasions..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>

              {/* Pricing Info */}
              <div className="p-3 bg-background border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Price</span>
                  <span className="font-semibold text-lg">
                    {getPricing(category.id, selectedExperience.name)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Final pricing will be confirmed upon booking
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={handleBooking} className="flex-1">
                  Request Booking
                </Button>
                <Button variant="outline" onClick={() => setSelectedExperience(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
