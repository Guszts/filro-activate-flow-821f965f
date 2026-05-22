-- 1. Desativar cupons 100% no banco
UPDATE public.promo_codes
SET active = false, updated_at = now()
WHERE code IN ('FILRO100', 'EQUIPE100');

-- 2. Remover policies que permitiam ao cliente mutar projects diretamente
DROP POLICY IF EXISTS "Users update own project" ON public.projects;
DROP POLICY IF EXISTS "Users insert own project" ON public.projects;

-- Mantemos "Users view own project" (SELECT) e "Admins manage projects" (ALL).
-- Toda criação/atualização de projeto pelo cliente passa a usar server functions
-- com supabaseAdmin + verificação explícita de ownership.