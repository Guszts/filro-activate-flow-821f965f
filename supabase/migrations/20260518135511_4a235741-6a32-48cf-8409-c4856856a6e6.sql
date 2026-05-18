
-- Update plan rows to new credit-based pricing
UPDATE public.dev_plans SET
  name = 'Starter',
  tagline = 'Site profissional pessoal ou pequeno negócio',
  activation_price = 0,
  monthly_price = 4700,
  monthly_credits = 50,
  max_pages = 99,
  max_revisions_month = 99,
  display_order = 1,
  stripe_monthly_price_lookup_key = 'devplan_starter_monthly',
  stripe_activation_price_lookup_key = NULL,
  features = '["50 créditos por mês","Sites ilimitados (5 créditos cada)","Editor IA + manual","Suporte por e-mail"]'::jsonb,
  active = true
WHERE slug = 'dev_start';

UPDATE public.dev_plans SET
  name = 'Pro',
  tagline = 'Para quem mantém vários sites e campanhas',
  activation_price = 0,
  monthly_price = 9700,
  monthly_credits = 150,
  max_pages = 99,
  max_revisions_month = 99,
  display_order = 2,
  stripe_monthly_price_lookup_key = 'devplan_pro_monthly',
  stripe_activation_price_lookup_key = NULL,
  features = '["150 créditos por mês","Sites ilimitados","Editor IA + manual","Suporte prioritário"]'::jsonb,
  active = true
WHERE slug = 'dev_pro';

UPDATE public.dev_plans SET
  name = 'Scale',
  tagline = 'Volume para times e operações maiores',
  activation_price = 0,
  monthly_price = 19700,
  monthly_credits = 400,
  max_pages = 99,
  max_revisions_month = 99,
  display_order = 3,
  stripe_monthly_price_lookup_key = 'devplan_scale_monthly',
  stripe_activation_price_lookup_key = NULL,
  features = '["400 créditos por mês","Sites ilimitados","Editor IA + manual","Suporte dedicado"]'::jsonb,
  active = true
WHERE slug = 'dev_scale';

UPDATE public.dev_plans SET active = false WHERE slug = 'dev_plus';

-- Table for one-time credit packs (config + lookup keys)
CREATE TABLE IF NOT EXISTS public.dev_credit_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  credits integer NOT NULL,
  price integer NOT NULL,
  currency text NOT NULL DEFAULT 'brl',
  stripe_price_lookup_key text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dev_credit_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone views active credit packs" ON public.dev_credit_packs
  FOR SELECT USING (active = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage credit packs" ON public.dev_credit_packs
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_dev_credit_packs_updated
  BEFORE UPDATE ON public.dev_credit_packs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.dev_credit_packs (slug, name, credits, price, stripe_price_lookup_key, display_order) VALUES
  ('pack_20', 'Pacote 20 créditos', 20, 2900, 'devpack_20', 1),
  ('pack_50', 'Pacote 50 créditos', 50, 5900, 'devpack_50', 2),
  ('pack_150', 'Pacote 150 créditos', 150, 14900, 'devpack_150', 3)
ON CONFLICT (slug) DO NOTHING;
