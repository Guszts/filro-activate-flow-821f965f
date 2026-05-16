
-- 1) payments: stripe_checkout_session_id + unique
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text;

CREATE UNIQUE INDEX IF NOT EXISTS payments_stripe_checkout_session_id_key
  ON public.payments (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

-- 2) Foreign keys for partner tables
DO $$ BEGIN
  ALTER TABLE public.partner_referrals
    ADD CONSTRAINT partner_referrals_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.partner_referrals
    ADD CONSTRAINT partner_referrals_plan_id_fkey
    FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.partner_commissions
    ADD CONSTRAINT partner_commissions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.partner_commissions
    ADD CONSTRAINT partner_commissions_plan_id_fkey
    FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.partner_commissions
    ADD CONSTRAINT partner_commissions_payment_id_fkey
    FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) Harden pay_partner_commission with internal admin check
CREATE OR REPLACE FUNCTION public.pay_partner_commission(
  _commission_id uuid,
  _method text DEFAULT 'pix',
  _notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _commission RECORD;
  _pix text;
  _payout_id uuid;
  _now timestamptz := now();
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso restrito' USING ERRCODE = '42501';
  END IF;

  SELECT id, partner_id, commission_amount, status, payout_id
    INTO _commission
    FROM public.partner_commissions
   WHERE id = _commission_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comissão não encontrada' USING ERRCODE = 'P0002';
  END IF;

  IF _commission.status = 'paid' OR _commission.payout_id IS NOT NULL THEN
    RAISE EXCEPTION 'Comissão já marcada como paga' USING ERRCODE = 'P0001';
  END IF;

  IF _commission.status = 'cancelled' THEN
    RAISE EXCEPTION 'Comissão cancelada não pode ser paga' USING ERRCODE = 'P0001';
  END IF;

  SELECT pix_key INTO _pix FROM public.partners WHERE id = _commission.partner_id;

  INSERT INTO public.partner_payouts (partner_id, amount, method, pix_key, status, paid_at, notes)
  VALUES (_commission.partner_id, _commission.commission_amount, _method, _pix, 'paid', _now, _notes)
  RETURNING id INTO _payout_id;

  UPDATE public.partner_commissions
     SET status = 'paid', paid_at = _now, payout_id = _payout_id, updated_at = _now
   WHERE id = _commission_id;

  RETURN _payout_id;
END;
$function$;
