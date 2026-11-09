-- LOCAL DRAFT ONLY. Not a migration, not applied. Requires explicit shared-backend approval.
-- No historical reports are updated or automatically queued.
CREATE TABLE public.quickscan_email_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.quickscan_reports(id) ON DELETE CASCADE,
  generation integer NOT NULL DEFAULT 0 CHECK (generation >= 0),
  recipient text NOT NULL,
  synthetic boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','accepted','delivered','failed','retry_scheduled')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  lease_token uuid,
  lease_until timestamptz,
  provider_id text,
  last_error_code text,
  needs_review boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (report_id, generation)
);
GRANT SELECT ON public.quickscan_email_outbox TO authenticated;
GRANT ALL ON public.quickscan_email_outbox TO service_role;
ALTER TABLE public.quickscan_email_outbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read delivery jobs" ON public.quickscan_email_outbox FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.quickscan_email_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outbox_id uuid NOT NULL REFERENCES public.quickscan_email_outbox(id) ON DELETE CASCADE,
  attempt integer NOT NULL,
  status text NOT NULL,
  provider_event_id text UNIQUE,
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quickscan_email_attempts TO authenticated;
GRANT ALL ON public.quickscan_email_attempts TO service_role;
ALTER TABLE public.quickscan_email_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read delivery attempts" ON public.quickscan_email_attempts FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX quickscan_email_due ON public.quickscan_email_outbox(next_attempt_at)
WHERE status IN ('pending','retry_scheduled');

CREATE FUNCTION public.quickscan_claim_email() RETURNS SETOF public.quickscan_email_outbox
LANGUAGE sql SECURITY INVOKER SET search_path = public AS $$
  UPDATE public.quickscan_email_outbox SET status='sending', attempts=attempts+1,
    lease_token=gen_random_uuid(), lease_until=now()+interval '5 minutes', updated_at=now()
  WHERE id IN (
    SELECT id FROM public.quickscan_email_outbox
    WHERE status IN ('pending','retry_scheduled') AND next_attempt_at<=now()
      AND attempts<5 AND NOT needs_review
    ORDER BY next_attempt_at FOR UPDATE SKIP LOCKED LIMIT 1
  ) RETURNING *;
$$;
REVOKE ALL ON FUNCTION public.quickscan_claim_email() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.quickscan_claim_email() TO service_role;

-- Still required before this draft can become a deployable migration:
-- atomic snapshot-recipient enqueue inside registration; complete submission fingerprint collision checks;
-- lease-bound finish RPC + audit transaction; signed webhook deduplication + suppression;
-- ambiguous/expired lease reconciliation (never automatic requeue after unknown acceptance);
-- authenticated bounded admin resend; visitor status capability hashed server-side;
-- atomic existing five-per-hour rate limit. No scheduled worker or provider call is created here.