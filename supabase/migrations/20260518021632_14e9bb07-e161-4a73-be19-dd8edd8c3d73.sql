
REVOKE EXECUTE ON FUNCTION public.grant_credits(uuid, integer, text, uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_credits(uuid, integer, text, uuid, jsonb) TO service_role;
