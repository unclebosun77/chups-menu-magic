import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar, Clock, Users, ChevronDown, Check, X, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isToday, isBefore, startOfDay } from "date-fns";

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  booking_date: string;
  time_slot: string;
  party_size: string;
  special_requests: string | null;
  status: string;
  experience_name: string;
  category_title: string;
  created_at: string;
};

type BookingsTabProps = {
  restaurantId: string;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confirmed ✓", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

const BookingsTab = ({ restaurantId }: BookingsTabProps) => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);

  const loadBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("booking_date", { ascending: true });

    if (error) {
      console.error("Error loading bookings:", error);
    } else {
      setBookings((data as Booking[]) || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadBookings();

    const channel = supabase
      .channel(`bookings-${restaurantId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "bookings",
        filter: `restaurant_id=eq.${restaurantId}`,
      }, () => loadBookings())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [restaurantId]);

  const updateStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      toast({ title: "Error updating booking", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Booking ${newStatus}` });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    }
  };

  const today = startOfDay(new Date());
  const upcoming = bookings.filter(b => !isBefore(parseISO(b.booking_date), today));
  const past = bookings.filter(b => isBefore(parseISO(b.booking_date), today)).reverse();
  const pendingCount = bookings.filter(b => b.status === "pending").length;

  const formatBookingDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return "Today";
    return format(d, "EEEE d MMM");
  };

  const renderBooking = (booking: Booking) => {
    const cfg = statusConfig[booking.status] || statusConfig.pending;
    return (
      <Card key={booking.id} className="overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{booking.customer_name}</p>
              <p className="text-xs text-muted-foreground">{booking.customer_email}</p>
              {booking.customer_phone && (
                <p className="text-xs text-muted-foreground">{booking.customer_phone}</p>
              )}
            </div>
            <Badge className={cfg.className} variant="secondary">{cfg.label}</Badge>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatBookingDate(booking.booking_date)}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {booking.time_slot}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {booking.party_size} guests
            </span>
          </div>

          {booking.experience_name && (
            <p className="text-xs text-primary font-medium">{booking.category_title} · {booking.experience_name}</p>
          )}

          {booking.special_requests && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
              <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              {booking.special_requests}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {booking.status === "pending" && (
              <>
                <Button size="sm" onClick={() => updateStatus(booking.id, "confirmed")} className="flex-1">
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Confirm
                </Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(booking.id, "cancelled")} className="flex-1">
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Decline
                </Button>
              </>
            )}
            {booking.status === "confirmed" && (
              <Button size="sm" variant="outline" onClick={() => updateStatus(booking.id, "cancelled")}>
                <X className="h-3.5 w-3.5 mr-1.5" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Bookings</h2>
        {pendingCount > 0 && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      {/* Upcoming */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Upcoming</h3>
        {upcoming.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No upcoming bookings</p>
          </Card>
        ) : (
          upcoming.map(renderBooking)
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <Collapsible open={showPast} onOpenChange={setShowPast}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
            <ChevronDown className={`h-4 w-4 transition-transform ${showPast ? "rotate-180" : ""}`} />
            Past bookings ({past.length})
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            {past.map(renderBooking)}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export { BookingsTab };
export default BookingsTab;
