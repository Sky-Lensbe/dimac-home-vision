CREATE TABLE public.contact_submissions (
 id uuid PRIMARY KEY,
 created_at timestamptz NOT NULL DEFAULT now(),
 form_type text NOT NULL CHECK (form_type IN ('contact','renovation','woningscan')),
 name text NOT NULL,
 email text NOT NULL,
 payload jsonb NOT NULL,
 owner_status text NOT NULL DEFAULT 'pending',
 confirmation_status text NOT NULL DEFAULT 'pending'
);
GRANT SELECT ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read contact submissions" ON public.contact_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX contact_submissions_created_at_idx ON public.contact_submissions(created_at DESC);