import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, Users, MapPin } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReservationDialogProps {
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

export const ReservationDialog = ({ isOpen, onClose }: ReservationDialogProps) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>();
  const [partySize, setPartySize] = useState<string>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReservation = async () => {
    if (!date || !timeSlot || !partySize || !name || !email || !location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to make a reservation.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Save reservation to bookings table
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          experience_name: `Table Reservation at ${location}`,
          category_title: 'Dine-In Reservation',
          booking_date: format(date, "yyyy-MM-dd"),
          time_slot: timeSlot,
          party_size: partySize,
          customer_name: name,
          customer_email: email,
          customer_phone: phone || null,
          special_requests: specialRequests || null,
          pricing: 'No charge for reservation',
          status: 'pending',
        });

      if (bookingError) throw bookingError;

      toast({
        title: "Reservation Confirmed! 🎉",
        description: `Your table for ${partySize} at ${location} on ${format(date, "PPP")} at ${timeSlot} has been reserved.`,
      });

      // Reset form
      setDate(undefined);
      setTimeSlot(undefined);
      setPartySize(undefined);
      setName("");
      setEmail("");
      setPhone("");
      setLocation("");
      setSpecialRequests("");
      onClose();
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Error",
        description: "There was an error processing your reservation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Make a Reservation</DialogTitle>
          <DialogDescription>
            Reserve your table at any of our partner restaurants
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Location/Restaurant */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Restaurant/Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="e.g., The Prox, Downtown"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleReservation} 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? "Confirming..." : "Confirm Reservation"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
