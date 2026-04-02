
CREATE TABLE public.fuel_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fuel_type text NOT NULL,
  price_per_gallon numeric NOT NULL,
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  set_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (fuel_type, effective_date)
);

ALTER TABLE public.fuel_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FuelOps users can view fuel prices"
  ON public.fuel_prices FOR SELECT TO authenticated
  USING (has_any_fuelops_role(auth.uid()));

CREATE POLICY "Admins can manage fuel prices"
  ON public.fuel_prices FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update fuel prices"
  ON public.fuel_prices FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
