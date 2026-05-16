
-- ============================================================
-- FLARO DEV — Fase 1
-- ============================================================

-- ============= flaro_dev_projects =============
CREATE TABLE public.flaro_dev_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Novo projeto',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  template_id UUID,
  current_version_id UUID,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_flaro_dev_projects_user ON public.flaro_dev_projects(user_id, created_at DESC);
ALTER TABLE public.flaro_dev_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own flaro_dev projects" ON public.flaro_dev_projects
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_flaro_dev_projects_updated
  BEFORE UPDATE ON public.flaro_dev_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= flaro_dev_versions =============
CREATE TABLE public.flaro_dev_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.flaro_dev_projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  html TEXT NOT NULL DEFAULT '',
  css TEXT NOT NULL DEFAULT '',
  js TEXT NOT NULL DEFAULT '',
  prompt_summary TEXT NOT NULL DEFAULT '',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_flaro_dev_versions_project ON public.flaro_dev_versions(project_id, created_at DESC);
ALTER TABLE public.flaro_dev_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access versions of own projects" ON public.flaro_dev_versions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.flaro_dev_projects p WHERE p.id = project_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.flaro_dev_projects p WHERE p.id = project_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

-- ============= flaro_dev_messages =============
CREATE TABLE public.flaro_dev_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.flaro_dev_projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_flaro_dev_messages_project ON public.flaro_dev_messages(project_id, created_at);
ALTER TABLE public.flaro_dev_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access messages of own projects" ON public.flaro_dev_messages
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.flaro_dev_projects p WHERE p.id = project_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.flaro_dev_projects p WHERE p.id = project_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

-- ============= flaro_dev_templates =============
CREATE TABLE public.flaro_dev_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'geral',
  thumbnail_url TEXT,
  html TEXT NOT NULL DEFAULT '',
  css TEXT NOT NULL DEFAULT '',
  js TEXT NOT NULL DEFAULT '',
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.flaro_dev_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authed can view public templates" ON public.flaro_dev_templates
  FOR SELECT TO authenticated
  USING (is_public = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage templates" ON public.flaro_dev_templates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_flaro_dev_templates_updated
  BEFORE UPDATE ON public.flaro_dev_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= flaro_dev_attachments =============
CREATE TABLE public.flaro_dev_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.flaro_dev_projects(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.flaro_dev_messages(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_flaro_dev_attachments_project ON public.flaro_dev_attachments(project_id);
ALTER TABLE public.flaro_dev_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access attachments of own projects" ON public.flaro_dev_attachments
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.flaro_dev_projects p WHERE p.id = project_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.flaro_dev_projects p WHERE p.id = project_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

-- ============= flaro_dev_domains =============
CREATE TABLE public.flaro_dev_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.flaro_dev_projects(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','dns_manual','verified','failed')),
  entri_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(domain)
);
ALTER TABLE public.flaro_dev_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access domains of own projects" ON public.flaro_dev_domains
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.flaro_dev_projects p WHERE p.id = project_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.flaro_dev_projects p WHERE p.id = project_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

CREATE TRIGGER trg_flaro_dev_domains_updated
  BEFORE UPDATE ON public.flaro_dev_domains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= flaro_dev_deployments =============
CREATE TABLE public.flaro_dev_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.flaro_dev_projects(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES public.flaro_dev_versions(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','unpublished','failed')),
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_flaro_dev_deployments_project ON public.flaro_dev_deployments(project_id, published_at DESC);
ALTER TABLE public.flaro_dev_deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published deployments" ON public.flaro_dev_deployments
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Users manage deployments of own projects" ON public.flaro_dev_deployments
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.flaro_dev_projects p WHERE p.id = project_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.flaro_dev_projects p WHERE p.id = project_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

-- ============= flaro_dev_seo =============
CREATE TABLE public.flaro_dev_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.flaro_dev_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  og_image_url TEXT,
  favicon_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.flaro_dev_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access SEO of own projects" ON public.flaro_dev_seo
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.flaro_dev_projects p WHERE p.id = project_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.flaro_dev_projects p WHERE p.id = project_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

CREATE TRIGGER trg_flaro_dev_seo_updated
  BEFORE UPDATE ON public.flaro_dev_seo
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= Storage bucket =============
INSERT INTO storage.buckets (id, name, public)
VALUES ('flaro-dev-assets', 'flaro-dev-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Flaro Dev assets public read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'flaro-dev-assets');

CREATE POLICY "Users upload own flaro-dev-assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'flaro-dev-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own flaro-dev-assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'flaro-dev-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own flaro-dev-assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'flaro-dev-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
