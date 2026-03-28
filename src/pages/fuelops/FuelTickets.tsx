import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { ClipboardList, Plus, Truck, Check, X, Loader2, RefreshCw, Fuel, Droplets, UtensilsCrossed, Snowflake, CalendarIcon, Clock, Plane, Phone, Mail, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import AircraftTypeInput from "@/components/fuelops/AircraftTypeInput";
import CustomerInput from "@/components/fuelops/CustomerInput";
import type { Tables } from "@/integrations/supabase/types";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const SERVICE_TYPES = [
  { value: "fuel", label: "Fuel", icon: Fuel },
  { value: "de_ice", label: "De-Ice", icon: Snowflake },
  { value: "lav_service", label: "Lav Service", icon: Droplets },
  { value: "catering", label: "Catering", icon: UtensilsCrossed },
  { value: "other", label: "Other", icon: ClipboardList },
] as const;

const serviceColors: Record<string, string> = {
  fuel: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  de_ice: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  lav_service: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  catering: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  other: "bg-muted text-muted-foreground border-border",
};

interface FuelTicket {
  id: string;
  customer_id: string | null;
  customer_name: string | null;
  aircraft_tail_number: string | null;
  aircraft_type: string | null;
  fuel_type: string | null;
  prist: boolean;
  gallons_requested: number | null;
  notes: string | null;
  status: string;
  service_type: string;
  created_by: string;
  assigned_driver_id: string | null;
  completed_at: string | null;
  created_at: string;
  requested_date: string | null;
  requested_time: string | null;
  pilot_phone: string | null;
  pilot_email: string | null;
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<FuelTicket[]>([]);
  const [customers, setCustomers] = useState<Tables<"customers">[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const defaultForm = {
    service_type: "fuel" as string,
    customer_id: "",
    customer_name: "",
    aircraft_tail_number: "",
    aircraft_type: "",
    fuel_type: "" as "100LL" | "Jet-A" | "",
    prist: false,
    gallons_requested: "",
    requested_date: new Date() as Date | undefined,
    requested_time: "",
    pilot_phone: "",
    pilot_email: "",
    notes: "",
  };
  const [form, setForm] = useState(defaultForm);

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

    const channel = supabase
      .channel("fuel-tickets-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "fuel_tickets" }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const isFuelService = form.service_type === "fuel";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (isFuelService && !form.fuel_type) return;

    setSubmitting(true);

    const { error } = await supabase.from("fuel_tickets").insert({
      created_by: user.id,
      service_type: form.service_type,
      customer_id: form.customer_id || null,
      customer_name: form.customer_name || null,
      aircraft_tail_number: form.aircraft_tail_number || null,
      aircraft_type: form.aircraft_type || null,
      fuel_type: isFuelService ? (form.fuel_type as "100LL" | "Jet-A") : null,
      prist: isFuelService ? form.prist : false,
      gallons_requested: form.gallons_requested ? parseFloat(form.gallons_requested) : null,
      requested_date: form.requested_date ? format(form.requested_date, "yyyy-MM-dd") : null,
      requested_time: form.requested_time || null,
      pilot_phone: form.pilot_phone || null,
      pilot_email: form.pilot_email || null,
      notes: form.notes || null,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const svc = SERVICE_TYPES.find(s => s.value === form.service_type);
      toast({ title: "Ticket Created", description: `${svc?.label} ticket sent to the flight line` });
      setForm(defaultForm);
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

  // For fuel tickets, navigate to pre-filled log; for others, mark completed directly
  const handleComplete = (ticket: FuelTicket) => {
    if (ticket.service_type === "fuel") {
      navigate(`/fuelops/log?ticket=${ticket.id}`);
    } else {
      updateStatus(ticket.id, "completed");
    }
  };

  const activeTickets = tickets.filter(t => t.status === "pending" || t.status === "in_progress");
  const today = format(new Date(), "yyyy-MM-dd");

  // Now: no future date, or date is today
  const nowTickets = activeTickets.filter(t =>
    !t.requested_date || t.requested_date <= today
  );

  // Scheduled: future-dated tickets, sorted earliest first
  const scheduledTickets = activeTickets.filter(t =>
    t.requested_date && t.requested_date > today
  ).sort((a, b) => (a.requested_date! > b.requested_date! ? 1 : -1));

  const completedTickets = tickets.filter(t => t.status === "completed" || t.status === "cancelled");

  const isDriver = hasRole("driver") || hasRole("admin");
  const canCreate = hasRole("admin") || hasRole("billing_clerk") || hasRole("driver");

  return (
    <FuelOpsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Service Tickets</h1>
            <p className="text-muted-foreground text-sm">Lobby-to-flight-line service requests</p>
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
                New Service Ticket
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                {/* Service Type Selector */}
                <div className="space-y-2">
                  <Label>Service Type *</Label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_TYPES.map((svc) => (
                      <button
                        key={svc.value}
                        type="button"
                        onClick={() => setForm({ ...form, service_type: svc.value })}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                          form.service_type === svc.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                      >
                        <svc.icon className="w-4 h-4" />
                        {svc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer — fillable for transients */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer / Pilot Name</Label>
                    <CustomerInput
                      customers={customers}
                      selectedId={form.customer_id}
                      customName={form.customer_name}
                      onSelectAccount={(id) => setForm({ ...form, customer_id: id })}
                      onTypeCustom={(name) => setForm({ ...form, customer_name: name })}
                    />
                    <p className="text-xs text-muted-foreground">Type a name for transients or select a house account</p>
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

                <div className="space-y-2">
                  <Label>Aircraft Type</Label>
                  <AircraftTypeInput value={form.aircraft_type} onChange={(v) => setForm({ ...form, aircraft_type: v })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Service Date</Label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.requested_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {form.requested_date ? format(form.requested_date, "PPP") : "Today"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.requested_date}
                          onSelect={(d) => {
                            setForm({ ...form, requested_date: d });
                            setCalendarOpen(false);
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>ETA / Departure Time</Label>
                    <Input
                      type="time"
                      value={form.requested_time}
                      onChange={(e) => setForm({ ...form, requested_time: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Arrival or departure time</p>
                  </div>
                </div>

                {/* Fuel-specific fields */}
                {isFuelService && (
                  <div className="space-y-4 p-4 rounded-lg bg-secondary/30 border border-border/50">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Fuel Type *</Label>
                        <Select value={form.fuel_type} onValueChange={(v) => setForm({ ...form, fuel_type: v as any })}>
                          <SelectTrigger><SelectValue placeholder="Fuel type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="100LL">100LL (Avgas)</SelectItem>
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
                          placeholder="Top off / Amount"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Prist</Label>
                        <div className="flex items-center gap-3 h-10 px-3 rounded-md border border-input bg-background">
                          <Switch checked={form.prist} onCheckedChange={(v) => setForm({ ...form, prist: v })} />
                          <span className={cn("text-sm", form.prist ? "text-foreground font-medium" : "text-muted-foreground")}>
                            {form.prist ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pilot Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pilot Phone</Label>
                    <Input
                      type="tel"
                      value={form.pilot_phone}
                      onChange={(e) => setForm({ ...form, pilot_phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pilot Email</Label>
                    <Input
                      type="email"
                      value={form.pilot_email}
                      onChange={(e) => setForm({ ...form, pilot_email: e.target.value })}
                      placeholder="pilot@example.com"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder={
                      form.service_type === "catering" ? "Menu items, headcount, delivery time..."
                        : form.service_type === "de_ice" ? "Aircraft location, type of treatment needed..."
                        : form.service_type === "lav_service" ? "Aircraft location, any special instructions..."
                        : "Special instructions, parking location, etc."
                    }
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
        <Tabs defaultValue="now">
          <TabsList>
            <TabsTrigger value="now" className="gap-1">
              <Clock className="w-3.5 h-3.5" />
              Now
              {nowTickets.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">{nowTickets.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="gap-1">
              <Plane className="w-3.5 h-3.5" />
              Scheduled
              {scheduledTickets.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">{scheduledTickets.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="now" className="space-y-3 mt-4">
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : nowTickets.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No active tickets right now</p>
                  <p className="text-xs mt-1">Check Scheduled for upcoming departures</p>
                </CardContent>
              </Card>
            ) : (
              nowTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} isDriver={isDriver} onUpdate={updateStatus} onComplete={handleComplete} />
              ))
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-3 mt-4">
            {scheduledTickets.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Plane className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No scheduled departures</p>
                  <p className="text-xs mt-1">Future-dated service requests will appear here sorted by date</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-sm text-muted-foreground">
                  <Plane className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  Upcoming departures & scheduled services — review at shift start to prioritize fueling
                </div>
                {scheduledTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} isDriver={isDriver} onUpdate={updateStatus} onComplete={handleComplete} />
                ))}
              </>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-4">
            {completedTickets.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No completed tickets yet</p>
            ) : (
              completedTickets.slice(0, 20).map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} isDriver={isDriver} onUpdate={updateStatus} onComplete={handleComplete} />
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
  onComplete,
}: {
  ticket: FuelTicket;
  isDriver: boolean;
  onUpdate: (id: string, status: string) => void;
  onComplete: (ticket: FuelTicket) => void;
}) => {
  const [expanded, setExpanded] = useState(ticket.status === "in_progress");
  const svc = SERVICE_TYPES.find(s => s.value === ticket.service_type) ?? SERVICE_TYPES[0];
  const customerDisplay = ticket.customers?.name ?? ticket.customer_name ?? null;

  const handleClaim = () => {
    onUpdate(ticket.id, "in_progress");
    setExpanded(true);
  };

  return (
    <Card
      className={cn(
        "border-border/50 transition-all cursor-pointer",
        ticket.status === "pending" && "border-l-4 border-l-amber-500",
        ticket.status === "in_progress" && "border-l-4 border-l-blue-500",
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-4">
        {/* Summary row — always visible */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            <Badge variant="outline" className={statusColors[ticket.status]}>
              {ticket.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className={serviceColors[ticket.service_type] ?? serviceColors.other}>
              <svc.icon className="w-3 h-3 mr-1" />
              {svc.label}
            </Badge>
            {ticket.fuel_type && (
              <Badge variant="outline" className={ticket.fuel_type === "100LL" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"}>
                {ticket.fuel_type}
              </Badge>
            )}
            {ticket.prist && <Badge variant="outline" className="bg-purple-500/10 text-purple-400">Prist</Badge>}
            {!expanded && customerDisplay && (
              <span className="text-sm font-medium text-foreground truncate">{customerDisplay}</span>
            )}
            {!expanded && ticket.aircraft_tail_number && (
              <span className="text-sm text-muted-foreground truncate">{ticket.aircraft_tail_number}</span>
            )}
            {!expanded && ticket.aircraft_type && (
              <span className="text-sm text-muted-foreground truncate">{ticket.aircraft_type}</span>
            )}
            {!expanded && ticket.gallons_requested && (
              <span className="text-sm text-muted-foreground">{ticket.gallons_requested} Gal</span>
            )}
          </div>

          {isDriver && (
            <div className="flex gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              {ticket.status === "pending" && (
                <Button size="sm" variant="outline" onClick={handleClaim}>
                  <Truck className="w-4 h-4 mr-1" /> Claim
                </Button>
              )}
              {ticket.status === "in_progress" && (
                <Button size="sm" onClick={() => onComplete(ticket)}>
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

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
              {customerDisplay && (
                <div>
                  <span className="text-muted-foreground text-xs block">Customer</span>
                  <span className="font-medium">{customerDisplay}</span>
                </div>
              )}
              {ticket.aircraft_tail_number && (
                <div>
                  <span className="text-muted-foreground text-xs block">Tail #</span>
                  <span className="font-medium">{ticket.aircraft_tail_number}</span>
                </div>
              )}
              {/* Pilot Contact — right after customer & tail # */}
              {(ticket.pilot_phone || ticket.pilot_email) && (
                <div className="col-span-2 sm:col-span-3 flex flex-wrap items-center gap-2">
                  {ticket.pilot_phone && (
                    <>
                      <Button size="sm" variant="outline" asChild onClick={(e) => e.stopPropagation()}>
                        <a href={`tel:${ticket.pilot_phone}`}>
                          <Phone className="w-3.5 h-3.5 mr-1" /> Call
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" asChild onClick={(e) => e.stopPropagation()}>
                        <a href={`sms:${ticket.pilot_phone}`}>
                          <MessageSquare className="w-3.5 h-3.5 mr-1" /> Text
                        </a>
                      </Button>
                    </>
                  )}
                  {ticket.pilot_email && (
                    <Button size="sm" variant="outline" asChild onClick={(e) => e.stopPropagation()}>
                      <a href={`mailto:${ticket.pilot_email}`}>
                        <Mail className="w-3.5 h-3.5 mr-1" /> Email
                      </a>
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {ticket.pilot_phone}{ticket.pilot_phone && ticket.pilot_email ? " · " : ""}{ticket.pilot_email}
                  </span>
                </div>
              )}
              {ticket.aircraft_type && (
                <div>
                  <span className="text-muted-foreground text-xs block">Aircraft</span>
                  <span className="font-medium">{ticket.aircraft_type}</span>
                </div>
              )}
              {ticket.fuel_type && (
                <div>
                  <span className="text-muted-foreground text-xs block">Fuel Type</span>
                  <span className="font-medium">{ticket.fuel_type}{ticket.prist ? " + Prist" : ""}</span>
                </div>
              )}
              {ticket.gallons_requested && (
                <div>
                  <span className="text-muted-foreground text-xs block">Gallons</span>
                  <span className="font-medium">{ticket.gallons_requested}</span>
                </div>
              )}
              {ticket.requested_date && (
                <div>
                  <span className="text-muted-foreground text-xs block">Scheduled</span>
                  <span className="font-medium">
                    {format(new Date(ticket.requested_date + "T00:00:00"), "MMM d, yyyy")}
                    {ticket.requested_time && ` @ ${ticket.requested_time.slice(0, 5)}`}
                  </span>
                </div>
              )}
            </div>
            {ticket.notes && (
              <div className="text-sm">
                <span className="text-muted-foreground text-xs block">Notes</span>
                <p>{ticket.notes}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Created {format(new Date(ticket.created_at), "MMM d, h:mm a")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FuelTickets;
