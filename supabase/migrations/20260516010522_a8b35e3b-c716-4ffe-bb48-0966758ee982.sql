DROP TRIGGER IF EXISTS trg_log_project_status_change ON public.projects;
CREATE TRIGGER trg_log_project_status_change
AFTER INSERT OR UPDATE OF project_status ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.log_project_status_change();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();