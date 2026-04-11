import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";

type ActivityItem = {
  id: string;
  type: "order" | "booking" | "review" | "save";
  label: string;
  tab: string;
  created_at: string;
  isNew?: boolean;
};

type Props = {
  restaurantId: string;
  onSwitchTab: (tab: string) => void;
};

const chipStyles: Record<string, string> = {
  order: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  booking: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  review: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  save: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
};

const icons: Record<string, string> = {
  order: "🛒",
  booking: "📅",
  review: "⭐",
  save: "❤️",
};

const RestaurantActivityFeed = ({ restaurantId, onSwitchTab }: Props) => {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadActivity = useCallback(async () => {
    const [ordersRes, bookingsRes, reviewsRes, savesRes] = await Promise.all([
      supabase
        .from("orders")
        .select("id, created_at, total, table_number, status")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("bookings")
        .select("id, created_at, party_size, booking_date, time_slot")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("reviews")
        .select("id, created_at, rating")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("saved_restaurants")
        .select("id, created_at")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const activities: ActivityItem[] = [];

    (ordersRes.data || []).forEach((o: any) => {
      const table = o.table_number ? ` · Table ${o.table_number}` : "";
      activities.push({
        id: `order-${o.id}`,
        type: "order",
        label: `New order${table} · £${Number(o.total).toFixed(2)}`,
        tab: "orders",
        created_at: o.created_at,
      });
    });

    (bookingsRes.data || []).forEach((b: any) => {
      const day = format(parseISO(b.booking_date), "EEE");
      activities.push({
        id: `booking-${b.id}`,
        type: "booking",
        label: `Table booked · ${b.party_size} guests · ${day} ${b.time_slot}`,
        tab: "bookings",
        created_at: b.created_at,
      });
    });

    (reviewsRes.data || []).forEach((r: any) => {
      activities.push({
        id: `review-${r.id}`,
        type: "review",
        label: `New review · ${r.rating} star${r.rating !== 1 ? "s" : ""}`,
        tab: "reviews",
        created_at: r.created_at,
      });
    });

    (savesRes.data || []).forEach((s: any) => {
      activities.push({
        id: `save-${s.id}`,
        type: "save",
        label: "Someone saved your restaurant",
        tab: "orders",
        created_at: s.created_at,
      });
    });

    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setItems(activities.slice(0, 15));
    setLoaded(true);
  }, [restaurantId]);

  useEffect(() => {
    loadActivity();

    const channels = [
      supabase.channel(`activity-orders-${restaurantId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurantId}` }, () => loadActivity())
        .subscribe(),
      supabase.channel(`activity-bookings-${restaurantId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings", filter: `restaurant_id=eq.${restaurantId}` }, () => loadActivity())
        .subscribe(),
      supabase.channel(`activity-reviews-${restaurantId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "reviews", filter: `restaurant_id=eq.${restaurantId}` }, () => loadActivity())
        .subscribe(),
      supabase.channel(`activity-saves-${restaurantId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "saved_restaurants", filter: `restaurant_id=eq.${restaurantId}` }, () => loadActivity())
        .subscribe(),
    ];

    return () => { channels.forEach(ch => supabase.removeChannel(ch)); };
  }, [restaurantId, loadActivity]);

  if (!loaded) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-foreground">Activity</h3>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          Live
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground bg-muted/50 rounded-xl px-4 py-3">
          No activity yet — share your restaurant with customers to get started 🚀
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSwitchTab(item.tab)}
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all hover:scale-105 active:scale-95 animate-fade-in ${chipStyles[item.type]}`}
            >
              <span>{icons[item.type]}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantActivityFeed;
