import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendTransactionalEmailServer, getAdminEmails } from "@/lib/email/send.server";

// NOTE: kept under /api/public/* for backward-compat with existing client code,
// but authentication is now REQUIRED. The endpoint only notifies admins about
// the *authenticated caller's own* signup — userId comes from the verified
// JWT, never from the request body. This prevents anonymous abuse and
// admin-inbox spam via arbitrary userIds.
export const Route = createFileRoute("/api/public/notify-admin-signup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authHeader = request.headers.get("Authorization");
          if (!authHeader?.startsWith("Bearer ")) {
            return new Response("Unauthorized", { status: 401 });
          }
          const token = authHeader.slice("Bearer ".length).trim();
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          if (!supabaseUrl || !serviceKey) {
            return new Response("Server misconfigured", { status: 500 });
          }
          const authClient = createClient(supabaseUrl, serviceKey);
          const { data: { user }, error: authErr } = await authClient.auth.getUser(token);
          if (authErr || !user) {
            return new Response("Unauthorized", { status: 401 });
          }

          const userId = user.id;

          // Idempotency: only fire the admin notification once per user.
          // Subsequent calls (re-verifications, page reloads) are no-ops.
          const { data: existing } = await supabaseAdmin
            .from("events")
            .select("id")
            .eq("event_type", "user.signup_admin_notified")
            .eq("user_id", userId)
            .limit(1)
            .maybeSingle();
          if (existing) return new Response("ok");

          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("name,email,whatsapp,business_name,business_segment")
            .eq("user_id", userId)
            .maybeSingle();
          if (!profile) return new Response("ok");

          const admins = await getAdminEmails().catch(() => [] as string[]);
          for (const adminEmail of admins) {
            await sendTransactionalEmailServer({
              templateName: "admin-new-signup",
              recipientEmail: adminEmail,
              idempotencyKey: `signup-${userId}-${adminEmail}`,
              templateData: {
                name: profile.name,
                email: profile.email,
                whatsapp: profile.whatsapp,
                businessName: profile.business_name,
                businessSegment: profile.business_segment,
              },
            }).catch(() => {});
          }

          await supabaseAdmin
            .from("events")
            .insert({ event_type: "user.signup_admin_notified", user_id: userId, event_data: {} })
            .then(() => {}, () => {});

          return new Response("ok");
        } catch {
          return new Response("ok");
        }
      },
    },
  },
});
