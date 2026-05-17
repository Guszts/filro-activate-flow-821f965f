
-- ============ ENUMS ============
DO $$ BEGIN
  CREATE TYPE public.dev_project_status AS ENUM (
    'briefing','awaiting_payment','queued','in_production','review','published','paused','cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.dev_plan_slug AS ENUM ('dev_start','dev_plus','dev_pro','dev_scale');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.dev_payment_status AS ENUM ('pending','paid','failed','refunded','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ TEMPLATES ============
CREATE TABLE IF NOT EXISTS public.dev_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  segment text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  preview_image_url text,
  preview_url text,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_plan dev_plan_slug,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dev_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone views active dev templates"
  ON public.dev_templates FOR SELECT
  USING (active = true OR has_role(auth.uid(),'admin'));

CREATE POLICY "Admins manage dev templates"
  ON public.dev_templates FOR ALL
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_dev_templates_updated
  BEFORE UPDATE ON public.dev_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PLANS ============
CREATE TABLE IF NOT EXISTS public.dev_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug dev_plan_slug NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  activation_price integer NOT NULL,
  monthly_price integer NOT NULL,
  currency text NOT NULL DEFAULT 'brl',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  max_pages integer NOT NULL DEFAULT 1,
  max_revisions_month integer NOT NULL DEFAULT 2,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  stripe_activation_price_lookup_key text,
  stripe_monthly_price_lookup_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dev_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone views active dev plans"
  ON public.dev_plans FOR SELECT
  USING (active = true OR has_role(auth.uid(),'admin'));

CREATE POLICY "Admins manage dev plans"
  ON public.dev_plans FOR ALL
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_dev_plans_updated
  BEFORE UPDATE ON public.dev_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PROJECTS ============
CREATE TABLE IF NOT EXISTS public.dev_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  template_id uuid REFERENCES public.dev_templates(id) ON DELETE SET NULL,
  template_slug text,
  plan_id uuid REFERENCES public.dev_plans(id) ON DELETE SET NULL,
  plan_slug dev_plan_slug,
  business_name text NOT NULL DEFAULT '',
  business_segment text NOT NULL DEFAULT '',
  briefing jsonb NOT NULL DEFAULT '{}'::jsonb,
  status dev_project_status NOT NULL DEFAULT 'briefing',
  preview_url text,
  published_url text,
  assigned_admin_id uuid,
  notes text NOT NULL DEFAULT '',
  activation_paid_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dev_projects_user ON public.dev_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_dev_projects_status ON public.dev_projects(status);

ALTER TABLE public.dev_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own dev projects"
  ON public.dev_projects FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));

CREATE POLICY "Users insert own dev projects"
  ON public.dev_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own dev projects"
  ON public.dev_projects FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));

CREATE POLICY "Admins manage dev projects"
  ON public.dev_projects FOR ALL
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_dev_projects_updated
  BEFORE UPDATE ON public.dev_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ VERSIONS ============
CREATE TABLE IF NOT EXISTS public.dev_project_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.dev_projects(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  generated_site jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text NOT NULL DEFAULT '',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dev_versions_project ON public.dev_project_versions(project_id);

ALTER TABLE public.dev_project_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view versions of own project"
  ON public.dev_project_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.dev_projects p
    WHERE p.id = dev_project_versions.project_id
      AND (p.user_id = auth.uid() OR has_role(auth.uid(),'admin'))
  ));

CREATE POLICY "Admins manage versions"
  ON public.dev_project_versions FOR ALL
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

-- ============ PAYMENTS (activation) ============
CREATE TABLE IF NOT EXISTS public.dev_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid REFERENCES public.dev_projects(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES public.dev_plans(id) ON DELETE SET NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'brl',
  status dev_payment_status NOT NULL DEFAULT 'pending',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  environment text NOT NULL DEFAULT 'sandbox',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dev_payments_user ON public.dev_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_dev_payments_project ON public.dev_payments(project_id);

ALTER TABLE public.dev_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own dev payments"
  ON public.dev_payments FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));

CREATE POLICY "Admins manage dev payments"
  ON public.dev_payments FOR ALL
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_dev_payments_updated
  BEFORE UPDATE ON public.dev_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SUBSCRIPTIONS (monthly) ============
CREATE TABLE IF NOT EXISTS public.dev_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid REFERENCES public.dev_projects(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES public.dev_plans(id) ON DELETE SET NULL,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  price_id text,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  canceled_at timestamptz,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dev_subs_user ON public.dev_subscriptions(user_id);

ALTER TABLE public.dev_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own dev subscriptions"
  ON public.dev_subscriptions FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));

CREATE POLICY "Admins manage dev subscriptions"
  ON public.dev_subscriptions FOR ALL
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_dev_subs_updated
  BEFORE UPDATE ON public.dev_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
