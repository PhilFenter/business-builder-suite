
-- Add service types and transient customer support to fuel_tickets
ALTER TABLE public.fuel_tickets
  ADD COLUMN IF NOT EXISTS service_type text NOT NULL DEFAULT 'fuel',
  ADD COLUMN IF NOT EXISTS customer_name text,
  ALTER COLUMN fuel_type DROP NOT NULL;

-- Add constraint for service types
ALTER TABLE public.fuel_tickets
  DROP CONSTRAINT IF EXISTS fuel_tickets_service_type_check;
ALTER TABLE public.fuel_tickets
  ADD CONSTRAINT fuel_tickets_service_type_check
  CHECK (service_type IN ('fuel', 'de_ice', 'lav_service', 'catering', 'other'));

-- Also add customer_name to fuel_deliveries for transient customers
ALTER TABLE public.fuel_deliveries
  ADD COLUMN IF NOT EXISTS customer_name text;
