import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Check, X, Fuel, Droplets, UtensilsCrossed, Snowflake, ClipboardList, Phone, Mail, MessageSquare, ChevronDown, ChevronUp, Pencil, Save, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import AircraftTypeInput from "@/components/fuelops/AircraftTypeInput";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  onEdit?: (id: string, updates: Partial<FuelTicket>) => Promise<void>;
  driverName?: string | null;
}

const TicketCard = ({ ticket, isDriver, onUpdate, onComplete, onEdit, driverName }: TicketCardProps) => {
  const [expanded, setExpanded] = useState(ticket.status === "in_progress");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    customer_name: ticket.customer_name ?? "",
    aircraft_tail_number: ticket.aircraft_tail_number ?? "",
    aircraft_type: ticket.aircraft_type ?? "",
    fuel_type: ticket.fuel_type ?? "",
    prist: ticket.prist,
    gallons_requested: ticket.gallons_requested?.toString() ?? "",
    requested_date: ticket.requested_date ? new Date(ticket.requested_date + "T00:00:00") : undefined as Date | undefined,
    requested_time: ticket.requested_time?.slice(0, 5) ?? "",
    pilot_phone: ticket.pilot_phone ?? "",
    pilot_email: ticket.pilot_email ?? "",
    notes: ticket.notes ?? "",
  });

  const serviceList = ticket.service_types?.length ? ticket.service_types : [ticket.service_type];
  const customerDisplay = ticket.customers?.name ?? ticket.customer_name ?? null;
  const isFuel = serviceList.includes("fuel");
  const isEditable = ticket.status === "pending" || ticket.status === "in_progress";

  const handleClaim = () => {
    onUpdate(ticket.id, "in_progress");
    setExpanded(true);
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    setExpanded(true);
    // Reset form to current ticket values
    setEditForm({
      customer_name: ticket.customer_name ?? "",
      aircraft_tail_number: ticket.aircraft_tail_number ?? "",
      aircraft_type: ticket.aircraft_type ?? "",
      fuel_type: ticket.fuel_type ?? "",
      prist: ticket.prist,
      gallons_requested: ticket.gallons_requested?.toString() ?? "",
      requested_date: ticket.requested_date ? new Date(ticket.requested_date + "T00:00:00") : undefined,
      requested_time: ticket.requested_time?.slice(0, 5) ?? "",
      pilot_phone: ticket.pilot_phone ?? "",
      pilot_email: ticket.pilot_email ?? "",
      notes: ticket.notes ?? "",
    });
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onEdit) return;
    setSaving(true);
    await onEdit(ticket.id, {
      customer_name: editForm.customer_name || null,
      aircraft_tail_number: editForm.aircraft_tail_number || null,
      aircraft_type: editForm.aircraft_type || null,
      fuel_type: editForm.fuel_type || null,
      prist: editForm.prist,
      gallons_requested: editForm.gallons_requested ? parseFloat(editForm.gallons_requested) : null,
      requested_date: editForm.requested_date ? format(editForm.requested_date, "yyyy-MM-dd") : null,
      requested_time: editForm.requested_time || null,
      pilot_phone: editForm.pilot_phone || null,
      pilot_email: editForm.pilot_email || null,
      notes: editForm.notes || null,
    } as any);
    setSaving(false);
    setEditing(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(false);
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
          onClick={() => !editing && setExpanded(!expanded)}
        >
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="outline" className={cn("text-xs", statusColors[ticket.status])}>
                {ticket.status.replace("_", " ")}
              </Badge>
              {serviceList.map((st) => {
                const svc = SERVICE_TYPES.find(s => s.value === st) ?? SERVICE_TYPES[4];
                return (
                  <Badge key={st} variant="outline" className={cn("text-xs", serviceColors[st] ?? serviceColors.other)}>
                    <svc.icon className="w-3 h-3 mr-1" />
                    {svc.label}
                  </Badge>
                );
              })}
              {ticket.fuel_type && (
                <Badge variant="outline" className={cn("text-xs", ticket.fuel_type === "100LL" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400")}>
                  {ticket.fuel_type}
                </Badge>
              )}
              {ticket.prist && <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400">Prist</Badge>}
            </div>

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

            {ticket.status === "in_progress" && driverName && (
              <div className="flex items-center gap-1.5 text-xs text-blue-400">
                <Truck className="w-3 h-3" />
                <span>{driverName} is on it</span>
              </div>
            )}
          </div>

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
                {isEditable && onEdit && !editing && (
                  <Button size="icon" variant="ghost" onClick={handleStartEdit} className="h-11 w-11">
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
                {isEditable && (
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

        {/* Expanded details or edit form */}
        {expanded && (
          <div className="px-4 pb-4 pt-0 border-t border-border/50 space-y-3">
            {editing ? (
              <div className="space-y-3 pt-3" onClick={(e) => e.stopPropagation()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Customer / Pilot Name</Label>
                    <Input
                      value={editForm.customer_name}
                      onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tail #</Label>
                    <Input
                      value={editForm.aircraft_tail_number}
                      onChange={(e) => setEditForm({ ...editForm, aircraft_tail_number: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Aircraft Type</Label>
                    <AircraftTypeInput
                      value={editForm.aircraft_type}
                      onChange={(v) => setEditForm({ ...editForm, aircraft_type: v })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">ETA / Departure Time</Label>
                    <Input
                      type="time"
                      value={editForm.requested_time}
                      onChange={(e) => setEditForm({ ...editForm, requested_time: e.target.value })}
                    />
                  </div>
                </div>

                {isFuel && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Fuel Type</Label>
                      <Select value={editForm.fuel_type} onValueChange={(v) => setEditForm({ ...editForm, fuel_type: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Jet-A">Jet-A</SelectItem>
                          <SelectItem value="100LL">100LL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Gallons</Label>
                      <Input
                        type="number"
                        value={editForm.gallons_requested}
                        onChange={(e) => setEditForm({ ...editForm, gallons_requested: e.target.value })}
                      />
                    </div>
                    <div className="flex items-end gap-2 pb-1">
                      <Switch
                        checked={editForm.prist}
                        onCheckedChange={(v) => setEditForm({ ...editForm, prist: v })}
                      />
                      <Label className="text-xs">Prist</Label>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Pilot Phone</Label>
                    <Input
                      type="tel"
                      value={editForm.pilot_phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                        let formatted = digits;
                        if (digits.length > 6) formatted = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
                        else if (digits.length > 3) formatted = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
                        else if (digits.length > 0) formatted = `(${digits}`;
                        setEditForm({ ...editForm, pilot_phone: formatted });
                      }}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Pilot Email</Label>
                    <Input
                      type="email"
                      value={editForm.pilot_email}
                      onChange={(e) => setEditForm({ ...editForm, pilot_email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Notes</Label>
                  <Textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    <Save className="w-3.5 h-3.5 mr-1" /> {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketCard;
