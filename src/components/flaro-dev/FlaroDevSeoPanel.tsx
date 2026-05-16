import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Search } from "lucide-react";
import { updateFlaroDevSeo } from "@/lib/flaro-dev.functions";

export type FlaroDevSeo = {
  title: string;
  description: string;
  og_image_url: string | null;
  favicon_url: string | null;
};

export function FlaroDevSeoPanel({
  projectId,
  initial,
}: {
  projectId: string;
  initial: FlaroDevSeo | null;
}) {
  const save = useServerFn(updateFlaroDevSeo);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(initial?.og_image_url ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await save({
        data: {
          projectId,
          title,
          description,
          ogImageUrl: ogImageUrl || null,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
          <Search className="h-4 w-4" /> SEO
        </h3>
        <p className="text-sm text-ink-soft mt-1">
          Como sua página aparece em buscas e redes sociais.
        </p>
      </div>
      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-medium text-ink-soft">Título</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={180}
            className="mt-1 w-full h-10 px-3 rounded-lg border border-border bg-paper text-sm text-ink outline-none focus:border-ink/40"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink-soft">Descrição</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={400}
            rows={3}
            className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-paper text-sm text-ink outline-none focus:border-ink/40 resize-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink-soft">URL da imagem de capa (og:image)</span>
          <input
            type="url"
            value={ogImageUrl}
            onChange={(e) => setOgImageUrl(e.target.value)}
            placeholder="https://…"
            className="mt-1 w-full h-10 px-3 rounded-lg border border-border bg-paper text-sm text-ink outline-none focus:border-ink/40"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-ink text-paper font-semibold hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saved ? "Salvo!" : "Salvar SEO"}
      </button>
    </form>
  );
}
