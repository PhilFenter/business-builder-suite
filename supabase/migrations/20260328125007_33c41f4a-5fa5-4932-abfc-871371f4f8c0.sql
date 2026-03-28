
ALTER TABLE public.fuel_tickets
  ADD COLUMN IF NOT EXISTS requested_time time;
