CREATE OR REPLACE FUNCTION public.grant_credits(_user_id uuid, _amount integer, _reason text, _ref text DEFAULT NULL, _meta jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- No-op stub: registra evento para auditoria; sistema de créditos ainda não implementado.
  INSERT INTO public.events (event_type, user_id, event_data)
  VALUES ('credits.granted', _user_id, jsonb_build_object('amount', _amount, 'reason', _reason, 'ref', _ref, 'meta', _meta));
END;
$$;