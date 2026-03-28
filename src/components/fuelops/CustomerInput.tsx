import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

interface CustomerInputProps {
  customers: Tables<"customers">[];
  selectedId: string;
  customName: string;
  onSelectAccount: (id: string) => void;
  onTypeCustom: (name: string) => void;
}

const CustomerInput = ({ customers, selectedId, customName, onSelectAccount, onTypeCustom }: CustomerInputProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const displayValue = selectedId
    ? customers.find(c => c.id === selectedId)?.name ?? ""
    : customName;

  const filtered = query
    ? customers.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : customers;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Input
        value={open ? query : displayValue}
        onChange={(e) => {
          setQuery(e.target.value);
          onTypeCustom(e.target.value);
          onSelectAccount("");
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          setQuery(displayValue);
        }}
        placeholder="Type name or select account"
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-border bg-popover shadow-md">
          {filtered.slice(0, 15).map((c) => (
            <button
              key={c.id}
              type="button"
              className={cn(
                "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                selectedId === c.id && "bg-accent/50 font-medium"
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectAccount(c.id);
                onTypeCustom("");
                setQuery(c.name);
                setOpen(false);
              }}
            >
              <span>{c.name}</span>
              {c.account_number && (
                <span className="text-muted-foreground ml-2 text-xs">({c.account_number})</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerInput;
