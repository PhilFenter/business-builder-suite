import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import FuelOpsLayout from "@/components/fuelops/FuelOpsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, DollarSign, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type InvoiceWithCustomer = Tables<"invoices"> & { customers: { name: string } | null };

const statusConfig = {
  draft: { label: "Draft", icon: FileText, color: "text-muted-foreground bg-muted/50" },
  sent: { label: "Sent", icon: Clock, color: "text-accent bg-accent/10" },
  paid: { label: "Paid", icon: CheckCircle, color: "text-green-400 bg-green-400/10" },
  overdue: { label: "Overdue", icon: AlertTriangle, color: "text-destructive bg-destructive/10" },
};

const Billing = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<InvoiceWithCustomer[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const [summaryStats, setSummaryStats] = useState({ outstanding: 0, paid: 0, overdue: 0 });

  const fetchInvoices = async () => {
    let query = supabase.from("invoices").select("*, customers(name)").order("created_at", { ascending: false });
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter as "draft" | "sent" | "paid" | "overdue");
    }
    const { data } = await query;
    if (data) {
      setInvoices(data as InvoiceWithCustomer[]);

      // Calculate stats from all invoices (unfiltered)
      const allRes = await supabase.from("invoices").select("status, total_amount");
      if (allRes.data) {
        setSummaryStats({
          outstanding: allRes.data.filter(i => i.status === "sent").reduce((s, i) => s + Number(i.total_amount), 0),
          paid: allRes.data.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.total_amount), 0),
          overdue: allRes.data.filter(i => i.status === "overdue").reduce((s, i) => s + Number(i.total_amount), 0),
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchInvoices(); }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === "paid") updates.paid_at = new Date().toISOString();
    const { error } = await supabase.from("invoices").update(updates).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Invoice Updated" });
      fetchInvoices();
    }
  };

  const summaryCards = [
    { label: "Outstanding", value: summaryStats.outstanding, icon: Clock, color: "text-accent" },
    { label: "Paid", value: summaryStats.paid, icon: CheckCircle, color: "text-green-400" },
    { label: "Overdue", value: summaryStats.overdue, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <FuelOpsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Billing & Invoices</h1>
          <p className="text-muted-foreground text-sm">Manage invoices and track payments</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summaryCards.map((s) => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
                  <p className="text-xl font-display font-bold mt-1">
                    ${s.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={cn("p-2 rounded-lg bg-secondary", s.color)}>
                  <s.icon className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Invoices List */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : invoices.length === 0 ? (
              <p className="text-muted-foreground text-sm">No invoices found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">Invoice #</th>
                      <th className="text-left py-2 font-medium">Customer</th>
                      <th className="text-left py-2 font-medium">Period</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                      <th className="text-left py-2 font-medium">Status</th>
                      <th className="text-left py-2 font-medium">Due</th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => {
                      const config = statusConfig[inv.status];
                      return (
                        <tr key={inv.id} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="py-2.5 font-mono text-xs">{inv.invoice_number}</td>
                          <td className="py-2.5">{inv.customers?.name ?? "—"}</td>
                          <td className="py-2.5 text-muted-foreground text-xs">
                            {format(new Date(inv.period_start), "MMM d")} – {format(new Date(inv.period_end), "MMM d, yyyy")}
                          </td>
                          <td className="py-2.5 text-right tabular-nums font-medium">${Number(inv.total_amount).toFixed(2)}</td>
                          <td className="py-2.5">
                            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", config.color)}>
                              <config.icon className="w-3 h-3" />
                              {config.label}
                            </span>
                          </td>
                          <td className="py-2.5 text-muted-foreground text-xs">{format(new Date(inv.due_date), "MMM d, yyyy")}</td>
                          <td className="py-2.5 text-right">
                            {inv.status === "draft" && (
                              <Button size="sm" variant="ghost" onClick={() => updateStatus(inv.id, "sent")}>Mark Sent</Button>
                            )}
                            {inv.status === "sent" && (
                              <Button size="sm" variant="ghost" className="text-green-400" onClick={() => updateStatus(inv.id, "paid")}>Mark Paid</Button>
                            )}
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
      </div>
    </FuelOpsLayout>
  );
};

export default Billing;
