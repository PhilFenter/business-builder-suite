import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Check, X, Fuel, Droplets, UtensilsCrossed, Snowflake, ClipboardList, Phone, Mail, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const SERVICE_TYPES = [
  { value: "fuel", label: "Fuel", icon: Fuel },
  { value: "de_ice", label: "De-Ice", icon: Snowflake },
  { value: "lav_service", label: "Lav Service", icon: Droplets },
  { value: "catering", label: "Catering", icon: UtensilsCrossed },
  { value: "other", label: "Other", icon: ClipboardList },
] as const;

export const serviceColors: Record<string, string> = {
  fuel: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  de_ice: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  lav_service: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  catering: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  other: "bg-muted text-muted-foreground border-border",
};

export const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export { SERVICE_TYPES };

export interface FuelTicket {
  id: string;
  customer_id: string | null;
  customer_name: string | null;
  aircraft_tail_number: string | null;
  aircraft_type: string | null;
  fuel_type: string | null;
  prist: boolean;
  gallons_requested: number | null;
  notes: string | null;
  status: string;
  service_type: string;
  service_types: string[];
  created_by: string;
  assigned_driver_id: string | null;
  completed_at: string | null;
  created_at: string;
  requested_date: string | null;
  requested_time: string | null;
  pilot_phone: string | null;
  pilot_email: string | null;
  customers: { name: string } | null;
}

interface TicketCardProps {
  ticket: FuelTicket;
  isDriver: boolean;
  onUpdate: (id: string, status: string) => void;
  onComplete: (ticket: FuelTicket) => void;
  driverName?: string | null;
}

