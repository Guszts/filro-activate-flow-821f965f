import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import {
  getFlaroDevProject,
  sendFlaroDevChat,
  restoreFlaroDevVersion,
} from "@/lib/flaro-dev.functions";
import { FlaroDevChat, type FlaroDevMessage } from "@/components/flaro-dev/FlaroDevChat";
import { FlaroDevPreview } from "@/components/flaro-dev/FlaroDevPreview";
import { FlaroDevVersionList, type FlaroDevVersion } from "@/components/flaro-dev/FlaroDevVersionList";
import { FlaroDevPublishPanel, type FlaroDevDeployment } from "@/components/flaro-dev/FlaroDevPublishPanel";
import { FlaroDevDomainPanel } from "@/components/flaro-dev/FlaroDevDomainPanel";
import { FlaroDevSeoPanel, type FlaroDevSeo } from "@/components/flaro-dev/FlaroDevSeoPanel";
import { ArrowLeft, Loader2, MessageSquare, Eye, History, Globe, Search, Globe2 } from "lucide-react";

export const Route = createFileRoute("/desenvolvedor/projeto/$projectId")({
  component: WorkspacePage,
  head: () => ({
    meta: [
      { title: "Workspace · Flaro Dev" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type Tab = "chat" | "preview" | "panels";
type Panel = "versions" | "publish" | "domain" | "seo";

function WorkspacePage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const getProject = useServerFn(getFlaroDevProject);
  const sendChat = useServerFn(sendFlaroDevChat);
  const restoreVersion = useServerFn(restoreFlaroDevVersion);

  const [data, setData] = useState<{
    project: { id: string; name: string; current_version_id: string | null };
    messages: FlaroDevMessage[];
    versions: FlaroDevVersion[];
    seo: FlaroDevSeo | null;
    deployments: FlaroDevDeployment[];
    currentVersion: { html: string; css: string; js: string } | null;
  } | null>(null);
  const [fetching, setFetching] = useState(true);
  const [sending, setSending] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<Tab>("chat");
  const [panel, setPanel] = useState<Panel>("versions");

  const refetch = useCallback(async () => {
    const res = await getProject({ data: { id: projectId } });
    setData({
      project: res.project as { id: string; name: string; current_version_id: string | null },
      messages: res.messages as FlaroDevMessage[],
      versions: res.versions as FlaroDevVersion[],
      seo: res.seo as FlaroDevSeo | null,
      deployments: res.deployments as FlaroDevDeployment[],
      currentVersion: res.currentVersion,
    });
    setFetching(false);
  }, [getProject, projectId]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", search: { redirect: `/desenvolvedor/projeto/${projectId}` } });
      return;
    }
    refetch().catch(() => setFetching(false));
  }, [loading, user, navigate, projectId, refetch]);

  async function handleSend(text: string) {
    if (!data) return;
    setSending(true);
    // optimistic add
    setData((d) =>
      d
        ? {
            ...d,
            messages: [...d.messages, { role: "user", content: text }],
          }
        : d
    );
    try {
      await sendChat({ data: { projectId, message: text } });
      await refetch();
    } finally {
      setSending(false);
    }
  }

  async function handleRestore(versionId: string) {
    setRestoringId(versionId);
    try {
      await restoreVersion({ data: { projectId, versionId } });
      await refetch();
    } finally {
      setRestoringId(null);
    }
  }

  if (fetching || !data) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-ink-soft" />
      </div>
    );
  }

  const currentVer = data.currentVersion;
  const html = currentVer?.html ?? "";
  const css = currentVer?.css ?? "";
  const js = currentVer?.js ?? "";

  const PanelContent = () => {
    if (panel === "versions") {
      return (
        <FlaroDevVersionList
          versions={data.versions}
          currentVersionId={data.project.current_version_id}
          onRestore={handleRestore}
          restoringId={restoringId}
        />
      );
    }
    if (panel === "publish") {
      return (
        <FlaroDevPublishPanel
          projectId={projectId}
          deployments={data.deployments}
          onPublished={refetch}
          hasVersion={!!currentVer}
        />
      );
    }
    if (panel === "domain") return <FlaroDevDomainPanel projectId={projectId} />;
    return <FlaroDevSeoPanel projectId={projectId} initial={data.seo} />;
  };

  const PanelNav = () => (
    <div className="flex gap-1 p-1 rounded-xl bg-secondary mb-4">
      {[
        { id: "versions" as const, label: "Versões", icon: History },
        { id: "publish" as const, label: "Publicar", icon: Globe },
        { id: "domain" as const, label: "Domínio", icon: Globe2 },
        { id: "seo" as const, label: "SEO", icon: Search },
      ].map((t) => {
        const Icon = t.icon;
        const active = panel === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setPanel(t.id)}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-2 rounded-lg text-xs font-medium transition ${
              active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-[1600px] px-4 md:px-6 py-3 flex items-center gap-3">
          <Link
            to="/desenvolvedor"
            className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Link>
          <div className="h-6 w-px bg-border" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider text-ink-soft">Flaro Dev</div>
            <h1 className="font-display font-bold text-base text-ink truncate">{data.project.name}</h1>
          </div>
        </div>
      </header>

      {/* Mobile tabs */}
      <div className="md:hidden border-b border-border bg-paper">
        <div className="flex">
          {[
            { id: "chat" as const, label: "Chat", icon: MessageSquare },
            { id: "preview" as const, label: "Preview", icon: Eye },
            { id: "panels" as const, label: "Painéis", icon: History },
          ].map((t) => {
            const Icon = t.icon;
            const active = mobileTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setMobileTab(t.id)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 h-11 text-sm font-medium transition border-b-2 ${
                  active ? "border-ink text-ink" : "border-transparent text-ink-soft"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 md:grid md:grid-cols-[380px_1fr_360px] md:gap-0 md:h-[calc(100vh-57px)]">
        {/* Chat column */}
        <div className={`${mobileTab === "chat" ? "block" : "hidden"} md:block border-r border-border h-[calc(100vh-57px-44px)] md:h-full`}>
          <FlaroDevChat messages={data.messages} onSend={handleSend} loading={sending} />
        </div>
        {/* Preview column */}
        <div className={`${mobileTab === "preview" ? "block" : "hidden"} md:block h-[calc(100vh-57px-44px)] md:h-full`}>
          <FlaroDevPreview html={html} css={css} js={js} />
        </div>
        {/* Panels column */}
        <div className={`${mobileTab === "panels" ? "block" : "hidden"} md:block border-l border-border bg-paper overflow-y-auto h-[calc(100vh-57px-44px)] md:h-full`}>
          <div className="p-4">
            <PanelNav />
            <PanelContent />
          </div>
        </div>
      </main>
    </div>
  );
}
