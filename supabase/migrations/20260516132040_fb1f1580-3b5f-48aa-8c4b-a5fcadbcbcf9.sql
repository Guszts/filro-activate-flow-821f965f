-- ===========================================================
-- Programa de Parceiro Comercial (B2B Privado)
-- ===========================================================

-- 1. PARTNERS
CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  whatsapp text,
  code text NOT NULL UNIQUE,
  pix_key text,
  commission_rate numeric(5,2) NOT NULL DEFAULT 50.00,
  commission_scope text NOT NULL DEFAULT 'activation_only',
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT partners_status_chk CHECK (status IN ('active','paused','blocked')),
  CONSTRAINT partners_scope_chk CHECK (commission_scope IN ('activation_only'))
);
CREATE INDEX IF NOT EXISTS idx_partners_code ON public.partners(code);
CREATE INDEX IF NOT EXISTS idx_partners_status ON public.partners(status);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage partners" ON public.partners;
CREATE POLICY "Admins manage partners" ON public.partners
  FOR ALL USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_partners_updated_at ON public.partners;
CREATE TRIGGER trg_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. PARTNER REFERRALS
CREATE TABLE IF NOT EXISTS public.partner_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE RESTRICT,
  user_id uuid,
  plan_id uuid,
  client_name text,
  client_email text,
  client_whatsapp text,
  partner_code text,
  stripe_checkout_session_id text UNIQUE,
  stripe_customer_id text,
  status text NOT NULL DEFAULT 'started',
  source_url text,
  landing_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  converted_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  CONSTRAINT partner_referrals_status_chk CHECK (status IN ('started','checkout_created','paid','cancelled','refunded'))
);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_partner ON public.partner_referrals(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_user ON public.partner_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_plan ON public.partner_referrals(plan_id);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_session ON public.partner_referrals(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_status ON public.partner_referrals(status);

ALTER TABLE public.partner_referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage referrals" ON public.partner_referrals;
CREATE POLICY "Admins manage referrals" ON public.partner_referrals
  FOR ALL USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 3. PARTNER COMMISSIONS
CREATE TABLE IF NOT EXISTS public.partner_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE RESTRICT,
  referral_id uuid REFERENCES public.partner_referrals(id) ON DELETE SET NULL,
  user_id uuid,
  plan_id uuid,
  payment_id uuid,
  stripe_checkout_session_id text UNIQUE,
  activation_amount integer NOT NULL DEFAULT 0,
  monthly_amount integer NOT NULL DEFAULT 0,
  base_amount integer NOT NULL DEFAULT 0,
  commission_rate numeric(5,2) NOT NULL DEFAULT 50.00,
  commission_amount integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  available_at timestamptz,
  approved_at timestamptz,
  paid_at timestamptz,
  cancelled_at timestamptz,
  payout_id uuid,
  cancellation_reason text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT partner_commissions_status_chk CHECK (status IN ('pending','approved','paid','cancelled'))
);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_partner ON public.partner_commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_referral ON public.partner_commissions(referral_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_payment ON public.partner_commissions(payment_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_status ON public.partner_commissions(status);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_available ON public.partner_commissions(available_at);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_session ON public.partner_commissions(stripe_checkout_session_id);

ALTER TABLE public.partner_commissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage commissions" ON public.partner_commissions;
CREATE POLICY "Admins manage commissions" ON public.partner_commissions
  FOR ALL USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_partner_commissions_updated_at ON public.partner_commissions;
CREATE TRIGGER trg_partner_commissions_updated_at
  BEFORE UPDATE ON public.partner_commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. PARTNER PAYOUTS
CREATE TABLE IF NOT EXISTS public.partner_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE RESTRICT,
  amount integer NOT NULL,
  method text NOT NULL DEFAULT 'pix',
  pix_key text,
  status text NOT NULL DEFAULT 'paid',
  paid_at timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT partner_payouts_method_chk CHECK (method IN ('pix','bank_transfer','cash','other')),
  CONSTRAINT partner_payouts_status_chk CHECK (status IN ('pending','paid','failed','cancelled'))
);
CREATE INDEX IF NOT EXISTS idx_partner_payouts_partner ON public.partner_payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_payouts_status ON public.partner_payouts(status);

ALTER TABLE public.partner_payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage payouts" ON public.partner_payouts;
CREATE POLICY "Admins manage payouts" ON public.partner_payouts
  FOR ALL USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 5. SEED PARCEIRO INICIAL "TIO"
INSERT INTO public.partners (name, code, commission_rate, commission_scope, status)
VALUES ('Parceiro B2B Privado', 'tio', 50.00, 'activation_only', 'active')
ON CONFLICT (code) DO NOTHING;