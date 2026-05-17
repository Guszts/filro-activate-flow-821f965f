
-- Private bucket for project PDFs (no public access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-pdfs', 'project-pdfs', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- New column to store the private storage path (separate from legacy public URL)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS project_pdf_path text;

-- Explicit deny: no client-side access to project-pdfs bucket objects.
-- All reads/writes go through server functions using the service role.
-- (Default-deny is already in effect because there are no policies for this
-- bucket, but we add an explicit "no-op" policy with comment for clarity.)
COMMENT ON COLUMN public.projects.project_pdf_path IS
  'Private storage path within the project-pdfs bucket. Access exclusively via server-issued signed URLs.';
