import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getPublicFlaroDevSite = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1).max(80) }).parse(input)
  )
  .handler(async ({ data }) => {
    const { data: dep } = await supabaseAdmin
      .from("flaro_dev_deployments")
      .select("id,slug,version_id,project_id,published_at")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (!dep) return { found: false as const };

    const [{ data: version }, { data: seo }, { data: project }] = await Promise.all([
      supabaseAdmin
        .from("flaro_dev_versions")
        .select("html,css,js")
        .eq("id", dep.version_id)
        .maybeSingle(),
      supabaseAdmin
        .from("flaro_dev_seo")
        .select("title,description,og_image_url,favicon_url")
        .eq("project_id", dep.project_id)
        .maybeSingle(),
      supabaseAdmin
        .from("flaro_dev_projects")
        .select("name")
        .eq("id", dep.project_id)
        .maybeSingle(),
    ]);

    if (!version) return { found: false as const };

    return {
      found: true as const,
      html: version.html,
      css: version.css,
      js: version.js,
      seo: seo ?? null,
      projectName: project?.name ?? "Flaro Dev",
      publishedAt: dep.published_at,
    };
  });
