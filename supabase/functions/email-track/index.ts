import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const trackingHashSalt = Deno.env.get("EMAIL_TRACKING_HASH_SALT") ?? "trusted-bums-email-tracking";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase function environment is missing required project credentials.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const transparentGif = Uint8Array.from(
  atob("R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="),
  (char) => char.charCodeAt(0),
);

async function hashIp(value: string) {
  const bytes = new TextEncoder().encode(`${trackingHashSalt}:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getClientIp(request: Request) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
}

async function recordEvent(request: Request, eventType: "OPEN" | "CLICK", deliveryId: string, clickedUrl: string | null) {
  const { data: delivery, error: deliveryError } = await supabaseAdmin
    .from("admin_email_deliveries")
    .select("id, recipient_email, recipient_profile_id, opened_at, clicked_at, engagement_score")
    .eq("id", deliveryId)
    .maybeSingle<{
      id: string;
      recipient_email: string;
      recipient_profile_id: string | null;
      opened_at: string | null;
      clicked_at: string | null;
      engagement_score: number;
    }>();

  if (deliveryError || !delivery) {
    return;
  }

  const now = new Date().toISOString();
  await supabaseAdmin.from("admin_email_events").insert({
    delivery_id: delivery.id,
    event_type: eventType,
    recipient_email: delivery.recipient_email,
    recipient_profile_id: delivery.recipient_profile_id,
    clicked_url: clickedUrl,
    user_agent: request.headers.get("user-agent"),
    ip_hash: await hashIp(getClientIp(request)),
  });

  const update: Record<string, unknown> = {
    last_engaged_at: now,
    engagement_score: Number(delivery.engagement_score ?? 0) + (eventType === "CLICK" ? 3 : 1),
  };

  if (eventType === "OPEN" && !delivery.opened_at) update.opened_at = now;
  if (eventType === "CLICK" && !delivery.clicked_at) update.clicked_at = now;

  await supabaseAdmin.from("admin_email_deliveries").update(update).eq("id", delivery.id);
}

Deno.serve(async (request) => {
  const url = new URL(request.url);
  const deliveryId = url.searchParams.get("d") ?? "";

  if (!deliveryId) {
    return new Response("missing delivery id", { status: 400 });
  }

  if (url.pathname.endsWith("/click")) {
    const targetUrl = url.searchParams.get("u") ?? "https://trustedbums.com";
    await recordEvent(request, "CLICK", deliveryId, targetUrl).catch((error) => console.error("Unable to record click", error));
    return Response.redirect(targetUrl, 302);
  }

  await recordEvent(request, "OPEN", deliveryId, null).catch((error) => console.error("Unable to record open", error));
  return new Response(transparentGif, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, max-age=0",
    },
  });
});
