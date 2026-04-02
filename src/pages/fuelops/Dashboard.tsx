import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import FuelOpsLayout from "@/components/fuelops/FuelOpsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fuel, TrendingUp, Users, DollarSign, Truck, ClipboardList, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalDeliveries: number;
  totalGallons: number;
  totalRevenue: number;
  activeCustomers: number;
  ticketsPending: number;
  ticketsInProgress: number;
  ticketsCompletedToday: number;
}

interface RecentDelivery {
  id: string;
  fuel_type: string;
  gallons: number;
  total_amount: number;
  aircraft_tail_number: string | null;
  delivered_at: string;
  customers: { name: string } | null;
  customer_name: string | null;
}

interface RecentTicket {
  id: string;
  service_type: string;
  status: string;
  customer_name: string | null;
  aircraft_tail_number: string | null;
  fuel_type: string | null;
  gallons_requested: number | null;
  prist: boolean;
  requested_date: string | null;
  requested_time: string | null;
  created_at: string;
  customers: { name: string } | null;
}

const SERVICE_LABELS: Record<string, string> = {
  fuel: "Fuel",
  de_ice: "De-Ice",
  lav_service: "Lavatory",
  catering: "Catering",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400",
  in_progress: "bg-blue-500/10 text-blue-400",
  completed: "bg-green-500/10 text-green-400",
  cancelled: "bg-muted text-muted-foreground",
};

const Dashboard = () => {
  const { hasRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalDeliveries: 0, totalGallons: 0, totalRevenue: 0, activeCustomers: 0,
    ticketsPending: 0, ticketsInProgress: 0, ticketsCompletedToday: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState<RecentDelivery[]>([]);
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const today = format(new Date(), "yyyy-MM-dd");

      const [deliveriesRes, customersRes, recentDelRes, ticketsRes, recentTicketRes] = await Promise.all([
        supabase.from("fuel_deliveries").select("gallons, total_amount"),
        supabase.from("customers").select("id").eq("is_active", true),
        supabase.from("fuel_deliveries")
          .select("id, fuel_type, gallons, total_amount, aircraft_tail_number, delivered_at, customer_name, customers(name)")
          .order("delivered_at", { ascending: false })
          .limit(5),
        supabase.from("fuel_tickets").select("status, completed_at"),
        supabase.from("fuel_tickets")
          .select("id, service_type, status, customer_name, aircraft_tail_number, fuel_type, gallons_requested, prist, requested_date, requested_time, created_at, customers(name)")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const ticketData = ticketsRes.data ?? [];
      const completedToday = ticketData.filter(
        (t) => t.status === "completed" && t.completed_at && t.completed_at.startsWith(today)
      ).length;

      if (deliveriesRes.data) {
        setStats({
          totalDeliveries: deliveriesRes.data.length,
          totalGallons: deliveriesRes.data.reduce((sum, d) => sum + Number(d.gallons), 0),
          totalRevenue: deliveriesRes.data.reduce((sum, d) => sum + Number(d.total_amount), 0),
          activeCustomers: customersRes.data?.length ?? 0,
          ticketsPending: ticketData.filter((t) => t.status === "pending").length,
          ticketsInProgress: ticketData.filter((t) => t.status === "in_progress").length,
          ticketsCompletedToday: completedToday,
        });
      }

      if (recentDelRes.data) setRecentDeliveries(recentDelRes.data as any);
      if (recentTicketRes.data) setRecentTickets(recentTicketRes.data as any);

      setLoading(false);
    };

    fetchData();

    // Realtime refresh
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "fuel_tickets" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "fuel_deliveries" }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const statCards = [
    { label: "Pending Tickets", value: stats.ticketsPending, icon: Clock, color: "text-amber-400" },
    { label: "In Progress", value: stats.ticketsInProgress, icon: AlertCircle, color: "text-blue-400" },
    { label: "Completed Today", value: stats.ticketsCompletedToday, icon: CheckCircle2, color: "text-green-400" },
    { label: "Total Deliveries", value: stats.totalDeliveries.toLocaleString(), icon: Truck, color: "text-primary" },
    { label: "Gallons Delivered", value: stats.totalGallons.toLocaleString(undefined, { maximumFractionDigits: 0 }), icon: Fuel, color: "text-accent" },
    { label: "Revenue", value: `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-green-400" },
  ];

  return (
    <FuelOpsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Fuel operations overview</p>
          </div>
          <Link to="/fuelops/reports">
            <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
              View Reports →
            </Badge>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center gap-1">
                  <div className={cn("p-2 rounded-lg bg-secondary", stat.color)}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <p className="text-xl font-display font-bold mt-1">{loading ? "—" : stat.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tickets */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  Recent Tickets
                </span>
                <Link to="/fuelops/tickets" className="text-xs text-muted-foreground hover:text-foreground">
                  View all →
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : recentTickets.length === 0 ? (
                <p className="text-muted-foreground text-sm">No tickets yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentTickets.map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/30 border border-border/30">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {t.customers?.name || t.customer_name || "—"}
                          </span>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {SERVICE_LABELS[t.service_type] || t.service_type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          {t.aircraft_tail_number && <span>{t.aircraft_tail_number}</span>}
                          {t.fuel_type && <span>· {t.fuel_type}</span>}
                          {t.gallons_requested && <span>· {t.gallons_requested} gal</span>}
                          {t.prist && <span>· Prist</span>}
                        </div>
                      </div>
                      <Badge className={cn("text-[10px] shrink-0 ml-2", STATUS_STYLES[t.status] || "")}>
                        {t.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Deliveries */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Recent Deliveries
                </span>
                <Link to="/fuelops/reports" className="text-xs text-muted-foreground hover:text-foreground">
                  View all →
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : recentDeliveries.length === 0 ? (
                <p className="text-muted-foreground text-sm">No deliveries yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentDeliveries.map((d) => (
                    <div key={d.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/30 border border-border/30">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {d.customers?.name || d.customer_name || "—"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{d.fuel_type}</span>
                          <span>· {Number(d.gallons).toFixed(1)} gal</span>
                          {d.aircraft_tail_number && <span>· {d.aircraft_tail_number}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-sm font-medium tabular-nums">${Number(d.total_amount).toFixed(2)}</p>
                        <p className="text-[10px] text-muted-foreground">{format(new Date(d.delivered_at), "MMM d, h:mm a")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </FuelOpsLayout>
  );
};

export default Dashboard;
