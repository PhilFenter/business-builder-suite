ALTER TABLE public.fuel_tickets ADD COLUMN service_types text[] NOT NULL DEFAULT '{fuel}';

UPDATE public.fuel_tickets SET service_types = ARRAY[service_type];