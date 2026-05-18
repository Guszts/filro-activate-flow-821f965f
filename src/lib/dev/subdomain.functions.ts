import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";
import { getPublicSiteBySlug } from "@/lib/dev/generator.functions";

const RESERVED = new Set(["www", "setup", "app", "api", "admin", "dev", "id-preview", "preview", "filro-activate-flow"]);

export const detectSubdomainSite = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const host = getRequestHost();
    if (!host) return { site: null };
    const m = host.toLowerCase().match(/^([a-z0-9-]+)\.filro\.site$/);
    if (!m) return { site: null };
    const sub = m[1];
    if (RESERVED.has(sub)) return { site: null };
    const res = await getPublicSiteBySlug({ data: { slug: sub } }).catch(() => ({ site: null }));
    return { site: (res as any)?.site ?? null };
  } catch {
    return { site: null };
  }
});
