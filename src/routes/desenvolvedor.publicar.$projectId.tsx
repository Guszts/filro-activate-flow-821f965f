import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { getFlaroDevProject } from "@/lib/flaro-dev.functions";
import {
  FlaroDevPublishPanel,
  type FlaroDevDeployment,
} from "@/components/flaro-dev/FlaroDevPublishPanel";
import { ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/desenvolvedor/publicar/$projectId")({
  component: PublishPage,
  head: () => ({
    meta: [
      { title: "Publicar · Flaro Dev" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function PublishPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const getProject = useServerFn(getFlaroDevProject);

  const [data, setData] = useState<{
    name: string;
    hasVersion: boolean;
    deployments: FlaroDevDeployment[];
  } | null>(null);
  const [fetching, setFetching] = useState(true);

  const refetch = useCallback(async () => {
    const res = await getProject({ data: { id: projectId } });
    setData({
      name: (res.project as { name: string }).name,
      hasVersion: !!res.currentVersion,
      deployments: res.deployments as FlaroDevDeployment[],
    });
    setFetching(false);
  }, [getProject, projectId]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({
        to: "/login",
        search: { redirect: `/desenvolvedor/publicar/${projectId}` },
      });
      return;
    }
    refetch().catch(() => setFetching(false));
  }, [loading, user, navigate, projectId, refetch]);

  if (fetching || !data) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-ink-soft" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-3xl px-4 md:px-6 py-3 flex items-center gap-3">
          <Link
            to="/desenvolvedor/projeto/$projectId"
            params={{ projectId }}
            className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao workspace</span>
          </Link>
          <div className="h-6 w-px bg-border" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider text-ink-soft">
              Flaro Dev · Publicar
            </div>
            <h1 className="font-display font-bold text-base text-ink truncate">
              {data.name}
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 md:px-6 py-8">
        <FlaroDevPublishPanel
          projectId={projectId}
          deployments={data.deployments}
          onPublished={refetch}
          hasVersion={data.hasVersion}
        />
      </main>
    </div>
  );
}
