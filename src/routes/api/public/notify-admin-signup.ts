import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendTransactionalEmailServer, getAdminEmails } from "@/lib/email/send.server";

export const Route = createFileRoute("/api/public/notify-admin-signup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { userId } = await request.json().catch(() => ({} as any));
          if (!userId || typeof userId !== "string") {
            return new Response("ok"); // silent: don't reveal validation details
          }
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
          return new Response("ok");
        } catch {
          return new Response("ok");
        }
      },
    },
  },
});
