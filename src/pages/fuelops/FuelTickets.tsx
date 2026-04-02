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
import { ClipboardList, Plus, Loader2, RefreshCw, Fuel, Droplets, UtensilsCrossed, Snowflake, CalendarIcon, Clock, Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import AircraftTypeInput from "@/components/fuelops/AircraftTypeInput";
import CustomerInput from "@/components/fuelops/CustomerInput";
import TicketCard, { SERVICE_TYPES, type FuelTicket } from "@/components/fuelops/TicketCard";
import type { Tables } from "@/integrations/supabase/types";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [driverProfiles, setDriverProfiles] = useState<Record<string, string>>({});

  const defaultForm = {
    service_types: ["fuel"] as string[],
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
    if (data) {
      setTickets(data as any);
      // Fetch driver names for assigned tickets
      const driverIds = [...new Set(data.filter(t => t.assigned_driver_id).map(t => t.assigned_driver_id!))];
      if (driverIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", driverIds);
        if (profiles) {
          const map: Record<string, string> = {};
          profiles.forEach(p => { map[p.user_id] = p.full_name; });
          setDriverProfiles(prev => ({ ...prev, ...map }));
        }
      }
    }
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

  const isFuelService = form.service_types.includes("fuel");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.customer_id && !form.customer_name) {
      toast({ title: "Missing field", description: "Please enter a customer or pilot name.", variant: "destructive" });
      return;
    }
    if (form.service_types.length === 0) {
      toast({ title: "Missing field", description: "Please select at least one service type.", variant: "destructive" });
      return;
    }
    if (isFuelService && !form.fuel_type) {
      toast({ title: "Missing field", description: "Please select a fuel type.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("fuel_tickets").insert({
      created_by: user.id,
      service_type: form.service_types[0],
      service_types: form.service_types,
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
      const labels = form.service_types.map(st => SERVICE_TYPES.find(s => s.value === st)?.label).filter(Boolean).join(" + ");
      toast({ title: "Ticket Created", description: `${labels} ticket sent to the flight line` });
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
    const serviceList = ticket.service_types?.length ? ticket.service_types : [ticket.service_type];
    if (serviceList.includes("fuel")) {
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
                    {SERVICE_TYPES.map((svc) => {
                      const isSelected = form.service_types.includes(svc.value);
                      return (
                        <button
                          key={svc.value}
                          type="button"
                          onClick={() => {
                            const next = isSelected
                              ? form.service_types.filter(s => s !== svc.value)
                              : [...form.service_types, svc.value];
                            setForm({ ...form, service_types: next });
                          }}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                          )}
                        >
                          <svc.icon className="w-4 h-4" />
                          {svc.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Customer — fillable for transients */}
                <div className="space-y-2">
                  <Label>Customer / Pilot Name *</Label>
                  <CustomerInput
                    customers={customers}
                    selectedId={form.customer_id}
                    customName={form.customer_name}
                    onSelectAccount={(id) => setForm((current) => ({ ...current, customer_id: id }))}
                    onTypeCustom={(name) => setForm((current) => ({ ...current, customer_name: name }))}
                  />
                  <p className="text-xs text-muted-foreground">Type a name for transients or select a house account</p>
                </div>

                {/* Pilot Contact Info — right below name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pilot Phone</Label>
                    <Input
                      type="tel"
                      value={form.pilot_phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                        let formatted = digits;
                        if (digits.length > 6) formatted = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
                        else if (digits.length > 3) formatted = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
                        else if (digits.length > 0) formatted = `(${digits}`;
                        setForm({ ...form, pilot_phone: formatted });
                      }}
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

                {/* Aircraft Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tail #</Label>
                    <Input
                      value={form.aircraft_tail_number}
                      onChange={(e) => setForm({ ...form, aircraft_tail_number: e.target.value.toUpperCase() })}
                      placeholder="N12345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Aircraft Type</Label>
                    <AircraftTypeInput value={form.aircraft_type} onChange={(v) => setForm({ ...form, aircraft_type: v })} />
                  </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Fuel Type *</Label>
                      <Select value={form.fuel_type} onValueChange={(v) => setForm({ ...form, fuel_type: v as "100LL" | "Jet-A" })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Jet-A">Jet-A</SelectItem>
                          <SelectItem value="100LL">100LL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Gallons Requested</Label>
                      <Input
                        type="number"
                        value={form.gallons_requested}
                        onChange={(e) => setForm({ ...form, gallons_requested: e.target.value })}
                        placeholder="e.g. 100"
                      />
                    </div>
                    <div className="flex items-end gap-2 pb-1">
                      <Switch
                        checked={form.prist}
                        onCheckedChange={(v) => setForm({ ...form, prist: v })}
                      />
                      <Label>Prist</Label>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder={
                      form.service_types.includes("catering") ? "Menu items, headcount, delivery time..."
                        : form.service_types.includes("de_ice") ? "Aircraft location, type of treatment needed..."
                        : form.service_types.includes("lav_service") ? "Aircraft location, any special instructions..."
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
                <TicketCard key={ticket.id} ticket={ticket} isDriver={isDriver} onUpdate={updateStatus} onComplete={handleComplete} driverName={ticket.assigned_driver_id ? driverProfiles[ticket.assigned_driver_id] : null} />
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
                  <TicketCard key={ticket.id} ticket={ticket} isDriver={isDriver} onUpdate={updateStatus} onComplete={handleComplete} driverName={ticket.assigned_driver_id ? driverProfiles[ticket.assigned_driver_id] : null} />
                ))}
              </>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-4">
            {completedTickets.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No completed tickets yet</p>
            ) : (
              completedTickets.slice(0, 20).map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} isDriver={isDriver} onUpdate={updateStatus} onComplete={handleComplete} driverName={ticket.assigned_driver_id ? driverProfiles[ticket.assigned_driver_id] : null} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </FuelOpsLayout>
  );
};

export default FuelTickets;
