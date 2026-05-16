-- 1) Fix mutable search_path on email queue helpers
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;

-- 2) Revoke EXECUTE from anon/authenticated on internal SECURITY DEFINER functions.
--    These should only be callable by service_role (queue dispatcher) or admins.
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint)               FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb)   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb)               FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint)               TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb)   TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb)               TO service_role;

-- pay_partner_commission is admin-only (verified internally via has_role).
-- Revoke from anon entirely; keep authenticated so admins can call it (function itself checks the role).
REVOKE EXECUTE ON FUNCTION public.pay_partner_commission(uuid, text, text) FROM PUBLIC, anon;

-- has_role / update_updated_at_column / handle_new_user / log_project_status_change:
-- has_role is used inside RLS policies and MUST stay callable by authenticated.
-- The others are trigger functions and do not need to be exposed via PostgREST.
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column()        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                 FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_project_status_change()       FROM PUBLIC, anon, authenticated;