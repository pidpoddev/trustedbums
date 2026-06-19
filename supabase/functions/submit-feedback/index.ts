import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

interface ClaimsResponse {
  sub?: string;
}

interface FeedbackRequest {
  type?: string;
  title?: string;
  description?: string;
  pageUrl?: string;
  pagePath?: string;
  userAgent?: string;
  clientAccessRole?: string;
}

interface ProfileRow {
  id: string;
  company_id: string | null;
  email: string | null;
  full_name: string | null;
  role: string | null;
  is_admin: boolean;
}

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const clerkFrontendApiUrl = Deno.env.get("CLERK_FRONTEND_API_URL");
const microsoftTenantId = Deno.env.get("MICROSOFT_TENANT_ID");
const microsoftClientId = Deno.env.get("MICROSOFT_CLIENT_ID");
const microsoftClientSecret = Deno.env.get("MICROSOFT_CLIENT_SECRET");
const microsoftSenderEmail = Deno.env.get("MICROSOFT_ORGANIZER_EMAIL") ?? "bums@trustedbums.com";
const feedbackNotifyTo = Deno.env.get("FEEDBACK_NOTIFY_TO") ?? "bums@trustedbums.com";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase function environment is missing required project credentials.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function json(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders,
  });
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";

  if (!authorization.startsWith("Bearer ")) {
    throw new Error("Missing bearer token.");
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    throw new Error("Missing bearer token.");
  }

  return token;
}

function decodeBase64Url(segment: string) {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(normalized + padding);
}

function parseJwtPayload(token: string) {
  const payloadSegment = token.split(".")[1] ?? "";

  if (!payloadSegment) {
    throw new Error("The current session token is malformed.");
  }

  return JSON.parse(decodeBase64Url(payloadSegment)) as ClaimsResponse & { iss?: string };
}

