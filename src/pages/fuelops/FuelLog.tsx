import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
import { Fuel, Check, Loader2, ArrowLeft, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import AircraftTypeInput from "@/components/fuelops/AircraftTypeInput";
import CustomerInput from "@/components/fuelops/CustomerInput";
import TicketSearchInput from "@/components/fuelops/TicketSearchInput";

import type { Tables } from "@/integrations/supabase/types";

interface FormState {
  customer_id: string;
  customer_name: string;
  fuel_type: "100LL" | "Jet-A" | "";
  gallons: string;
  price_per_gallon: string;
  aircraft_tail_number: string;
  aircraft_type: string;
  prist: boolean;
  meter_start: string;
  meter_stop: string;
  truck_id: string;
  notes: string;
}

const emptyForm: FormState = {
  customer_id: "",
  customer_name: "",
  fuel_type: "",
  gallons: "",
  price_per_gallon: "",
  aircraft_tail_number: "",
  aircraft_type: "",
  prist: false,
  meter_start: "",
  meter_stop: "",
  truck_id: "",
  notes: "",
};

const FuelLog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get("ticket");

  const [customers, setCustomers] = useState<Tables<"customers">[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [form, setForm] = useState<FormState>({ ...emptyForm });

  // Fetch customers
  useEffect(() => {
    supabase.from("customers").select("*").eq("is_active", true).order("name").then(({ data }) => {
      if (data) setCustomers(data);
    });
  }, []);

  // If ticket ID in URL, fetch ticket and pre-fill
  useEffect(() => {
    if (!ticketId) return;
    supabase
      .from("fuel_tickets")
      .select("*, customers(name)")
      .eq("id", ticketId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          toast({ title: "Ticket not found", variant: "destructive" });
          return;
        }
        setTicketData(data);
        setForm({
          ...emptyForm,
          customer_id: data.customer_id ?? "",
          customer_name: data.customers?.name ?? data.customer_name ?? "",
          fuel_type: (data.fuel_type as "100LL" | "Jet-A") ?? "",
          gallons: data.gallons_requested ? String(data.gallons_requested) : "",
          aircraft_tail_number: data.aircraft_tail_number ?? "",
          aircraft_type: data.aircraft_type ?? "",
          prist: data.prist ?? false,
          notes: data.notes ?? "",
        });
      });
  }, [ticketId]);

  const meterGallons = form.meter_start && form.meter_stop
    ? Math.max(0, parseFloat(form.meter_stop) - parseFloat(form.meter_start)).toFixed(1)
    : null;

  // Metered gallons is display-only for bookkeeping — does not override ordered gallons

  const totalAmount = form.gallons && form.price_per_gallon
    ? (parseFloat(form.gallons) * parseFloat(form.price_per_gallon)).toFixed(2)
    : "0.00";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!form.customer_id && !form.customer_name) || !form.fuel_type || !form.gallons || !form.price_per_gallon) {
      toast({ title: "Missing fields", description: "Please fill in all required fields (customer, fuel type, gallons, price).", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    // 1. Insert delivery
    const { data: delivery, error } = await supabase.from("fuel_deliveries").insert({
      driver_id: user.id,
      customer_id: form.customer_id || null,
      customer_name: form.customer_name || null,
      fuel_type: form.fuel_type as "100LL" | "Jet-A",
      gallons: parseFloat(form.gallons),
      price_per_gallon: parseFloat(form.price_per_gallon),
      total_amount: parseFloat(totalAmount),
      aircraft_tail_number: form.aircraft_tail_number || null,
      aircraft_type: form.aircraft_type || null,
      prist: form.prist,
      meter_start: form.meter_start ? parseFloat(form.meter_start) : null,
      meter_stop: form.meter_stop ? parseFloat(form.meter_stop) : null,
      truck_id: form.truck_id || null,
      notes: form.notes || null,
    }).select("id").single();

    if (error) {
      setSubmitting(false);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    // 2. If from a ticket, link delivery and mark completed
    if (ticketId && delivery) {
      await supabase.from("fuel_tickets").update({
        delivery_id: delivery.id,
        status: "completed",
        completed_at: new Date().toISOString(),
      }).eq("id", ticketId);
    }

    setSubmitting(false);
    setSuccess(true);
    toast({
      title: ticketId ? "Ticket Completed & Delivery Logged" : "Delivery Logged",
      description: `${form.gallons} gal ${form.fuel_type}${form.prist ? " +Prist" : ""} — $${totalAmount}`,
    });

    setTimeout(() => {
      if (ticketId) {
        navigate("/fuelops/tickets");
      } else {
        setSuccess(false);
        setForm({ ...emptyForm });
      }
    }, 1500);
  };

  return (
    <FuelOpsLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Log Fuel Delivery</h1>
          <p className="text-muted-foreground text-sm">Record a new fuel delivery from the truck</p>
        </div>

        {/* Ticket search — find and auto-fill from active tickets */}
        {!ticketId && (
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                Fill from Service Ticket
              </Label>
              <TicketSearchInput
                disabled={!!ticketData}
                onSelectTicket={(ticket) => {
                  setTicketData(ticket);
                  // Update URL so submission links delivery to ticket
                  const params = new URLSearchParams(searchParams);
                  params.set("ticket", ticket.id);
                  navigate(`/fuelops/log?${params.toString()}`, { replace: true });
                  setForm({
                    ...emptyForm,
                    customer_id: ticket.customer_id ?? "",
                    customer_name: ticket.customers?.name ?? ticket.customer_name ?? "",
                    fuel_type: (ticket.fuel_type as "100LL" | "Jet-A") ?? "",
                    gallons: ticket.gallons_requested ? String(ticket.gallons_requested) : "",
                    aircraft_tail_number: ticket.aircraft_tail_number ?? "",
                    aircraft_type: ticket.aircraft_type ?? "",
                    prist: ticket.prist ?? false,
                    notes: ticket.notes ?? "",
                  });
                }}
              />
              <p className="text-xs text-muted-foreground">Search by customer name or tail # to auto-fill from an active ticket</p>
            </CardContent>
          </Card>
        )}

        {/* Ticket banner */}
        {ticketData && (
          <Card className="border-primary/30 border-2 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  Filling from Service Ticket
                </p>
                <p className="text-xs text-muted-foreground">
                  {ticketData.customers?.name ?? ticketData.customer_name ?? "Unknown"} —{" "}
                  {ticketData.aircraft_tail_number ?? "No tail #"} —{" "}
                  {ticketData.fuel_type}{ticketData.prist ? " + Prist" : ""}
                  {ticketData.gallons_requested ? ` — ${ticketData.gallons_requested} gal requested` : ""}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => {
                setTicketData(null);
                setForm({ ...emptyForm });
                navigate("/fuelops/log", { replace: true });
              }}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Clear
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Fuel className="w-5 h-5 text-primary" />
              Delivery Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Customer */}
              <div className={cn("space-y-2 p-3 rounded-lg -mx-3 transition-colors", !form.customer_id && !form.customer_name && "bg-destructive/10")}>
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

              {/* Aircraft Info Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className={cn("space-y-2 p-3 rounded-lg transition-colors", !form.aircraft_tail_number && "bg-destructive/10")}>
                  <Label>Aircraft Tail # *</Label>
                  <Input
                    value={form.aircraft_tail_number}
                    onChange={(e) => setForm({ ...form, aircraft_tail_number: e.target.value.toUpperCase() })}
                    placeholder="N12345"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aircraft Type</Label>
                  <AircraftTypeInput
                    value={form.aircraft_type}
                    onChange={(v) => setForm({ ...form, aircraft_type: v })}
                  />
                </div>
              </div>

              {/* Fuel Type & Prist Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className={cn("space-y-2 p-3 rounded-lg transition-colors", !form.fuel_type && "bg-destructive/10")}>
                  <Label>Fuel Type *</Label>
                  <Select value={form.fuel_type} onValueChange={(v) => setForm({ ...form, fuel_type: v as any })}>
                    <SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100LL">100LL (Avgas)</SelectItem>
                      <SelectItem value="Jet-A">Jet-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prist (Anti-Ice)</Label>
                  <div className="flex items-center gap-3 h-10 px-3 rounded-md border border-input bg-background">
                    <Switch
                      checked={form.prist}
                      onCheckedChange={(v) => setForm({ ...form, prist: v })}
                    />
                    <span className={cn("text-sm", form.prist ? "text-foreground font-medium" : "text-muted-foreground")}>
                      {form.prist ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Meter Readings */}
              <div className="space-y-2">
                <Label>Meter Readings</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Start</span>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.meter_start}
                      onChange={(e) => setForm({ ...form, meter_start: e.target.value })}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Stop</span>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.meter_stop}
                      onChange={(e) => setForm({ ...form, meter_stop: e.target.value })}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Metered Gal</span>
                    <div className="flex items-center h-10 px-3 rounded-md border border-border bg-secondary/50 text-sm tabular-nums">
                      {meterGallons ?? "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallons & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className={cn("space-y-2 p-3 rounded-lg transition-colors", !form.gallons && "bg-destructive/10")}>
                  <Label>Gallons *</Label>
                  <Input
                    type="number" step="0.1" min="0"
                    value={form.gallons}
                    onChange={(e) => setForm({ ...form, gallons: e.target.value })}
                    placeholder="0.0" required
                  />
                </div>
                <div className={cn("space-y-2 p-3 rounded-lg transition-colors", !form.price_per_gallon && "bg-destructive/10")}>
                  <Label>Price/Gallon *</Label>
                  <Input
                    type="number" step="0.01" min="0"
                    value={form.price_per_gallon}
                    onChange={(e) => setForm({ ...form, price_per_gallon: e.target.value })}
                    placeholder="0.00" required
                  />
                </div>
              </div>

              {/* Total */}
              <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <span className="text-2xl font-display font-bold text-primary">${totalAmount}</span>
                </div>
              </div>

              {/* Truck */}
              <div className="space-y-2">
                <Label>Truck</Label>
                <Select value={form.truck_id} onValueChange={(v) => setForm({ ...form, truck_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select truck" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Truck 1">Truck 1</SelectItem>
                    <SelectItem value="Truck 2">Truck 2</SelectItem>
                    <SelectItem value="Truck 3">Truck 3</SelectItem>
                    <SelectItem value="Truck 4">Truck 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={submitting || success}>
                {success ? (
                  <><Check className="w-5 h-5 mr-2" /> Logged Successfully</>
                ) : submitting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</>
                ) : ticketId ? (
                  "Complete Ticket & Log Delivery"
                ) : (
                  "Log Delivery"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </FuelOpsLayout>
  );
};

export default FuelLog;
