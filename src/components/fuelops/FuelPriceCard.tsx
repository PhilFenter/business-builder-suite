import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Fuel, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface FuelPrice {
  fuel_type: string;
  price_per_gallon: number;
  effective_date: string;
}

const FuelPriceCard = () => {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const [prices, setPrices] = useState<Record<string, FuelPrice>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const today = format(new Date(), "yyyy-MM-dd");

  const fetchPrices = async () => {
    const { data } = await supabase
      .from("fuel_prices")
      .select("fuel_type, price_per_gallon, effective_date")
      .eq("effective_date", today);

    const map: Record<string, FuelPrice> = {};
    (data ?? []).forEach((p: any) => {
      map[p.fuel_type] = p;
    });
    setPrices(map);
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleSave = async (fuelType: string) => {
    const price = parseFloat(editValue);
    if (isNaN(price) || price <= 0) {
      toast.error("Enter a valid price");
      return;
    }

    const existing = prices[fuelType];
    if (existing) {
      const { error } = await supabase
        .from("fuel_prices")
        .update({ price_per_gallon: price })
        .eq("fuel_type", fuelType)
        .eq("effective_date", today);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase
        .from("fuel_prices")
        .insert({ fuel_type: fuelType, price_per_gallon: price, set_by: user!.id, effective_date: today });
      if (error) { toast.error(error.message); return; }
    }

    toast.success(`${fuelType} price updated`);
    setEditing(null);
    fetchPrices();
  };

  const fuelTypes = [
    { key: "100LL", label: "100LL (Avgas)", color: "text-blue-500" },
    { key: "Jet-A", label: "Jet-A", color: "text-amber-500" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {fuelTypes.map(({ key, label, color }) => {
        const current = prices[key];
        const isEditing = editing === key;

        return (
          <Card key={key} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Fuel className={`w-4 h-4 ${color}`} />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
              </div>

              {isEditing ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-9 w-24 text-lg font-display font-bold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave(key);
                      if (e.key === "Escape") setEditing(null);
                    }}
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleSave(key)}>
                    <Check className="w-4 h-4 text-green-500" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-display font-bold">
                      {current ? `$${Number(current.price_per_gallon).toFixed(2)}` : "—"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">/gal</span>
                  </div>
                  {isAdmin && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditValue(current ? String(current.price_per_gallon) : "");
                        setEditing(key);
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              )}

              <p className="text-[10px] text-muted-foreground mt-1">
                {current ? `Set for ${format(new Date(current.effective_date + "T00:00:00"), "MMM d, yyyy")}` : "Not set today"}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FuelPriceCard;
