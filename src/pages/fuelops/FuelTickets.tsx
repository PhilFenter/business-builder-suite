import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import FuelOpsLayout from "@/components/fuelops/FuelOpsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Plus, Truck, Check, X, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import AircraftTypeInput from "@/components/fuelops/AircraftTypeInput";
import type { Tables } from "@/integrations/supabase/types";

interface FuelTicket {
  id: string;
  customer_id: string | null;
  aircraft_tail_number: string | null;
  aircraft_type: string | null;
  fuel_type: string;
  prist: boolean;
  gallons_requested: number | null;
  notes: string | null;
  status: string;
  created_by: string;
  assigned_driver_id: string | null;
  completed_at: string | null;
  created_at: string;
  customers: { name: string } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const FuelTickets = () => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<FuelTicket[]>([]);
  const [customers, setCustomers] = useState<Tables<"customers">[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customer_id: "",
    aircraft_tail_number: "",
    aircraft_type: "",
    fuel_type: "" as "100LL" | "Jet-A" | "",
    prist: false,
    gallons_requested: "",
    notes: "",
  });

  const fetchTickets = async () => {
    const { data } = await supabase
      .from("fuel_tickets")
      .select("*, customers(name)")
      .order("created_at", { ascending: false });
    if (data) setTickets(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
    supabase.from("customers").select("*").eq("is_active", true).order("name").then(({ data }) => {
      if (data) setCustomers(data);
    });

    // Realtime subscription
    const channel = supabase
      .channel("fuel-tickets-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "fuel_tickets" }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.fuel_type) return;
    setSubmitting(true);

    const { error } = await supabase.from("fuel_tickets").insert({
      created_by: user.id,
      customer_id: form.customer_id || null,
      aircraft_tail_number: form.aircraft_tail_number || null,
      aircraft_type: form.aircraft_type || null,
      fuel_type: form.fuel_type as "100LL" | "Jet-A",
      prist: form.prist,
      gallons_requested: form.gallons_requested ? parseFloat(form.gallons_requested) : null,
      notes: form.notes || null,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ticket Created", description: "Fuel ticket sent to the flight line" });
      setForm({ customer_id: "", aircraft_tail_number: "", aircraft_type: "", fuel_type: "", prist: false, gallons_requested: "", notes: "" });
      setShowForm(false);
    }
  };

  const updateStatus = async (ticketId: string, status: string) => {
    const updates: any = { status };
    if (status === "in_progress") updates.assigned_driver_id = user?.id;
    if (status === "completed") updates.completed_at = new Date().toISOString();

    const { error } = await supabase.from("fuel_tickets").update(updates).eq("id", ticketId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const activeTickets = tickets.filter(t => t.status === "pending" || t.status === "in_progress");
  const completedTickets = tickets.filter(t => t.status === "completed" || t.status === "cancelled");

  const isDriver = hasRole("driver") || hasRole("admin");
  const canCreate = hasRole("admin") || hasRole("billing_clerk") || hasRole("driver");

  return (
    <FuelOpsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Fuel Tickets</h1>
            <p className="text-muted-foreground text-sm">Lobby-to-flight-line fuel requests</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchTickets}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            {canCreate && (
              <Button size="sm" onClick={() => setShowForm(!showForm)}>
                <Plus className="w-4 h-4 mr-1" /> New Ticket
              </Button>
            )}
          </div>
        </div>

        {/* Create Ticket Form */}
        {showForm && (
          <Card className="border-primary/30 border-2">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                New Fuel Ticket
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer</Label>
                    <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tail #</Label>
                    <Input
                      value={form.aircraft_tail_number}
                      onChange={(e) => setForm({ ...form, aircraft_tail_number: e.target.value.toUpperCase() })}
                      placeholder="N12345"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Aircraft Type</Label>
                    <AircraftTypeInput value={form.aircraft_type} onChange={(v) => setForm({ ...form, aircraft_type: v })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Fuel Type *</Label>
                    <Select value={form.fuel_type} onValueChange={(v) => setForm({ ...form, fuel_type: v as any })}>
                      <SelectTrigger><SelectValue placeholder="Fuel type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100LL">100LL</SelectItem>
                        <SelectItem value="Jet-A">Jet-A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Gallons</Label>
                    <Input
                      type="number" step="0.1" min="0"
                      value={form.gallons_requested}
                      onChange={(e) => setForm({ ...form, gallons_requested: e.target.value })}
                      placeholder="Tabs / Full / Amount"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch checked={form.prist} onCheckedChange={(v) => setForm({ ...form, prist: v })} />
                  <Label>Prist (Anti-Ice Additive)</Label>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Special instructions, parking location, etc."
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                    Create Ticket
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Ticket Queue */}
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active" className="gap-1">
              Active
              {activeTickets.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">{activeTickets.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3 mt-4">
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : activeTickets.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No active fuel tickets</p>
                  <p className="text-xs mt-1">Create a ticket from the lobby to send to the flight line</p>
                </CardContent>
              </Card>
            ) : (
              activeTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} isDriver={isDriver} onUpdate={updateStatus} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-4">
            {completedTickets.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No completed tickets yet</p>
            ) : (
              completedTickets.slice(0, 20).map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} isDriver={isDriver} onUpdate={updateStatus} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </FuelOpsLayout>
  );
};

const TicketCard = ({
  ticket,
  isDriver,
  onUpdate,
}: {
  ticket: FuelTicket;
  isDriver: boolean;
  onUpdate: (id: string, status: string) => void;
}) => (
  <Card className={cn("border-border/50 transition-all", ticket.status === "pending" && "border-l-4 border-l-amber-500")}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={statusColors[ticket.status]}>
              {ticket.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className={ticket.fuel_type === "100LL" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"}>
              {ticket.fuel_type}
            </Badge>
            {ticket.prist && <Badge variant="outline" className="bg-purple-500/10 text-purple-400">Prist</Badge>}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {ticket.customers?.name && <span><span className="text-muted-foreground">Customer:</span> {ticket.customers.name}</span>}
            {ticket.aircraft_tail_number && <span><span className="text-muted-foreground">Tail:</span> {ticket.aircraft_tail_number}</span>}
            {ticket.aircraft_type && <span><span className="text-muted-foreground">Type:</span> {ticket.aircraft_type}</span>}
            {ticket.gallons_requested && <span><span className="text-muted-foreground">Gal:</span> {ticket.gallons_requested}</span>}
          </div>

          {ticket.notes && <p className="text-sm text-muted-foreground">{ticket.notes}</p>}
          <p className="text-xs text-muted-foreground">{format(new Date(ticket.created_at), "MMM d, h:mm a")}</p>
        </div>

        {isDriver && (
          <div className="flex gap-1.5 shrink-0">
            {ticket.status === "pending" && (
              <Button size="sm" variant="outline" onClick={() => onUpdate(ticket.id, "in_progress")}>
                <Truck className="w-4 h-4 mr-1" /> Claim
              </Button>
            )}
            {ticket.status === "in_progress" && (
              <Button size="sm" onClick={() => onUpdate(ticket.id, "completed")}>
                <Check className="w-4 h-4 mr-1" /> Done
              </Button>
            )}
            {(ticket.status === "pending" || ticket.status === "in_progress") && (
              <Button size="sm" variant="ghost" onClick={() => onUpdate(ticket.id, "cancelled")}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default FuelTickets;
