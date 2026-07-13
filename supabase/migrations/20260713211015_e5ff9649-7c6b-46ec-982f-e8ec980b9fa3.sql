
-- 1. Extend plans table
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'usd',
  ADD COLUMN IF NOT EXISTS checkout_mode text NOT NULL DEFAULT 'direct',
  ADD COLUMN IF NOT EXISTS badge text,
  ADD COLUMN IF NOT EXISTS delivery_window text,
  ADD COLUMN IF NOT EXISTS maintenance_features jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS exclusions jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cta_label text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'plans_checkout_mode_check'
  ) THEN
    ALTER TABLE public.plans
      ADD CONSTRAINT plans_checkout_mode_check
      CHECK (checkout_mode IN ('direct','custom','application'));
  END IF;
END$$;

-- 2. Preserve legacy: mark existing rows BRL, deactivate, hide
UPDATE public.plans
   SET currency = 'brl',
       active = false,
       hidden = true
 WHERE slug IN ('start','essencial','plus','profissional','priority','premium','promocional');

-- 3. Insert new USD plans (upsert by slug)
INSERT INTO public.plans
  (slug, name, activation_price, monthly_price, description, features,
   display_order, active, hidden, currency, checkout_mode, badge,
   delivery_window, maintenance_features, exclusions, cta_label)
VALUES
  ('launch', 'Launch',
   250000, 29700,
   'Foundational digital presence: a fast site, essential integrations, and lightweight automation to start capturing leads.',
   '[
     "Custom marketing website (up to 5 sections)",
     "Domain, hosting and SSL setup",
     "Contact form with email routing",
     "Analytics + conversion events",
     "Basic SEO and metadata",
     "1 automated workflow (e.g. lead email)"
   ]'::jsonb,
   10, true, false, 'usd', 'direct', null,
   '2–3 weeks',
   '[
     "Uptime monitoring",
     "Monthly minor updates (up to 2h)",
     "Email + form support",
     "Analytics review"
   ]'::jsonb,
   '["Custom software","Complex integrations","Paid ads management"]'::jsonb,
   'Start with Launch'),
  ('growth', 'Growth',
   500000, 59700,
   'Multi-page site with CRM, booking or e-commerce integration and connected automations for growing operations.',
   '[
     "Everything in Launch",
     "Up to 10 pages / templates",
     "CRM, booking, or e-commerce integration",
     "3 automated workflows",
     "Payment processing setup",
     "Advanced analytics dashboard",
     "Content management for the team"
   ]'::jsonb,
   20, true, false, 'usd', 'direct', 'Popular for small teams',
   '3–5 weeks',
   '[
     "Everything in Launch maintenance",
     "Monthly updates (up to 5h)",
     "Automation health checks",
     "Priority email support"
   ]'::jsonb,
   '["Custom mobile apps","Advanced BI"]'::jsonb,
   'Choose Growth'),
  ('revenue_system', 'Revenue System',
   1000000, 99700,
   'A connected system: website, CRM, sales pipeline, payments and automations working together as one revenue engine.',
   '[
     "Everything in Growth",
     "End-to-end revenue system design",
     "CRM + sales pipeline configuration",
     "Marketing + transactional email flows",
     "Up to 8 connected automations",
     "Customer portal or dashboard",
     "Team onboarding and documentation"
   ]'::jsonb,
   30, true, false, 'usd', 'direct', 'Most chosen',
   '5–8 weeks',
   '[
     "Everything in Growth maintenance",
     "Monthly updates (up to 10h)",
     "Automation + integration monitoring",
     "Monthly strategy call",
     "Priority chat support"
   ]'::jsonb,
   '["Native mobile apps"]'::jsonb,
   'Build my Revenue System'),
  ('scale', 'Scale',
   2000000, 199700,
   'Custom implementation for established businesses: bespoke software, deep integrations, dedicated team and ongoing operations.',
   '[
     "Fully custom scope",
     "Dedicated implementation team",
     "Custom software / internal tools",
     "Complex integrations (ERP, warehouse, telephony, etc.)",
     "Data pipelines and reporting",
     "SLA and dedicated Slack channel"
   ]'::jsonb,
   40, true, false, 'usd', 'custom', 'Enterprise',
   '8–16 weeks',
   '[
     "Everything in Revenue System maintenance",
     "Dedicated engineering hours (from 20h/mo)",
     "SLA-backed response times",
     "Quarterly business review"
   ]'::jsonb,
   '[]'::jsonb,
   'Talk to us')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  activation_price = EXCLUDED.activation_price,
  monthly_price = EXCLUDED.monthly_price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  display_order = EXCLUDED.display_order,
  active = EXCLUDED.active,
  hidden = EXCLUDED.hidden,
  currency = EXCLUDED.currency,
  checkout_mode = EXCLUDED.checkout_mode,
  badge = EXCLUDED.badge,
  delivery_window = EXCLUDED.delivery_window,
  maintenance_features = EXCLUDED.maintenance_features,
  exclusions = EXCLUDED.exclusions,
  cta_label = EXCLUDED.cta_label,
  updated_at = now();

-- 4. implementation_requests table
CREATE TABLE IF NOT EXISTS public.implementation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company_name text,
  company_website text,
  industry text,
  team_size text,
  country text,
  current_stack text,
  goals text,
  timeline text,
  budget_range text,
  preferred_plan text,
  message text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','won','lost','archived')),
  admin_notes text,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.implementation_requests TO authenticated;
GRANT ALL ON public.implementation_requests TO service_role;

ALTER TABLE public.implementation_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage implementation_requests" ON public.implementation_requests;
CREATE POLICY "Admins manage implementation_requests"
  ON public.implementation_requests
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS implementation_requests_updated_at ON public.implementation_requests;
CREATE TRIGGER implementation_requests_updated_at
  BEFORE UPDATE ON public.implementation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS implementation_requests_status_idx
  ON public.implementation_requests(status);
CREATE INDEX IF NOT EXISTS implementation_requests_created_at_idx
  ON public.implementation_requests(created_at DESC);

-- 5. terms_acceptances table
CREATE TABLE IF NOT EXISTS public.terms_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  plan_slug text,
  terms_version text NOT NULL,
  privacy_version text,
  checkout_session_id text,
  ip_address text,
  user_agent text,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.terms_acceptances TO authenticated;
GRANT ALL ON public.terms_acceptances TO service_role;

ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own terms acceptances" ON public.terms_acceptances;
CREATE POLICY "Users view own terms acceptances"
  ON public.terms_acceptances
  FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage terms acceptances" ON public.terms_acceptances;
CREATE POLICY "Admins manage terms acceptances"
  ON public.terms_acceptances
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS terms_acceptances_user_id_idx
  ON public.terms_acceptances(user_id);
CREATE INDEX IF NOT EXISTS terms_acceptances_created_at_idx
  ON public.terms_acceptances(created_at DESC);
