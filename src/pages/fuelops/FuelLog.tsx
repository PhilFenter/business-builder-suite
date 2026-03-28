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
import { Fuel, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";
import AircraftTypeInput from "@/components/fuelops/AircraftTypeInput";

const FuelLog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Tables<"customers">[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    customer_id: "",
    fuel_type: "" as "100LL" | "Jet-A" | "",
    gallons: "",
    price_per_gallon: "",
    aircraft_tail_number: "",
    aircraft_type: "",
    prist: false,
    meter_start: "",
    meter_stop: "",
    truck_id: "",
    notes: "",
  });

  useEffect(() => {
    supabase.from("customers").select("*").eq("is_active", true).order("name").then(({ data }) => {
      if (data) setCustomers(data);
    });
  }, []);

  const meterGallons = form.meter_start && form.meter_stop
    ? Math.max(0, parseFloat(form.meter_stop) - parseFloat(form.meter_start)).toFixed(1)
    : null;

  // Auto-fill gallons from meter readings
  useEffect(() => {
    if (meterGallons && !form.gallons) {
      setForm(f => ({ ...f, gallons: meterGallons }));
    }
  }, [meterGallons]);

  const totalAmount = form.gallons && form.price_per_gallon
    ? (parseFloat(form.gallons) * parseFloat(form.price_per_gallon)).toFixed(2)
    : "0.00";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.customer_id || !form.fuel_type || !form.gallons || !form.price_per_gallon) return;

    setSubmitting(true);
    const { error } = await supabase.from("fuel_deliveries").insert({
      driver_id: user.id,
      customer_id: form.customer_id,
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
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
      toast({ title: "Delivery Logged", description: `${form.gallons} gal ${form.fuel_type}${form.prist ? " +Prist" : ""} — $${totalAmount}` });
      setTimeout(() => {
        setSuccess(false);
        setForm({ customer_id: "", fuel_type: "", gallons: "", price_per_gallon: "", aircraft_tail_number: "", aircraft_type: "", prist: false, meter_start: "", meter_stop: "", truck_id: "", notes: "" });
      }, 2000);
    }
  };

  return (
    <FuelOpsLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Log Fuel Delivery</h1>
          <p className="text-muted-foreground text-sm">Record a new fuel delivery from the truck</p>
        </div>

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
              <div className="space-y-2">
                <Label>Customer *</Label>
                <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.account_number ? `(${c.account_number})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Aircraft Info Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label>Gallons *</Label>
                  <Input
                    type="number" step="0.1" min="0"
                    value={form.gallons}
                    onChange={(e) => setForm({ ...form, gallons: e.target.value })}
                    placeholder="0.0" required
                  />
                </div>
                <div className="space-y-2">
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

              {/* Truck ID */}
              <div className="space-y-2">
                <Label>Truck ID</Label>
                <Input
                  value={form.truck_id}
                  onChange={(e) => setForm({ ...form, truck_id: e.target.value })}
                  placeholder="Truck 1"
                />
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
