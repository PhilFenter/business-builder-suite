import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import FuelOpsLayout from "@/components/fuelops/FuelOpsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Truck, FileText, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

const Reports = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("all");
  const [deliverySearch, setDeliverySearch] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      const [ticketRes, deliveryRes] = await Promise.all([
        supabase.from("fuel_tickets")
          .select("*, customers(name)")
          .order("created_at", { ascending: false }),
        supabase.from("fuel_deliveries")
          .select("*, customers(name)")
          .order("delivered_at", { ascending: false }),
      ]);
      if (ticketRes.data) setTickets(ticketRes.data);
      if (deliveryRes.data) setDeliveries(deliveryRes.data);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    const name = (t.customers?.name || t.customer_name || "").toLowerCase();
    const tail = (t.aircraft_tail_number || "").toLowerCase();
    const search = ticketSearch.toLowerCase();
    const matchesSearch = !search || name.includes(search) || tail.includes(search);
    const matchesStatus = ticketStatusFilter === "all" || t.status === ticketStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDeliveries = deliveries.filter((d) => {
    const name = (d.customers?.name || d.customer_name || "").toLowerCase();
    const tail = (d.aircraft_tail_number || "").toLowerCase();
    const search = deliverySearch.toLowerCase();
    return !search || name.includes(search) || tail.includes(search);
  });

  return (
    <FuelOpsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground text-sm">Detailed view of all tickets and deliveries</p>
        </div>

        <Tabs defaultValue="tickets">
          <TabsList>
            <TabsTrigger value="tickets" className="gap-1.5">
              <ClipboardList className="w-3.5 h-3.5" />
              All Tickets ({tickets.length})
            </TabsTrigger>
            <TabsTrigger value="deliveries" className="gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              All Deliveries ({deliveries.length})
            </TabsTrigger>
          </TabsList>

          {/* TICKETS TAB */}
          <TabsContent value="tickets" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  placeholder="Search by customer or tail #..."
                  className="pl-9"
                />
              </div>
              <Select value={ticketStatusFilter} onValueChange={setTicketStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="border-border/50">
              <CardContent className="p-0">
                {loading ? (
                  <p className="text-muted-foreground text-sm p-6">Loading...</p>
                ) : filteredTickets.length === 0 ? (
                  <p className="text-muted-foreground text-sm p-6">No tickets match your filters.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="text-left py-3 px-4 font-medium">Customer</th>
                          <th className="text-left py-3 px-4 font-medium">Service</th>
                          <th className="text-left py-3 px-4 font-medium">Tail #</th>
                          <th className="text-left py-3 px-4 font-medium">Fuel</th>
                          <th className="text-right py-3 px-4 font-medium">Gallons</th>
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.map((t) => (
                          <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/30">
                            <td className="py-3 px-4 font-medium">{t.customers?.name || t.customer_name || "—"}</td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="text-xs">
                                {SERVICE_LABELS[t.service_type] || t.service_type}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">{t.aircraft_tail_number || "—"}</td>
                            <td className="py-3 px-4">
                              {t.fuel_type ? (
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-xs font-medium",
                                  t.fuel_type === "100LL" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"
                                )}>
                                  {t.fuel_type}{t.prist ? " + Prist" : ""}
                                </span>
                              ) : "—"}
                            </td>
                            <td className="py-3 px-4 text-right tabular-nums">{t.gallons_requested || "—"}</td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {t.requested_date ? format(new Date(t.requested_date + "T00:00:00"), "MMM d") : "—"}
                              {t.requested_time ? ` ${t.requested_time}` : ""}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={cn("text-xs", STATUS_STYLES[t.status] || "")}>
                                {t.status.replace("_", " ")}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground text-xs">
                              {format(new Date(t.created_at), "MMM d, h:mm a")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DELIVERIES TAB */}
          <TabsContent value="deliveries" className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={deliverySearch}
                onChange={(e) => setDeliverySearch(e.target.value)}
                placeholder="Search by customer or tail #..."
                className="pl-9"
              />
            </div>

            <Card className="border-border/50">
              <CardContent className="p-0">
                {loading ? (
                  <p className="text-muted-foreground text-sm p-6">Loading...</p>
                ) : filteredDeliveries.length === 0 ? (
                  <p className="text-muted-foreground text-sm p-6">No deliveries match your search.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="text-left py-3 px-4 font-medium">Customer</th>
                          <th className="text-left py-3 px-4 font-medium">Fuel</th>
                          <th className="text-right py-3 px-4 font-medium">Gallons</th>
                          <th className="text-right py-3 px-4 font-medium">$/Gal</th>
                          <th className="text-right py-3 px-4 font-medium">Total</th>
                          <th className="text-left py-3 px-4 font-medium">Tail #</th>
                          <th className="text-left py-3 px-4 font-medium">Truck</th>
                          <th className="text-left py-3 px-4 font-medium">Meter</th>
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDeliveries.map((d) => (
                          <tr key={d.id} className="border-b border-border/50 hover:bg-secondary/30">
                            <td className="py-3 px-4 font-medium">{d.customers?.name || d.customer_name || "—"}</td>
                            <td className="py-3 px-4">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                d.fuel_type === "100LL" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"
                              )}>
                                {d.fuel_type}{d.prist ? " + Prist" : ""}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right tabular-nums">{Number(d.gallons).toFixed(1)}</td>
                            <td className="py-3 px-4 text-right tabular-nums">${Number(d.price_per_gallon).toFixed(3)}</td>
                            <td className="py-3 px-4 text-right tabular-nums font-medium">${Number(d.total_amount).toFixed(2)}</td>
                            <td className="py-3 px-4 text-muted-foreground">{d.aircraft_tail_number || "—"}</td>
                            <td className="py-3 px-4 text-muted-foreground">{d.truck_id || "—"}</td>
                            <td className="py-3 px-4 text-muted-foreground text-xs">
                              {d.meter_start && d.meter_stop
                                ? `${Number(d.meter_start).toFixed(0)}–${Number(d.meter_stop).toFixed(0)}`
                                : "—"}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground text-xs">
                              {format(new Date(d.delivered_at), "MMM d, h:mm a")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FuelOpsLayout>
  );
};

export default Reports;
