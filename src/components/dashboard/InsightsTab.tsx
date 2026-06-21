import { Fragment, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Users, Repeat, Clock, CalendarDays } from "lucide-react";

type OrderRow = {
  id: string;
  user_id: string | null;
  total: number | string;
  status: string;
  created_at: string;
  updated_at: string;
  items: any;
};

type BookingRow = {
  booking_date: string;
  party_size: string | null;
  created_at: string;
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_LABELS = ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"];

const InsightsTab = ({ restaurantId }: { restaurantId: string }) => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const [ordersRes, bookingsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("id, user_id, total, status, created_at, updated_at, items")
          .eq("restaurant_id", restaurantId)
          .eq("status", "completed"),
        supabase
          .from("bookings")
          .select("booking_date, party_size, created_at")
          .eq("restaurant_id", restaurantId),
      ]);
      if (!active) return;
      setOrders(((ordersRes.data || []) as any) as OrderRow[]);
      setBookings(((bookingsRes.data || []) as any) as BookingRow[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [restaurantId]);

  // ---------- Peak hours heatmap (7x24) ----------
  const heatmap = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    orders.forEach((o) => {
      const d = new Date(o.created_at);
      // Mon=0..Sun=6
      const day = (d.getDay() + 6) % 7;
      grid[day][d.getHours()] += 1;
    });
    let max = 0;
    let peakDay = 0;
    let peakHour = 0;
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        if (grid[d][h] > max) {
          max = grid[d][h];
          peakDay = d;
          peakHour = h;
        }
      }
    }
    return { grid, max, peakDay, peakHour };
  }, [orders]);

  // ---------- Repeat customer rate ----------
  const repeatStats = useMemo(() => {
    const withUser = orders.filter((o) => o.user_id);
    const counts = new Map<string, number>();
    withUser.forEach((o) => counts.set(o.user_id!, (counts.get(o.user_id!) || 0) + 1));
    const unique = counts.size;
    const repeat = Array.from(counts.values()).filter((c) => c > 1).length;
    const rate = unique > 0 ? Math.round((repeat / unique) * 100) : 0;
    return { unique, repeat, rate };
  }, [orders]);

  // ---------- Average order value trend (last 8 weeks) ----------
  const avgValueTrend = useMemo(() => {
    const now = new Date();
    const weeks: { week: string; avg: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      const inRange = orders.filter((o) => {
        const t = new Date(o.created_at);
        return t >= start && t < end;
      });
      const total = inRange.reduce((s, o) => s + Number(o.total), 0);
      const avg = inRange.length ? total / inRange.length : 0;
      weeks.push({
        week: `${start.getDate()}/${start.getMonth() + 1}`,
        avg: Number(avg.toFixed(2)),
      });
    }
    return weeks;
  }, [orders]);

  // ---------- Booking patterns ----------
  const bookingByDay = useMemo(() => {
    const counts = Array(7).fill(0);
    let totalGuests = 0;
    let countedParties = 0;
    bookings.forEach((b) => {
      if (!b.booking_date) return;
      const d = new Date(b.booking_date);
      const day = (d.getDay() + 6) % 7;
      counts[day] += 1;
      const size = parseInt(b.party_size || "", 10);
      if (!Number.isNaN(size) && size > 0) {
        totalGuests += size;
        countedParties += 1;
      }
    });
    const data = counts.map((c, i) => ({ day: DAY_LABELS[i], bookings: c }));
    const avgParty = countedParties ? totalGuests / countedParties : 0;
    return { data, avgParty };
  }, [bookings]);

  // ---------- Menu performance with week-over-week trend ----------
  const menuPerformance = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    type Agg = { name: string; count: number; revenue: number; thisWeek: number; lastWeek: number };
    const map = new Map<string, Agg>();
    orders.forEach((o) => {
      const t = new Date(o.created_at);
      if (!Array.isArray(o.items)) return;
      o.items.forEach((it: any) => {
        const name = it.name || "Unknown";
        const qty = Number(it.quantity) || 1;
        const price = Number(it.price) || 0;
        const rev = qty * price;
        const cur = map.get(name) || { name, count: 0, revenue: 0, thisWeek: 0, lastWeek: 0 };
        cur.count += qty;
        cur.revenue += rev;
        if (t >= weekAgo) cur.thisWeek += qty;
        else if (t >= twoWeeksAgo) cur.lastWeek += qty;
        map.set(name, cur);
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [orders]);

  // ---------- New vs returning this week ----------
  const newVsReturning = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // First-ever order per user across full history
    const firstOrderAt = new Map<string, Date>();
    orders.forEach((o) => {
      if (!o.user_id) return;
      const t = new Date(o.created_at);
      const cur = firstOrderAt.get(o.user_id);
      if (!cur || t < cur) firstOrderAt.set(o.user_id, t);
    });

    let newCount = 0;
    let returningCount = 0;
    orders.forEach((o) => {
      const t = new Date(o.created_at);
      if (t < weekAgo || !o.user_id) return;
      const first = firstOrderAt.get(o.user_id);
      if (first && first >= weekAgo) newCount += 1;
      else returningCount += 1;
    });
    return [
      { name: "New", value: newCount, color: "hsl(var(--primary))" },
      { name: "Returning", value: returningCount, color: "hsl(var(--muted-foreground))" },
    ];
  }, [orders]);

  // ---------- Average prep time ----------
  const avgPrepMinutes = useMemo(() => {
    const durations = orders
      .map((o) => {
        const start = new Date(o.created_at).getTime();
        const end = new Date(o.updated_at).getTime();
        return (end - start) / 60000;
      })
      .filter((m) => m > 0 && m < 60 * 6); // ignore outliers > 6h
    if (!durations.length) return 0;
    return Math.round(durations.reduce((s, m) => s + m, 0) / durations.length);
  }, [orders]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-20" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const heatColor = (v: number) => {
    if (heatmap.max === 0) return "hsl(var(--muted))";
    const intensity = v / heatmap.max;
    if (intensity === 0) return "hsl(var(--muted))";
    // light purple -> dark purple via opacity
    return `hsl(265 85% 55% / ${Math.max(0.08, intensity).toFixed(2)})`;
  };

  const peakHourLabel = (h: number) => {
    const suf = h >= 12 ? "pm" : "am";
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr}${suf}`;
  };

  return (
    <div className="space-y-10">
      {/* ============ CUSTOMER BEHAVIOUR ============ */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Customer behaviour</h3>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Repeat customers</CardTitle>
              <Repeat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{repeatStats.rate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {repeatStats.repeat} of {repeatStats.unique} customers have ordered more than once
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg prep time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgPrepMinutes} min</div>
              <p className="text-xs text-muted-foreground mt-1">Order accepted → completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{repeatStats.unique}</div>
              <p className="text-xs text-muted-foreground mt-1">All-time signed-in orderers</p>
            </CardContent>
          </Card>
        </div>

        {/* Peak hours heatmap */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Peak hours</CardTitle>
            <CardDescription>
              {heatmap.max > 0
                ? `Your busiest time is ${DAY_LABELS[heatmap.peakDay]} around ${peakHourLabel(heatmap.peakHour)}`
                : "Not enough data yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="inline-block">
                <div className="grid" style={{ gridTemplateColumns: "32px repeat(24, 14px)" }}>
                  <div />
                  {Array.from({ length: 24 }).map((_, h) => (
                    <div key={h} className="text-[9px] text-muted-foreground text-center">
                      {h % 3 === 0 ? HOUR_LABELS[h / 3] : ""}
                    </div>
                  ))}
                  {DAY_LABELS.map((label, d) => (
                    <Fragment key={`row-${d}`}>
                      <div className="text-[10px] text-muted-foreground pr-2 leading-[14px]">
                        {label}
                      </div>
                      {Array.from({ length: 24 }).map((_, h) => (
                        <div
                          key={`c-${d}-${h}`}
                          className="w-[14px] h-[14px] rounded-[2px] m-[1px]"
                          style={{ background: heatColor(heatmap.grid[d][h]) }}
                          title={`${DAY_LABELS[d]} ${peakHourLabel(h)} — ${heatmap.grid[d][h]} orders`}
                        />
                      ))}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New vs returning this week */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">New vs returning (this week)</CardTitle>
            <CardDescription>Who is ordering from you right now</CardDescription>
          </CardHeader>
          <CardContent>
            {newVsReturning.reduce((s, x) => s + x.value, 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No orders this week yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={newVsReturning}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {newVsReturning.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* AOV trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Average order value (8 weeks)</CardTitle>
            <CardDescription>Are customers spending more or less over time?</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={avgValueTrend}>
                <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={50} tickFormatter={(v) => `£${v}`} />
                <Tooltip formatter={(v: number) => [`£${Number(v).toFixed(2)}`, "Avg order"]} />
                <Line type="monotone" dataKey="avg" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* ============ MENU PERFORMANCE ============ */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Menu performance</h3>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top dishes by revenue</CardTitle>
            <CardDescription>What actually makes you money — not just what's popular</CardDescription>
          </CardHeader>
          <CardContent>
            {menuPerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground">No menu data yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b">
                      <th className="py-2 pr-2">Dish</th>
                      <th className="py-2 pr-2 text-right">Ordered</th>
                      <th className="py-2 pr-2 text-right">Revenue</th>
                      <th className="py-2 pr-2 text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuPerformance.map((d) => {
                      const diff = d.thisWeek - d.lastWeek;
                      const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
                      const cls = diff > 0 ? "text-green-600" : diff < 0 ? "text-red-500" : "text-muted-foreground";
                      return (
                        <tr key={d.name} className="border-b last:border-0">
                          <td className="py-2 pr-2 font-medium truncate max-w-[160px]">{d.name}</td>
                          <td className="py-2 pr-2 text-right">{d.count}×</td>
                          <td className="py-2 pr-2 text-right">£{d.revenue.toFixed(2)}</td>
                          <td className={`py-2 pr-2 text-right ${cls}`}>
                            <span className="inline-flex items-center gap-1">
                              <Icon className="h-3.5 w-3.5" />
                              {diff > 0 ? `+${diff}` : diff}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ============ BOOKING TRENDS ============ */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Booking trends</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg table size</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookingByDay.avgParty.toFixed(1)} guests</div>
              <p className="text-xs text-muted-foreground mt-1">{bookings.length} reservations total</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Reservations by day</CardTitle>
              <CardDescription>Plan your staffing around your busiest days</CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={bookingByDay.data}>
                    <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={30} />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default InsightsTab;
