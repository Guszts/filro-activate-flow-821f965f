-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_kind') THEN
    CREATE TYPE public.ticket_kind AS ENUM ('question', 'change_request', 'bug', 'cancellation', 'other');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_priority') THEN
    CREATE TYPE public.ticket_priority AS ENUM ('low', 'normal', 'high', 'urgent');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN
    CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'waiting_client', 'resolved', 'closed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'extra_charge_status') THEN
    CREATE TYPE public.extra_charge_status AS ENUM ('draft', 'sent', 'paid', 'cancelled', 'refunded');
  END IF;
END$$;

-- Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  initial_message TEXT NOT NULL,
  kind public.ticket_kind NOT NULL DEFAULT 'question',
  priority public.ticket_priority NOT NULL DEFAULT 'normal',
  status public.ticket_status NOT NULL DEFAULT 'open',
  last_admin_reply_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage tickets"
ON public.support_tickets FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view own tickets"
ON public.support_tickets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users create own tickets"
ON public.support_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own open tickets"
ON public.support_tickets FOR UPDATE
USING (auth.uid() = user_id AND status NOT IN ('closed','resolved'));

DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Messages
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('client','admin')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON public.support_messages(ticket_id, created_at);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage messages"
ON public.support_messages FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view own ticket messages"
ON public.support_messages FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = support_messages.ticket_id AND t.user_id = auth.uid())
);

CREATE POLICY "Users post on own tickets"
ON public.support_messages FOR INSERT
WITH CHECK (
  author_id = auth.uid()
  AND author_role = 'client'
  AND EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = support_messages.ticket_id
      AND t.user_id = auth.uid()
      AND t.status NOT IN ('closed')
  )
);

-- Extra charges (upsell)
CREATE TABLE IF NOT EXISTS public.extra_charges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'brl',
  status public.extra_charge_status NOT NULL DEFAULT 'draft',
  environment TEXT NOT NULL DEFAULT 'sandbox',
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  payment_link TEXT,
  paid_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_extra_charges_user ON public.extra_charges(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_extra_charges_status ON public.extra_charges(status);

ALTER TABLE public.extra_charges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage extra charges"
ON public.extra_charges FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view own extra charges"
ON public.extra_charges FOR SELECT
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_extra_charges_updated_at ON public.extra_charges;
CREATE TRIGGER trg_extra_charges_updated_at
BEFORE UPDATE ON public.extra_charges
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();