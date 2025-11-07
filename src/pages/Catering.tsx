import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, ChefHat, ShoppingCart, Check, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
}

interface SelectedItem extends MenuItem {
  quantity: number;
}

const Catering = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [eventDetails, setEventDetails] = useState({
    eventDate: "",
    eventTime: "",
    eventLocation: "",
    eventType: "",
    guestCount: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    specialRequests: "",
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("available", true);

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItemToOrder = (item: MenuItem) => {
    const existingItem = selectedItems.find((i) => i.id === item.id);
    if (existingItem) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
    toast({
      title: "Added to order",
      description: `${item.name} added to your catering order`,
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      setSelectedItems(selectedItems.filter((i) => i.id !== itemId));
    } else {
      setSelectedItems(
        selectedItems.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        )
      );
    }
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmit = async () => {
    if (!eventDetails.eventDate || !eventDetails.eventTime || !eventDetails.eventLocation || 
        !eventDetails.eventType || !eventDetails.guestCount || !eventDetails.customerName || 
        !eventDetails.customerEmail || selectedItems.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one menu item",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to place a catering order",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const menuItemsData = selectedItems.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error } = await supabase.from("catering_orders").insert({
        user_id: user.id,
        event_date: eventDetails.eventDate,
        event_time: eventDetails.eventTime,
        event_location: eventDetails.eventLocation,
        event_type: eventDetails.eventType,
        guest_count: parseInt(eventDetails.guestCount),
        menu_items: menuItemsData,
        total_price: calculateTotal(),
        customer_name: eventDetails.customerName,
        customer_email: eventDetails.customerEmail,
        customer_phone: eventDetails.customerPhone,
        special_requests: eventDetails.specialRequests,
      });

      if (error) throw error;

      setShowConfirmation(true);
    } catch (error) {
      console.error("Error submitting catering order:", error);
      toast({
        title: "Error",
        description: "Failed to submit catering order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [...new Set(menuItems.map((item) => item.category))];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/services")} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-purple-glow bg-clip-text text-transparent">
            Catering Services
          </h1>
          <p className="text-muted-foreground mt-1">Plan your perfect event with our catering services</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Menu Selection */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ChefHat className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Select Menu Items</h2>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading menu...</div>
          ) : (
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category}>
                  <h3 className="text-xl font-semibold mb-3 capitalize">{category}</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {menuItems
                      .filter((item) => item.category === category)
                      .map((item) => (
                        <Card key={item.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader className="p-4">
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-32 object-cover rounded-md mb-2"
                              />
                            )}
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            <CardDescription className="text-sm line-clamp-2">
                              {item.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-primary">
                                ${item.price.toFixed(2)}
                              </span>
                              <Button size="sm" onClick={() => addItemToOrder(item)}>
                                Add
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Order Summary */}
        {selectedItems.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Order Summary</h2>
            </div>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <span className="w-20 text-right font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-primary">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Event Details Form */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Event Details</h2>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Event Date *
                  </Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={eventDetails.eventDate}
                    onChange={(e) =>
                      setEventDetails({ ...eventDetails, eventDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventTime">
                    <Clock className="h-4 w-4 inline mr-2" />
                    Event Time *
                  </Label>
                  <Input
                    id="eventTime"
                    type="time"
                    value={eventDetails.eventTime}
                    onChange={(e) =>
                      setEventDetails({ ...eventDetails, eventTime: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventLocation">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Event Location *
                  </Label>
                  <Input
                    id="eventLocation"
                    placeholder="Enter venue address"
                    value={eventDetails.eventLocation}
                    onChange={(e) =>
                      setEventDetails({ ...eventDetails, eventLocation: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type *</Label>
                  <Select
                    value={eventDetails.eventType}
                    onValueChange={(value) =>
                      setEventDetails({ ...eventDetails, eventType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="corporate">Corporate Event</SelectItem>
                      <SelectItem value="birthday">Birthday Party</SelectItem>
                      <SelectItem value="anniversary">Anniversary</SelectItem>
                      <SelectItem value="graduation">Graduation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestCount">
                    <Users className="h-4 w-4 inline mr-2" />
                    Number of Guests *
                  </Label>
                  <Input
                    id="guestCount"
                    type="number"
                    min="1"
                    placeholder="e.g., 50"
                    value={eventDetails.guestCount}
                    onChange={(e) =>
                      setEventDetails({ ...eventDetails, guestCount: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">Your Name *</Label>
                  <Input
                    id="customerName"
                    placeholder="John Doe"
                    value={eventDetails.customerName}
                    onChange={(e) =>
                      setEventDetails({ ...eventDetails, customerName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="john@example.com"
                    value={eventDetails.customerEmail}
                    onChange={(e) =>
                      setEventDetails({ ...eventDetails, customerEmail: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={eventDetails.customerPhone}
                    onChange={(e) =>
                      setEventDetails({ ...eventDetails, customerPhone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="specialRequests">Special Requests or Dietary Requirements</Label>
                  <Textarea
                    id="specialRequests"
                    placeholder="Any special requests, dietary restrictions, or additional information..."
                    value={eventDetails.specialRequests}
                    onChange={(e) =>
                      setEventDetails({ ...eventDetails, specialRequests: e.target.value })
                    }
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || selectedItems.length === 0}
                className="w-full mt-6"
                size="lg"
              >
                {isSubmitting ? "Submitting..." : "Submit Catering Order"}
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center">Order Confirmed!</DialogTitle>
            <DialogDescription className="text-center">
              Thank you for your catering order. We'll contact you shortly to confirm the details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            <Button
              onClick={() => {
                setShowConfirmation(false);
                navigate("/bookings");
              }}
              className="w-full"
            >
              View My Orders
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmation(false);
                navigate("/services");
              }}
              className="w-full"
            >
              Back to Services
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Catering;
