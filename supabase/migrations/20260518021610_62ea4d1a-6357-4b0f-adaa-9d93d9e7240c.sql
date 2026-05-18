
-- =========== user_credits ===========
CREATE TABLE IF NOT EXISTS public.user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance integer NOT NULL DEFAULT 0,
  lifetime_earned integer NOT NULL DEFAULT 0,
  lifetime_spent integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage credits" ON public.user_credits
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========== credit_transactions ===========
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  delta integer NOT NULL,
  reason text NOT NULL,
  ref_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON public.credit_transactions(user_id, created_at DESC);
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own credit tx" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage credit tx" ON public.credit_transactions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =========== grant_credits function ===========
CREATE OR REPLACE FUNCTION public.grant_credits(
  _user_id uuid,
  _delta integer,
  _reason text,
  _ref_id uuid DEFAULT NULL,
  _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _new_balance integer;
BEGIN
  IF _delta = 0 THEN
    SELECT balance INTO _new_balance FROM public.user_credits WHERE user_id = _user_id;
    RETURN COALESCE(_new_balance, 0);
  END IF;

  INSERT INTO public.user_credits (user_id, balance, lifetime_earned, lifetime_spent)
  VALUES (
    _user_id,
    GREATEST(_delta, 0),
    GREATEST(_delta, 0),
    GREATEST(-_delta, 0)
  )
  ON CONFLICT (user_id) DO UPDATE
    SET balance = public.user_credits.balance + _delta,
        lifetime_earned = public.user_credits.lifetime_earned + GREATEST(_delta, 0),
        lifetime_spent = public.user_credits.lifetime_spent + GREATEST(-_delta, 0),
        updated_at = now()
  RETURNING balance INTO _new_balance;

  IF _new_balance < 0 THEN
    RAISE EXCEPTION 'Saldo de créditos insuficiente' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.credit_transactions (user_id, delta, reason, ref_id, metadata)
  VALUES (_user_id, _delta, _reason, _ref_id, COALESCE(_metadata, '{}'::jsonb));

  RETURN _new_balance;
END;
$$;

-- =========== handle_new_user: grant 10 free credits ===========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, whatsapp, business_name, business_segment)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name',''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'whatsapp',''),
    COALESCE(NEW.raw_user_meta_data->>'business_name',''),
    COALESCE(NEW.raw_user_meta_data->>'business_segment','')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  INSERT INTO public.events (event_type, user_id, event_data)
  VALUES ('user.signup', NEW.id, jsonb_build_object('email', NEW.email));
  PERFORM public.grant_credits(NEW.id, 10, 'signup_bonus', NULL, '{}'::jsonb);
  RETURN NEW;
END;
$$;

-- Backfill: dá 10 créditos para usuários existentes que ainda não têm registro
INSERT INTO public.user_credits (user_id, balance, lifetime_earned)
SELECT u.id, 10, 10
FROM auth.users u
LEFT JOIN public.user_credits c ON c.user_id = u.id
WHERE c.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.credit_transactions (user_id, delta, reason, metadata)
SELECT u.id, 10, 'signup_bonus_backfill', '{}'::jsonb
FROM auth.users u
LEFT JOIN public.credit_transactions ct ON ct.user_id = u.id AND ct.reason IN ('signup_bonus','signup_bonus_backfill')
WHERE ct.id IS NULL;

-- =========== dev_projects: slug, generated_content, public ===========
ALTER TABLE public.dev_projects
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS generated_content jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS dev_projects_slug_key ON public.dev_projects(slug) WHERE slug IS NOT NULL;

-- Permite leitura pública dos sites marcados como públicos
CREATE POLICY "Anyone views public dev sites" ON public.dev_projects
  FOR SELECT
  USING (is_public = true AND slug IS NOT NULL AND status = 'published');

-- =========== dev_plans: monthly_credits ===========
ALTER TABLE public.dev_plans
  ADD COLUMN IF NOT EXISTS monthly_credits integer NOT NULL DEFAULT 0;
