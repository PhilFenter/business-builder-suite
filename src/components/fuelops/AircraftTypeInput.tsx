import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const COMMON_AIRCRAFT = [
  "C172", "C182", "C206", "C210", "C310", "C340", "C414", "C421",
  "PA-28", "PA-32", "PA-34", "PA-46",
  "BE35", "BE36", "BE58", "BE200", "BE350",
  "SR20", "SR22", "SF50",
  "DA40", "DA42", "DA62",
  "TBM 850", "TBM 900", "TBM 960",
  "PC-12", "PC-24",
  "Citation CJ2", "Citation CJ3", "Citation CJ4", "Citation Mustang", "Citation XLS",
  "Phenom 100", "Phenom 300",
  "King Air 90", "King Air 200", "King Air 350",
  "Learjet 45", "Learjet 75",
  "R22", "R44", "R66", "Bell 206", "Bell 407", "EC130", "AS350",
];

interface AircraftTypeInputProps {
  value: string;
  onChange: (value: string) => void;
}

const AircraftTypeInput = ({ value, onChange }: AircraftTypeInputProps) => {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState(COMMON_AIRCRAFT);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = value.toLowerCase();
    setFiltered(q ? COMMON_AIRCRAFT.filter(a => a.toLowerCase().includes(q)) : COMMON_AIRCRAFT);
  }, [value]);

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
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        onFocus={() => setOpen(true)}
        placeholder="C172, Citation CJ3..."
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-border bg-popover shadow-md">
          {filtered.slice(0, 15).map((aircraft) => (
            <button
              key={aircraft}
              type="button"
              className={cn(
                "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                value === aircraft && "bg-accent/50 font-medium"
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(aircraft);
                setOpen(false);
              }}
            >
              {aircraft}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AircraftTypeInput;
