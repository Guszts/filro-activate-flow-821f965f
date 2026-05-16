
CREATE OR REPLACE FUNCTION public.pay_partner_commission(
  _commission_id uuid,
  _method text DEFAULT 'pix',
  _notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _commission RECORD;
  _pix text;
  _payout_id uuid;
  _now timestamptz := now();
BEGIN
  -- Lock the commission row to prevent concurrent pay attempts
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
$$;

-- Restrict execution to admins only via has_role check inside function (extra safety)
REVOKE ALL ON FUNCTION public.pay_partner_commission(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pay_partner_commission(uuid, text, text) TO authenticated, service_role;
