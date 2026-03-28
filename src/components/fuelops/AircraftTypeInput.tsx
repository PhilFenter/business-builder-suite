import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const COMMON_AIRCRAFT = [
  // Cessna piston & turboprop
  "C172", "C182", "C206", "C210", "C310", "C340", "C414", "C421",
  // Cessna Citation jets
  "Citation Mustang", "Citation M2", "Citation CJ2", "Citation CJ3", "Citation CJ4",
  "Citation XLS", "Citation XLS+", "Citation Sovereign", "Citation X", "Citation Latitude",
  "Citation Longitude",
  // Piper
  "PA-28", "PA-32", "PA-34", "PA-46",
  // Beechcraft
  "BE35", "BE36", "BE58", "BE200", "BE350",
  "King Air 90", "King Air 200", "King Air 250", "King Air 350",
  // Cirrus
  "SR20", "SR22", "SF50",
  // Diamond
  "DA40", "DA42", "DA62",
  // Daher
  "TBM 850", "TBM 900", "TBM 910", "TBM 930", "TBM 960",
  // Pilatus
  "PC-12", "PC-24",
  // Embraer
  "Phenom 100", "Phenom 300", "Praetor 500", "Praetor 600",
  // Learjet
  "Learjet 45", "Learjet 60", "Learjet 75",
  // Gulfstream
  "G100", "G150", "G200", "G280",
  "G-IV", "G-IVSP", "G400", "G450",
  "G-V", "G500", "G550", "G600", "G650", "G650ER", "G700", "G800",
  // Bombardier Global Express
  "Global 5000", "Global 5500", "Global 6000", "Global 6500",
  "Global 7500", "Global 8000",
  "Challenger 300", "Challenger 350", "Challenger 604", "Challenger 605", "Challenger 650",
  // Hawker
  "Hawker 400XP", "Hawker 750", "Hawker 800XP", "Hawker 850XP",
  "Hawker 900XP", "Hawker 4000",
  // Dassault Falcon
  "Falcon 50", "Falcon 900", "Falcon 900EX", "Falcon 900LX",
  "Falcon 2000", "Falcon 2000EX", "Falcon 2000LXS",
  "Falcon 7X", "Falcon 8X", "Falcon 6X", "Falcon 10X",
  // Helicopters
  "R22", "R44", "R66", "Bell 206", "Bell 407", "Bell 412", "Bell 429",
  "EC130", "EC135", "EC145", "AS350", "H125", "H130", "H145", "H160",
  "S-76", "AW109", "AW139",
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