const TicketCard = ({ ticket, isDriver, onUpdate, onComplete, driverName }: TicketCardProps) => {
  const [expanded, setExpanded] = useState(ticket.status === "in_progress");
  const serviceList = ticket.service_types?.length ? ticket.service_types : [ticket.service_type];
  const customerDisplay = ticket.customers?.name ?? ticket.customer_name ?? null;
  const isFuel = serviceList.includes("fuel");

  const handleClaim = () => {
    onUpdate(ticket.id, "in_progress");
    setExpanded(true);
  };

  return (
    <Card
      className={cn(
        "border-border/50 transition-all",
        ticket.status === "pending" && "border-l-4 border-l-amber-500",
        ticket.status === "in_progress" && "border-l-4 border-l-blue-500",
      )}
    >
      <CardContent className="p-0">
        {/* Summary row — always visible, tappable */}
        <div
          className="flex items-center justify-between gap-3 p-4 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Top line: badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="outline" className={cn("text-xs", statusColors[ticket.status])}>
                {ticket.status.replace("_", " ")}
              </Badge>
              <Badge variant="outline" className={cn("text-xs", serviceColors[ticket.service_type] ?? serviceColors.other)}>
                <svc.icon className="w-3 h-3 mr-1" />
                {svc.label}
              </Badge>
              {ticket.fuel_type && (
                <Badge variant="outline" className={cn("text-xs", ticket.fuel_type === "100LL" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400")}>
                  {ticket.fuel_type}
                </Badge>
              )}
              {ticket.prist && <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400">Prist</Badge>}
            </div>

            {/* Second line: key details always visible */}
            <div className="flex items-center gap-3 text-sm flex-wrap">
              {customerDisplay && (
                <span className="font-semibold text-foreground">{customerDisplay}</span>
              )}
              {ticket.aircraft_tail_number && (
                <span className="text-muted-foreground font-mono">{ticket.aircraft_tail_number}</span>
              )}
              {ticket.aircraft_type && (
                <span className="text-muted-foreground">{ticket.aircraft_type}</span>
              )}
              {ticket.gallons_requested && (
                <span className="text-muted-foreground font-medium">{ticket.gallons_requested} gal</span>
              )}
            </div>

            {/* Driver claimed indicator */}
            {ticket.status === "in_progress" && driverName && (
              <div className="flex items-center gap-1.5 text-xs text-blue-400">
                <Truck className="w-3 h-3" />
                <span>{driverName} is on it</span>
              </div>
            )}
          </div>

          {/* Right side: action buttons + expand chevron */}
          <div className="flex items-center gap-2 shrink-0">
            {isDriver && (
              <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                {ticket.status === "pending" && (
                  <Button size="default" variant="outline" onClick={handleClaim} className="h-11 px-4 text-sm font-medium">
                    <Truck className="w-4 h-4 mr-1.5" /> Claim
                  </Button>
                )}
                {ticket.status === "in_progress" && (
                  <Button size="default" onClick={() => onComplete(ticket)} className="h-11 px-4 text-sm font-medium">
                    {isFuel ? (
                      <><Fuel className="w-4 h-4 mr-1.5" /> Fill Up</>
                    ) : (
                      <><Check className="w-4 h-4 mr-1.5" /> Done</>
                    )}
                  </Button>
                )}
                {(ticket.status === "pending" || ticket.status === "in_progress") && (
                  <Button size="icon" variant="ghost" onClick={() => onUpdate(ticket.id, "cancelled")} className="h-11 w-11">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="px-4 pb-4 pt-0 border-t border-border/50 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm pt-3">
              {customerDisplay && (
                <div>
                  <span className="text-muted-foreground text-xs block">Customer</span>
                  <span className="font-medium">{customerDisplay}</span>
                </div>
              )}
              {ticket.aircraft_tail_number && (
                <div>
                  <span className="text-muted-foreground text-xs block">Tail #</span>
                  <span className="font-medium font-mono">{ticket.aircraft_tail_number}</span>
                </div>
              )}
              {ticket.aircraft_type && (
                <div>
                  <span className="text-muted-foreground text-xs block">Aircraft</span>
                  <span className="font-medium">{ticket.aircraft_type}</span>
                </div>
              )}
              {ticket.fuel_type && (
                <div>
                  <span className="text-muted-foreground text-xs block">Fuel Type</span>
                  <span className="font-medium">{ticket.fuel_type}{ticket.prist ? " + Prist" : ""}</span>
                </div>
              )}
              {ticket.gallons_requested && (
                <div>
                  <span className="text-muted-foreground text-xs block">Gallons</span>
                  <span className="font-medium">{ticket.gallons_requested}</span>
                </div>
              )}
              {ticket.requested_date && (
                <div>
                  <span className="text-muted-foreground text-xs block">Scheduled</span>
                  <span className="font-medium">
                    {format(new Date(ticket.requested_date + "T00:00:00"), "MMM d, yyyy")}
                    {ticket.requested_time && ` @ ${ticket.requested_time.slice(0, 5)}`}
                  </span>
                </div>
              )}
            </div>

            {/* Pilot Contact — large touch targets */}
            {(ticket.pilot_phone || ticket.pilot_email) && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {ticket.pilot_phone && (
                  <>
                    <Button size="default" variant="outline" asChild className="h-10">
                      <a href={`tel:${ticket.pilot_phone}`}>
                        <Phone className="w-4 h-4 mr-1.5" /> Call
                      </a>
                    </Button>
                    <Button size="default" variant="outline" asChild className="h-10">
                      <a href={`sms:${ticket.pilot_phone}`}>
                        <MessageSquare className="w-4 h-4 mr-1.5" /> Text
                      </a>
                    </Button>
                  </>
                )}
                {ticket.pilot_email && (
                  <Button size="default" variant="outline" asChild className="h-10">
                    <a href={`mailto:${ticket.pilot_email}`}>
                      <Mail className="w-4 h-4 mr-1.5" /> Email
                    </a>
                  </Button>
                )}
                <span className="text-xs text-muted-foreground">
                  {ticket.pilot_phone}{ticket.pilot_phone && ticket.pilot_email ? " · " : ""}{ticket.pilot_email}
                </span>
              </div>
            )}

            {ticket.notes && (
              <div className="text-sm">
                <span className="text-muted-foreground text-xs block">Notes</span>
                <p className="mt-0.5">{ticket.notes}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Created {format(new Date(ticket.created_at), "MMM d, h:mm a")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketCard;
