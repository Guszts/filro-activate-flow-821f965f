
-- promo_codes table
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text DEFAULT '',
  discount_percent integer NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
  plan_slug text,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  stripe_coupon_id text,
  stripe_promotion_code_id text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_promo_codes_code ON public.promo_codes(code) WHERE active = true;

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage promo codes"
  ON public.promo_codes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active codes for validation"
  ON public.promo_codes FOR SELECT
  USING (active = true);

CREATE TRIGGER trg_promo_codes_updated
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- promo_code_redemptions table
CREATE TABLE public.promo_code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid NOT NULL,
  code text NOT NULL,
  user_id uuid,
  payment_id uuid,
  stripe_checkout_session_id text,
  discount_amount integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view redemptions"
  ON public.promo_code_redemptions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- payments: campos para cupom/desconto
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS amount_paid integer,
  ADD COLUMN IF NOT EXISTS discount_amount integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS promo_code text;

-- projects: PDF + flag de email enviado
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS project_pdf_url text,
  ADD COLUMN IF NOT EXISTS delivered_email_sent_at timestamptz;

-- Popular cupons iniciais
INSERT INTO public.promo_codes (code, description, discount_percent, plan_slug, max_uses, active) VALUES
  ('BEMVINDO10', 'Boas-vindas 10% de desconto', 10, NULL, NULL, true),
  ('BEMVINDO20', 'Boas-vindas 20% de desconto', 20, NULL, 100, true),
  ('ESSENCIAL15', '15% off no plano Essencial', 15, 'essencial', NULL, true),
  ('PROFISSIONAL15', '15% off no plano Profissional', 15, 'profissional', NULL, true),
  ('PREMIUM15', '15% off no plano Premium', 15, 'premium', NULL, true),
  ('BLACKFRIDAY30', 'Black Friday 30% off', 30, NULL, 200, true),
  ('EQUIPE100', 'Cortesia equipe 100%', 100, NULL, 50, true),
  ('FILRO10', 'Filro 10%', 10, NULL, NULL, true),
  ('FILRO100', 'Filro 100% (interno)', 100, NULL, NULL, true)
ON CONFLICT (code) DO NOTHING;
