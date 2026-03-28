import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import FuelOpsLayout from "@/components/fuelops/FuelOpsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

const Customers = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Tables<"customers">[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "", account_number: "", discount_percent: "0", billing_cycle: "per_delivery" as "per_delivery" | "monthly",
    contact_email: "", contact_phone: "", address: "", notes: "",
  });

  const fetchCustomers = async () => {
    const { data } = await supabase.from("customers").select("*").order("name");
    if (data) setCustomers(data);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("customers").insert({
      name: form.name,
      account_number: form.account_number || null,
      discount_percent: parseFloat(form.discount_percent),
      billing_cycle: form.billing_cycle,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
      address: form.address || null,
      notes: form.notes || null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Customer Created", description: `${form.name} added successfully` });
      setDialogOpen(false);
      setForm({ name: "", account_number: "", discount_percent: "0", billing_cycle: "per_delivery", contact_email: "", contact_phone: "", address: "", notes: "" });
      fetchCustomers();
    }
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.account_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <FuelOpsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Customers</h1>
            <p className="text-muted-foreground text-sm">Manage fuel customer accounts</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Add Customer</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">New Customer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Account #</Label>
                    <Input value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Discount %</Label>
                    <Input type="number" min="0" max="100" step="0.5" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Billing Cycle</Label>
                    <Select value={form.billing_cycle} onValueChange={(v) => setForm({ ...form, billing_cycle: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_delivery">Per Delivery</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <Button type="submit" className="w-full">Create Customer</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="pl-9"
          />
        </div>

        {/* Customer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p className="text-muted-foreground text-sm col-span-full">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm col-span-full">No customers found.</p>
          ) : (
            filtered.map((c) => (
              <Card key={c.id} className={cn("border-border/50", !c.is_active && "opacity-50")}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-semibold">{c.name}</h3>
                      {c.account_number && <p className="text-xs text-muted-foreground">#{c.account_number}</p>}
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      c.billing_cycle === "monthly" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                    )}>
                      {c.billing_cycle === "monthly" ? "Monthly" : "Per Delivery"}
                    </span>
                  </div>
                  {c.discount_percent > 0 && (
                    <p className="text-sm text-green-400">{c.discount_percent}% discount</p>
                  )}
                  {c.contact_email && <p className="text-xs text-muted-foreground">{c.contact_email}</p>}
                  {c.contact_phone && <p className="text-xs text-muted-foreground">{c.contact_phone}</p>}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </FuelOpsLayout>
  );
};

export default Customers;
