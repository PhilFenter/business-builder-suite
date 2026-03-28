import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import FuelOpsLayout from "@/components/fuelops/FuelOpsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fuel, TrendingUp, Users, DollarSign, Truck } from "lucide-react";
import { format } from "date-fns";

interface DashboardStats {
  totalDeliveries: number;
  totalGallons: number;
  totalRevenue: number;
  activeCustomers: number;
}

interface RecentDelivery {
  id: string;
  fuel_type: string;
  gallons: number;
  total_amount: number;
  aircraft_tail_number: string | null;
  delivered_at: string;
  customers: { name: string } | null;
}

const Dashboard = () => {
  const { hasRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ totalDeliveries: 0, totalGallons: 0, totalRevenue: 0, activeCustomers: 0 });
  const [recentDeliveries, setRecentDeliveries] = useState<RecentDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [deliveriesRes, customersRes, recentRes] = await Promise.all([
        supabase.from("fuel_deliveries").select("gallons, total_amount"),
        supabase.from("customers").select("id").eq("is_active", true),
        supabase.from("fuel_deliveries")
          .select("id, fuel_type, gallons, total_amount, aircraft_tail_number, delivered_at, customers(name)")
          .order("delivered_at", { ascending: false })
          .limit(10),
      ]);

      if (deliveriesRes.data) {
        setStats({
          totalDeliveries: deliveriesRes.data.length,
          totalGallons: deliveriesRes.data.reduce((sum, d) => sum + Number(d.gallons), 0),
          totalRevenue: deliveriesRes.data.reduce((sum, d) => sum + Number(d.total_amount), 0),
          activeCustomers: customersRes.data?.length ?? 0,
        });
      }

      if (recentRes.data) {
        setRecentDeliveries(recentRes.data as any);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const statCards = [
    { label: "Total Deliveries", value: stats.totalDeliveries.toLocaleString(), icon: Truck, color: "text-primary" },
    { label: "Gallons Delivered", value: stats.totalGallons.toLocaleString(undefined, { maximumFractionDigits: 0 }), icon: Fuel, color: "text-accent" },
    { label: "Revenue", value: `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-green-400" },
    { label: "Active Customers", value: stats.activeCustomers.toLocaleString(), icon: Users, color: "text-primary" },
  ];

  return (
    <FuelOpsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Fuel operations overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                    <p className="text-2xl font-display font-bold mt-1">{loading ? "—" : stat.value}</p>
                  </div>
                  <div className={cn("p-2 rounded-lg bg-secondary", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Deliveries */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : recentDeliveries.length === 0 ? (
              <p className="text-muted-foreground text-sm">No deliveries yet. Start by logging a delivery.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">Customer</th>
                      <th className="text-left py-2 font-medium">Fuel</th>
                      <th className="text-right py-2 font-medium">Gallons</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                      <th className="text-left py-2 font-medium">Tail #</th>
                      <th className="text-left py-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDeliveries.map((d) => (
                      <tr key={d.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="py-2.5">{d.customers?.name ?? "—"}</td>
                        <td className="py-2.5">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            d.fuel_type === "100LL" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"
                          )}>
                            {d.fuel_type}
                          </span>
                        </td>
                        <td className="py-2.5 text-right tabular-nums">{Number(d.gallons).toFixed(1)}</td>
                        <td className="py-2.5 text-right tabular-nums">${Number(d.total_amount).toFixed(2)}</td>
                        <td className="py-2.5 text-muted-foreground">{d.aircraft_tail_number || "—"}</td>
                        <td className="py-2.5 text-muted-foreground">{format(new Date(d.delivered_at), "MMM d, h:mm a")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </FuelOpsLayout>
  );
};

// Need cn import
import { cn } from "@/lib/utils";

export default Dashboard;
