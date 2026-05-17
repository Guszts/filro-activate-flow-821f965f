
CREATE TYPE public.dev_change_request_status AS ENUM ('open', 'in_progress', 'done', 'rejected');
CREATE TYPE public.dev_change_request_category AS ENUM ('content', 'design', 'feature', 'bug', 'question', 'other');
CREATE TYPE public.dev_change_request_priority AS ENUM ('low', 'normal', 'high');

CREATE TABLE public.dev_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  user_id uuid NOT NULL,
  message text NOT NULL,
  ai_category public.dev_change_request_category NOT NULL DEFAULT 'other',
  ai_summary text NOT NULL DEFAULT '',
  ai_priority public.dev_change_request_priority NOT NULL DEFAULT 'normal',
  status public.dev_change_request_status NOT NULL DEFAULT 'open',
  admin_response text NOT NULL DEFAULT '',
  admin_task_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX dev_change_requests_project_idx ON public.dev_change_requests(project_id, created_at DESC);
CREATE INDEX dev_change_requests_user_idx ON public.dev_change_requests(user_id);
CREATE INDEX dev_change_requests_status_idx ON public.dev_change_requests(status);

ALTER TABLE public.dev_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own change requests"
  ON public.dev_change_requests FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create change requests on own dev projects"
  ON public.dev_change_requests FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.dev_projects p WHERE p.id = project_id AND p.user_id = auth.uid())
  );

CREATE POLICY "Admins manage change requests"
  ON public.dev_change_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_updated_at_dev_change_requests
  BEFORE UPDATE ON public.dev_change_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
