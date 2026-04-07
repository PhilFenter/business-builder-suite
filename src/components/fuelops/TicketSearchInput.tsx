import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface TicketResult {
  id: string;
  customer_name: string | null;
  customer_id: string | null;
  aircraft_tail_number: string | null;
  aircraft_type: string | null;
  fuel_type: string | null;
  prist: boolean;
  gallons_requested: number | null;
  notes: string | null;
  service_types: string[];
  status: string;
  requested_date: string | null;
  requested_time: string | null;
  pilot_phone: string | null;
  pilot_email: string | null;
  customers: { name: string } | null;
}

interface TicketSearchInputProps {
  onSelectTicket: (ticket: TicketResult) => void;
  disabled?: boolean;
}

const TicketSearchInput = ({ onSelectTicket, disabled }: TicketSearchInputProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TicketResult[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const pattern = `%${q}%`;

    // Search active tickets by customer name (from join or inline), tail number
    const { data } = await supabase
      .from("fuel_tickets")
      .select("*, customers(name)")
      .in("status", ["pending", "in_progress", "claimed"])
      .or(`customer_name.ilike.${pattern},aircraft_tail_number.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(10);

    // Also search by joined customer name
    const { data: byAccount } = await supabase
      .from("fuel_tickets")
      .select("*, customers!inner(name)")
      .in("status", ["pending", "in_progress", "claimed"])
      .ilike("customers.name", pattern)
      .order("created_at", { ascending: false })
      .limit(10);

    // Merge and dedupe
    const merged = new Map<string, TicketResult>();
    [...(data ?? []), ...(byAccount ?? [])].forEach((t: any) => {
      if (!merged.has(t.id)) merged.set(t.id, t);
    });

    setResults(Array.from(merged.values()));
    setLoading(false);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (!open) setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  const displayName = (t: TicketResult) =>
    t.customers?.name ?? t.customer_name ?? "Unknown";

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (query.length >= 2) setOpen(true); }}
          placeholder="Search tickets by name or tail #..."
          className="pl-9"
          disabled={disabled}
          autoComplete="off"
        />
      </div>
      {open && query.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
          {loading && (
            <div className="px-3 py-3 text-sm text-muted-foreground text-center">Searching...</div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-3 py-3 text-sm text-muted-foreground text-center">No active tickets found</div>
          )}
          {!loading && results.map((t) => (
            <button
              key={t.id}
              type="button"
              className="w-full text-left px-3 py-2.5 hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border/30 last:border-0"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectTicket(t);
                setQuery("");
                setOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium truncate">{displayName(t)}</span>
                {t.aircraft_tail_number && (
                  <span className="text-xs text-muted-foreground">{t.aircraft_tail_number}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1 ml-6">
                {t.fuel_type && <Badge variant="outline" className="text-xs px-1.5 py-0">{t.fuel_type}</Badge>}
                {t.prist && <Badge variant="outline" className="text-xs px-1.5 py-0">Prist</Badge>}
                {t.gallons_requested && (
                  <span className="text-xs text-muted-foreground">{t.gallons_requested} gal</span>
                )}
                <Badge variant="secondary" className="text-xs px-1.5 py-0 ml-auto">{t.status}</Badge>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketSearchInput;
