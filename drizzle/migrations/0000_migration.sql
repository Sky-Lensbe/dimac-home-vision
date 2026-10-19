CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Testmodus: alleen dit expliciet toegestane account krijgt beheerdersrechten.
CREATE OR REPLACE FUNCTION public.quickscan_admin_allowed(_email text)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT lower(coalesce(_email, '')) = ANY (ARRAY['info@sky-lens.be'])
$$;

CREATE OR REPLACE FUNCTION public.handle_quickscan_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND public.quickscan_admin_allowed(NEW.email) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_quickscan_admin
AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_quickscan_admin();

CREATE TABLE public.quickscan_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  municipality text NOT NULL,
  postal_code text,
  situation text,
  property_type text,
  construction_period text,
  decision_timing text,
  status text NOT NULL DEFAULT 'nieuw',
  marketing_consent boolean NOT NULL DEFAULT false,
  consent_version text,
  consent_timestamp timestamptz,
  notes text
);
GRANT SELECT, UPDATE, DELETE ON public.quickscan_leads TO authenticated;
GRANT ALL ON public.quickscan_leads TO service_role;
ALTER TABLE public.quickscan_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read leads" ON public.quickscan_leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update leads" ON public.quickscan_leads FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete leads" ON public.quickscan_leads FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.quickscan_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.quickscan_leads(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  answer_value jsonb NOT NULL,
  question_version text NOT NULL
);
GRANT SELECT ON public.quickscan_responses TO authenticated;
GRANT ALL ON public.quickscan_responses TO service_role;
ALTER TABLE public.quickscan_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read responses" ON public.quickscan_responses FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.quickscan_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.quickscan_leads(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  report_number text NOT NULL UNIQUE,
  rule_version text NOT NULL,
  barometer_score_internal numeric,
  barometer_category text NOT NULL,
  information_coverage text NOT NULL,
  domain_scores jsonb NOT NULL,
  safety_flags jsonb NOT NULL,
  attention_points jsonb NOT NULL,
  unknown_information jsonb NOT NULL,
  combination_advice jsonb NOT NULL,
  recommended_package text,
  drone_recommendation boolean NOT NULL DEFAULT false,
  report_snapshot jsonb NOT NULL,
  report_version text NOT NULL,
  delivery_status text NOT NULL DEFAULT 'aangemaakt'
);
GRANT SELECT, UPDATE ON public.quickscan_reports TO authenticated;
GRANT ALL ON public.quickscan_reports TO service_role;
ALTER TABLE public.quickscan_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read reports" ON public.quickscan_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.quickscan_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  lead_id uuid REFERENCES public.quickscan_leads(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  detail text
);
GRANT SELECT, INSERT ON public.quickscan_events TO authenticated;
GRANT ALL ON public.quickscan_events TO service_role;
ALTER TABLE public.quickscan_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read events" ON public.quickscan_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins add events" ON public.quickscan_events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.quickscan_rate_limits (
  ip_hash text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_hash, window_start)
);
GRANT ALL ON public.quickscan_rate_limits TO service_role;
ALTER TABLE public.quickscan_rate_limits ENABLE ROW LEVEL SECURITY;