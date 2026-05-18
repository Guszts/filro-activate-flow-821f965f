
-- 1. Remove tables from realtime publication that the app doesn't subscribe to.
--    This prevents authenticated users from subscribing to other users' payments,
--    subscriptions, profiles, and events row-change broadcasts.
ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles;
ALTER PUBLICATION supabase_realtime DROP TABLE public.payments;
ALTER PUBLICATION supabase_realtime DROP TABLE public.events;
ALTER PUBLICATION supabase_realtime DROP TABLE public.subscriptions;
ALTER PUBLICATION supabase_realtime DROP TABLE public.plans;

-- 2. Revoke EXECUTE on SECURITY DEFINER helpers from anon/authenticated.
--    These are either trigger functions or are only ever invoked from the
--    server via the service role; clients should never call them as RPCs.
--    has_role is intentionally left executable because RLS policies invoke it
--    on behalf of the querying user.

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_project_status_change() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.grant_credits(uuid, integer, text, uuid, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.pay_partner_commission(uuid, text, text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, PUBLIC;
