
-- Subscriptions table to track Stripe subscription lifecycle
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid REFERENCES public.plans(id),
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

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscription"
  ON public.subscriptions FOR SELECT
  USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admin tasks queue for production after a sale is confirmed
CREATE TYPE public.admin_task_status AS ENUM ('pending', 'in_progress', 'done', 'canceled');

CREATE TABLE public.admin_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES public.plans(id),
  title text NOT NULL,
  description text DEFAULT '',
  status public.admin_task_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_tasks_status ON public.admin_tasks(status);

ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage tasks"
  ON public.admin_tasks FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_admin_tasks_updated_at
  BEFORE UPDATE ON public.admin_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
