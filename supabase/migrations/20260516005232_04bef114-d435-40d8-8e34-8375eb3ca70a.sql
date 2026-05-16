-- Tipo de revisão
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'revision_kind') THEN
    CREATE TYPE public.revision_kind AS ENUM ('client_request', 'admin_update', 'approval', 'publish_note');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'revision_status') THEN
    CREATE TYPE public.revision_status AS ENUM ('open', 'in_progress', 'resolved');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.project_revisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  kind public.revision_kind NOT NULL DEFAULT 'client_request',
  status public.revision_status NOT NULL DEFAULT 'open',
  message TEXT NOT NULL,
  created_by UUID,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_revisions_project ON public.project_revisions(project_id, created_at DESC);

ALTER TABLE public.project_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage revisions"
ON public.project_revisions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view own project revisions"
ON public.project_revisions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_revisions.project_id
      AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users create revisions on own project"
ON public.project_revisions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_revisions.project_id
      AND p.user_id = auth.uid()
  )
  AND created_by = auth.uid()
  AND kind IN ('client_request', 'approval')
);

DROP TRIGGER IF EXISTS trg_project_revisions_updated_at ON public.project_revisions;
CREATE TRIGGER trg_project_revisions_updated_at
BEFORE UPDATE ON public.project_revisions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();