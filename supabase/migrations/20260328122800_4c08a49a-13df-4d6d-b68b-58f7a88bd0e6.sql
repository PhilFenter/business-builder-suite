
-- Add new columns to fuel_deliveries
ALTER TABLE public.fuel_deliveries
  ADD COLUMN IF NOT EXISTS aircraft_type text,
  ADD COLUMN IF NOT EXISTS prist boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS meter_start numeric,
  ADD COLUMN IF NOT EXISTS meter_stop numeric;

-- Fuel tickets: lobby staff creates, drivers fulfill
CREATE TABLE public.fuel_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id),
  aircraft_tail_number text,
  aircraft_type text,
  fuel_type public.fuel_type NOT NULL,
  prist boolean NOT NULL DEFAULT false,
  gallons_requested numeric,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  created_by uuid NOT NULL,
  assigned_driver_id uuid,
  completed_at timestamptz,
  delivery_id uuid REFERENCES public.fuel_deliveries(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fuel_tickets ENABLE ROW LEVEL SECURITY;

-- Anyone with a fuelops role can view tickets
CREATE POLICY "FuelOps users can view tickets" ON public.fuel_tickets
  FOR SELECT USING (public.has_any_fuelops_role(auth.uid()));

-- Admin, driver, billing_clerk can create tickets
CREATE POLICY "FuelOps users can create tickets" ON public.fuel_tickets
  FOR INSERT WITH CHECK (public.has_any_fuelops_role(auth.uid()));

-- Drivers and admins can update tickets (claim, complete)
CREATE POLICY "Drivers and admins can update tickets" ON public.fuel_tickets
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'driver')
  );

-- Enable realtime for fuel_tickets
ALTER PUBLICATION supabase_realtime ADD TABLE public.fuel_tickets;

-- Pilot requests: future QR code self-service
CREATE TABLE public.pilot_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_name text NOT NULL,
  pilot_email text,
  pilot_phone text,
  aircraft_tail_number text,
  aircraft_type text,
  fuel_type public.fuel_type,
  prist boolean NOT NULL DEFAULT false,
  gallons_requested numeric,
  estimated_departure timestamptz,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','acknowledged','completed','cancelled')),
  acknowledged_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pilot_requests ENABLE ROW LEVEL SECURITY;

-- FuelOps users can view and manage pilot requests
CREATE POLICY "FuelOps users can view pilot requests" ON public.pilot_requests
  FOR SELECT USING (public.has_any_fuelops_role(auth.uid()));

CREATE POLICY "Anyone can create pilot requests" ON public.pilot_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "FuelOps users can update pilot requests" ON public.pilot_requests
  FOR UPDATE USING (public.has_any_fuelops_role(auth.uid()));

-- Updated_at triggers
CREATE TRIGGER update_fuel_tickets_updated_at
  BEFORE UPDATE ON public.fuel_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pilot_requests_updated_at
  BEFORE UPDATE ON public.pilot_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
