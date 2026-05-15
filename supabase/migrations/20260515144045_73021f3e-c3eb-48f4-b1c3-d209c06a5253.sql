-- Webhook idempotency: dedupe Stripe events by event id
CREATE TABLE IF NOT EXISTS public.webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  environment text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read webhook_events" ON public.webhook_events
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Rate limit ledger for Flaro chat (per identity / minute window)
CREATE TABLE IF NOT EXISTS public.flaro_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_flaro_rate_identity_time
  ON public.flaro_rate_limits(identity, created_at DESC);
ALTER TABLE public.flaro_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read flaro_rate_limits" ON public.flaro_rate_limits
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));