function normalizeIssuer(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function resolveAllowedClerkIssuer(issuer?: string) {
  const configuredIssuer = clerkFrontendApiUrl?.trim();

  if (!configuredIssuer) {
    throw new Error("The allowed Clerk issuer is not configured for feedback submission.");
  }

  const allowedIssuer = normalizeIssuer(configuredIssuer);
  if (issuer && normalizeIssuer(issuer) !== allowedIssuer) {
    throw new Error("This Clerk session was issued by an unapproved tenant.");
  }
  return allowedIssuer;
}

async function getCurrentUserId(token: string) {
  const payload = parseJwtPayload(token);
  const allowedIssuer = resolveAllowedClerkIssuer(payload.iss);
  const jwksUrl = new URL("/.well-known/jwks.json", allowedIssuer).toString();
  const { payload: verifiedPayload } = await jose.jwtVerify(
    token,
    jose.createRemoteJWKSet(new URL(jwksUrl)),
    { issuer: allowedIssuer },
  );
  const claims = verifiedPayload as ClaimsResponse;
  const currentUserId = claims.sub?.trim();

  if (!currentUserId) {
    throw new Error("The verified Clerk session did not include a user ID.");
  }

  return currentUserId;
}

function toCleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeFeedbackType(value: unknown) {
  const candidate = typeof value === "string" ? value.trim().toUpperCase() : "";
  return candidate === "BUG" || candidate === "FEATURE" || candidate === "QUESTION" || candidate === "OTHER" ? candidate : "OTHER";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function getProfile(id: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, company_id, email, full_name, role, is_admin")
    .eq("id", id)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw new Error("Unable to read the Trusted Bums user directory.");
  }

  if (!data) {
    throw new Error("Create a portal profile before submitting feedback.");
  }

  return data;
}

async function getMicrosoftAccessToken() {
  if (!microsoftTenantId || !microsoftClientId || !microsoftClientSecret) {
    throw new Error("Microsoft Graph credentials are not configured in Supabase Edge Function secrets.");
  }

  const response = await fetch("https://login.microsoftonline.com/" + microsoftTenantId + "/oauth2/v2.0/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: microsoftClientId,
      client_secret: microsoftClientSecret,
      grant_type: "client_credentials",
      scope: "https://graph.microsoft.com/.default",
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    const detail = [payload.error, payload.error_description].filter(Boolean).join(": ");
    throw new Error(detail || "Microsoft rejected the email credentials with HTTP " + response.status + ".");
  }

  return payload.access_token;
}

async function sendFeedbackEmail(input: {
  accessToken: string;
  feedbackId: string;
  profile: ProfileRow;
  type: string;
  title: string;
  description: string;
  pageUrl: string;
  pagePath: string;
}) {
  const submitter = input.profile.full_name || input.profile.email || input.profile.id;
  const subject = "Trusted Bums feedback: " + input.type + " - " + input.title;
  const bodyHtml = [
    "<div>",
    "<h2>New Trusted Bums feedback</h2>",
    "<p><strong>Type:</strong> " + escapeHtml(input.type) + "</p>",
    "<p><strong>Title:</strong> " + escapeHtml(input.title) + "</p>",
    "<p><strong>Submitted by:</strong> " + escapeHtml(submitter) + "</p>",
    "<p><strong>Email:</strong> " + escapeHtml(input.profile.email ?? "Not provided") + "</p>",
    "<p><strong>Role:</strong> " + escapeHtml(input.profile.role ?? "Not provided") + "</p>",
    "<p><strong>Page:</strong> <a href=\"" + escapeHtml(input.pageUrl) + "\">" + escapeHtml(input.pagePath) + "</a></p>",
    "<p><strong>Feedback ID:</strong> " + escapeHtml(input.feedbackId) + "</p>",
    "<p><strong>Description:</strong></p>",
    "<p>" + escapeHtml(input.description).replace(/\n/g, "<br>") + "</p>",
    "</div>",
  ].join("\n");

  const response = await fetch(
    "https://graph.microsoft.com/v1.0/users/" + encodeURIComponent(microsoftSenderEmail) + "/sendMail",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + input.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject,
          body: {
            contentType: "HTML",
            content: bodyHtml,
          },
          toRecipients: [
            {
              emailAddress: {
                address: feedbackNotifyTo,
              },
            },
          ],
          replyTo: input.profile.email
            ? [
                {
                  emailAddress: {
                    address: input.profile.email,
                  },
                },
              ]
            : [],
        },
        saveToSentItems: true,
      }),
    },
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: { code?: string; message?: string } };
    const detail = [payload.error?.code, payload.error?.message].filter(Boolean).join(": ");
    throw new Error(detail || "Microsoft Graph sendMail failed with HTTP " + response.status + ".");
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  let feedbackId: string | null = null;

  try {
    const token = getBearerToken(request);
    const currentUserId = await getCurrentUserId(token);
    const profile = await getProfile(currentUserId);
    const input = (await request.json().catch(() => ({}))) as FeedbackRequest;
    const type = normalizeFeedbackType(input.type);
    const title = toCleanString(input.title, 180);
    const description = toCleanString(input.description, 5000);
    const pageUrl = toCleanString(input.pageUrl, 1200);
    const pagePath = toCleanString(input.pagePath, 500) || pageUrl;
    const userAgent = toCleanString(input.userAgent, 500);
    const clientAccessRole = toCleanString(input.clientAccessRole, 80) || null;

    if (title.length < 3 || description.length < 10 || !pageUrl) {
      return json(400, { error: "Feedback must include a title, details, and page context." });
    }

    const { data: feedback, error: insertError } = await supabaseAdmin
      .from("feedback_submissions")
      .insert({
        created_by: profile.id,
        company_id: profile.company_id,
        role: profile.role,
        client_access_role: clientAccessRole,
        submitter_name: profile.full_name,
        submitter_email: profile.email,
        type,
        title,
        description,
        page_url: pageUrl,
        page_path: pagePath,
        user_agent: userAgent || null,
      })
      .select("*")
      .single();

    if (insertError || !feedback) {
      throw new Error(insertError?.message || "Unable to save feedback.");
    }

    feedbackId = feedback.id;

    try {
      const accessToken = await getMicrosoftAccessToken();
      await sendFeedbackEmail({ accessToken, feedbackId, profile, type, title, description, pageUrl, pagePath });
      const { data: updated } = await supabaseAdmin
        .from("feedback_submissions")
        .update({ notification_sent_at: new Date().toISOString(), notification_error: null })
        .eq("id", feedbackId)
        .select("*")
        .single();

      return json(200, { feedback: updated ?? feedback, emailSent: true });
    } catch (emailError) {
      const message = emailError instanceof Error ? emailError.message : "Unable to send feedback email.";
      console.error("Feedback email failed", emailError);
      const { data: updated } = await supabaseAdmin
        .from("feedback_submissions")
        .update({ notification_error: message })
        .eq("id", feedbackId)
        .select("*")
        .single();

      return json(200, { feedback: updated ?? feedback, emailSent: false, emailError: message });
    }
  } catch (error) {
    console.error("Unable to submit feedback", error, { feedbackId });
    const message = error instanceof Error ? error.message : "Unable to submit feedback.";
    const authFailure = message.includes("bearer token") || message.includes("session") || message.includes("JWKS");
    return json(authFailure ? 401 : 500, { error: message });
  }
});
