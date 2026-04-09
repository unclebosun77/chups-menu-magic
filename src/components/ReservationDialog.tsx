import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, Users, MapPin, CalendarPlus } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReservationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId?: string;
  restaurantName?: string;
  restaurantAddress?: string;
}

const timeSlots = [
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "5:00 PM",
  "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM",
  "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"
];

const partySizes = ["1", "2", "3", "4", "5", "6", "7", "8", "10+"];

/** Convert "1:30 PM" → "13:30" */
function to24h(slot: string): string {
  const [time, period] = slot.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function buildIcsDataUri(params: { date: Date; timeSlot: string; name: string; address?: string }) {
  const d = params.date;
  const [hh, mm] = to24h(params.timeSlot).split(":").map(Number);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2h
  const fmt = (dt: Date) =>
    dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Reservation at ${params.name}`,
    params.address ? `LOCATION:${params.address}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

export const ReservationDialog = ({ isOpen, onClose, restaurantId, restaurantName, restaurantAddress }: ReservationDialogProps) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>();
  const [partySize, setPartySize] = useState<string>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState(restaurantName || "");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [calendarLink, setCalendarLink] = useState<string | null>(null);

  const handleReservation = async () => {
    if (!date || !timeSlot || !partySize || !name || !email || !location) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setCalendarLink(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication Required", description: "Please sign in to make a reservation.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const bookingId = crypto.randomUUID();
      const experienceName = restaurantName ? `Table Reservation at ${restaurantName}` : `Table Reservation at ${location}`;

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          id: bookingId,
          user_id: user.id,
          restaurant_id: restaurantId || null,
          experience_name: experienceName,
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

      // Send confirmation email (non-blocking)
      try {
        await supabase.functions.invoke('send-booking-confirmation', {
          body: {
            experienceName,
            categoryTitle: 'Dine-In Reservation',
            date: format(date, "PPP"),
            timeSlot,
            partySize,
            name,
            email,
            phone: phone || undefined,
            specialRequests: specialRequests || undefined,
            pricing: 'No charge for reservation',
          },
        });
      } catch (emailErr) {
        console.warn('Confirmation email failed:', emailErr);
      }

      // Build calendar link
      const icsUri = buildIcsDataUri({ date, timeSlot, name: restaurantName || location, address: restaurantAddress });
      setCalendarLink(icsUri);

      toast({
        title: "Reservation Confirmed! 🎉",
        description: `Your table for ${partySize} at ${restaurantName || location} on ${format(date, "PPP")} at ${timeSlot} has been reserved.`,
      });

      // Reset form
      setDate(undefined);
      setTimeSlot(undefined);
      setPartySize(undefined);
      setName("");
      setEmail("");
      setPhone("");
      setLocation(restaurantName || "");
      setSpecialRequests("");
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      toast({ title: "Error", description: "There was an error processing your reservation. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCalendarLink(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Make a Reservation</DialogTitle>
          <DialogDescription>
            {restaurantName ? `Reserve your table at ${restaurantName}` : "Reserve your table at any of our partner restaurants"}
          </DialogDescription>
        </DialogHeader>

        {calendarLink ? (
          <div className="py-8 text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h3 className="text-xl font-semibold">Reservation Confirmed!</h3>
            <p className="text-muted-foreground">Your booking is all set. Add it to your calendar so you don't forget.</p>
            <a href={calendarLink} download="reservation.ics">
              <Button className="gap-2">
                <CalendarPlus className="h-4 w-4" />
                Add to Calendar
              </Button>
            </a>
            <div>
              <Button variant="outline" onClick={handleClose}>Done</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {!restaurantName && (
                <div className="space-y-2 sm:col-span-2">
                  <Label>Restaurant/Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="e.g., The Prox, Downtown" value={location} onChange={(e) => setLocation(e.target.value)} className="pl-10" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Time *</Label>
                <Select value={timeSlot} onValueChange={setTimeSlot}>
                  <SelectTrigger><Clock className="mr-2 h-4 w-4" /><SelectValue placeholder="Select time" /></SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {timeSlots.map((slot) => (<SelectItem key={slot} value={slot}>{slot}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Party Size *</Label>
                <Select value={partySize} onValueChange={setPartySize}>
                  <SelectTrigger><Users className="mr-2 h-4 w-4" /><SelectValue placeholder="Number of guests" /></SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {partySizes.map((size) => (<SelectItem key={size} value={size}>{size} {size === "1" ? "guest" : "guests"}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Special Requests or Dietary Restrictions</Label>
              <Textarea placeholder="Any allergies, preferences, or special occasions..." value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} className="min-h-[80px] resize-none" />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleReservation} className="flex-1" disabled={isLoading}>
                {isLoading ? "Confirming..." : "Confirm Reservation"}
              </Button>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
