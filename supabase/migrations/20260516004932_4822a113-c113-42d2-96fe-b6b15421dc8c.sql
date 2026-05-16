-- 1. Expandir enum project_status com novos valores
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'payment_confirmed' AND enumtypid = 'public.project_status'::regtype) THEN
    ALTER TYPE public.project_status ADD VALUE 'payment_confirmed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'briefing_received' AND enumtypid = 'public.project_status'::regtype) THEN
    ALTER TYPE public.project_status ADD VALUE 'briefing_received';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'in_production' AND enumtypid = 'public.project_status'::regtype) THEN
    ALTER TYPE public.project_status ADD VALUE 'in_production';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'revision_sent' AND enumtypid = 'public.project_status'::regtype) THEN
    ALTER TYPE public.project_status ADD VALUE 'revision_sent';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'awaiting_client' AND enumtypid = 'public.project_status'::regtype) THEN
    ALTER TYPE public.project_status ADD VALUE 'awaiting_client';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'published' AND enumtypid = 'public.project_status'::regtype) THEN
    ALTER TYPE public.project_status ADD VALUE 'published';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'maintenance' AND enumtypid = 'public.project_status'::regtype) THEN
    ALTER TYPE public.project_status ADD VALUE 'maintenance';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'paused' AND enumtypid = 'public.project_status'::regtype) THEN
    ALTER TYPE public.project_status ADD VALUE 'paused';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'cancelled' AND enumtypid = 'public.project_status'::regtype) THEN
    ALTER TYPE public.project_status ADD VALUE 'cancelled';
  END IF;
END$$;

-- 2. Novos campos na tabela projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS kanban_position INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preview_url TEXT,
  ADD COLUMN IF NOT EXISTS published_url TEXT,
  ADD COLUMN IF NOT EXISTS expected_delivery_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assigned_admin_id UUID;

CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(project_status);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_admin ON public.projects(assigned_admin_id);

-- 3. Histórico de mudanças de status
CREATE TABLE IF NOT EXISTS public.project_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  from_status public.project_status,
  to_status public.project_status NOT NULL,
  changed_by UUID,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_status_history_project ON public.project_status_history(project_id, created_at DESC);

ALTER TABLE public.project_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage status history"
ON public.project_status_history
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view own project history"
ON public.project_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_status_history.project_id
      AND (p.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- 4. Trigger para registrar mudanças de status automaticamente
CREATE OR REPLACE FUNCTION public.log_project_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.project_status_history (project_id, from_status, to_status, changed_by)
    VALUES (NEW.id, NULL, NEW.project_status, auth.uid());
    RETURN NEW;
  END IF;

  IF NEW.project_status IS DISTINCT FROM OLD.project_status THEN
    INSERT INTO public.project_status_history (project_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.project_status, NEW.project_status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_project_status_change ON public.projects;
CREATE TRIGGER trg_log_project_status_change
AFTER INSERT OR UPDATE OF project_status ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.log_project_status_change();

-- 5. Trigger de updated_at em project_status_history (não precisa, sem updated_at)
-- 6. Garantir trigger de updated_at em projects (caso ainda não tenha)
DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();