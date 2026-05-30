import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type ContactInterest = "CLIENT" | "BUM" | "GENERAL";

interface ContactSubmissionInput {
  name?: unknown;
  email?: unknown;
  companyName?: unknown;
  interest?: unknown;
  targetAccounts?: unknown;
  message?: unknown;
  website?: unknown;
  turnstileToken?: unknown;
  idempotencyKey?: unknown;
}

interface TurnstileResponse {
  success?: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
}

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const turnstileSecretKey = Deno.env.get("CONTACT_TURNSTILE_SECRET_KEY") ?? Deno.env.get("TURNSTILE_SECRET_KEY");
const allowUnverified = Deno.env.get("CONTACT_FORM_ALLOW_UNVERIFIED") === "true";
const allowedOrigins = (Deno.env.get("CONTACT_FORM_ALLOWED_ORIGINS") ??
  "https://trustedbums.com,https://www.trustedbums.com,http://localhost:8080,http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedHostnames = new Set(
  allowedOrigins
    .map((origin) => {
      try {
        return new URL(origin).hostname;
      } catch {
        return "";
      }
    })
    .filter(Boolean),
);

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase function environment is missing required project credentials.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function corsHeaders(origin: string | null) {
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0] ?? "https://trustedbums.com";
  return {
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Origin": allowOrigin,
    "Content-Type": "application/json",
    "Vary": "Origin",
  };
}

function json(status: number, payload: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders(origin) });
}

function isAllowedOrigin(origin: string | null) {
  return !origin || allowedOrigins.includes(origin);
}

function isAllowedTurnstileResult(turnstile: TurnstileResponse) {
  return (
    turnstile.success === true &&
    turnstile.action === "contact" &&
    typeof turnstile.hostname === "string" &&
    (turnstile.hostname === "unverified-local" || allowedHostnames.has(turnstile.hostname))
  );
}

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanNullableString(value: unknown, maxLength: number) {
  const cleaned = cleanString(value, maxLength);
  return cleaned || null;
}

function cleanInterest(value: unknown): ContactInterest {
  return value === "BUM" || value === "GENERAL" ? value : "CLIENT";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getClientIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function validateTurnstile(token: string, remoteIp: string, idempotencyKey: string | null) {
  if (!turnstileSecretKey) {
    if (allowUnverified) {
      return { success: true, hostname: "unverified-local", action: "contact" } satisfies TurnstileResponse;
    }
    return { success: false, "error-codes": ["missing-secret"] } satisfies TurnstileResponse;
  }

  const payload: Record<string, string> = {
    secret: turnstileSecretKey,
    response: token,
    remoteip: remoteIp,
  };

  if (idempotencyKey) {
    payload.idempotency_key = idempotencyKey;
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return (await response.json().catch(() => ({ success: false, "error-codes": ["invalid-response"] }))) as TurnstileResponse;
}

async function assertRateLimit(email: string, abuseFingerprint: string) {
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const [emailResult, fingerprintResult] = await Promise.all([
    supabaseAdmin
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", since),
    supabaseAdmin
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .eq("abuse_fingerprint", abuseFingerprint)
      .gte("created_at", since),
  ]);

  if (emailResult.error) throw emailResult.error;
  if (fingerprintResult.error) throw fingerprintResult.error;

  if ((emailResult.count ?? 0) >= 3 || (fingerprintResult.count ?? 0) >= 5) {
    throw new Error("Too many contact submissions. Please wait before trying again.");
  }
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed." }, origin);
  }

  if (!isAllowedOrigin(origin)) {
    return json(403, { error: "Origin is not allowed." }, origin);
  }

  try {
    const input = (await request.json().catch(() => ({}))) as ContactSubmissionInput;

    if (cleanString(input.website, 200)) {
      return json(200, { submitted: true, skipped: true }, origin);
    }

    const name = cleanString(input.name, 160);
    const email = cleanString(input.email, 180).toLowerCase();
    const message = cleanString(input.message, 4000);
    const token = cleanString(input.turnstileToken, 2048);
    const idempotencyKey = cleanNullableString(input.idempotencyKey, 80);
    const remoteIp = getClientIp(request);
    const userAgent = cleanNullableString(request.headers.get("user-agent"), 500);
    const abuseFingerprint = await sha256([remoteIp, userAgent ?? "", email].join("|"));

    if (name.length < 2 || !isEmail(email) || message.length < 10) {
      return json(400, { error: "The contact submission is missing required fields." }, origin);
    }

    const turnstile = await validateTurnstile(token, remoteIp, idempotencyKey);
    if (!isAllowedTurnstileResult(turnstile)) {
      console.warn("Rejected contact submission verification", {
        errorCodes: turnstile["error-codes"] ?? [],
        action: turnstile.action ?? null,
        hostname: turnstile.hostname ?? null,
        emailHash: await sha256(email),
      });
      return json(403, { error: "Unable to verify this submission." }, origin);
    }

    await assertRateLimit(email, abuseFingerprint);

    const { data, error } = await supabaseAdmin
      .from("contact_submissions")
      .insert({
        name,
        email,
        company_name: cleanNullableString(input.companyName, 180),
        interest: cleanInterest(input.interest),
        target_accounts: cleanNullableString(input.targetAccounts, 1000),
        message,
        source: "homepage",
        user_agent: userAgent,
        status: "NEW",
        abuse_fingerprint: abuseFingerprint,
        turnstile_success: true,
        turnstile_hostname: cleanNullableString(turnstile.hostname, 255),
        turnstile_action: cleanNullableString(turnstile.action, 80),
        turnstile_error_codes: turnstile["error-codes"] ?? [],
      })
      .select("id")
      .single<{ id: string }>();

    if (error) throw error;

    const emailResult = await supabaseAdmin.functions.invoke("send-website-email", {
      body: {
        template: "contact-submission",
        name,
        email,
        companyName: cleanNullableString(input.companyName, 180) ?? undefined,
        interest: cleanInterest(input.interest),
        targetAccounts: cleanNullableString(input.targetAccounts, 1000) ?? undefined,
        message,
      },
    });

    if (emailResult.error) {
      console.error("Unable to send contact notification", emailResult.error);
      await supabaseAdmin
        .from("contact_submissions")
        .update({ notification_error: emailResult.error.message ?? "Unable to send notification." })
        .eq("id", data.id);
      return json(202, { submitted: true, notificationSent: false }, origin);
    }

    await supabaseAdmin
      .from("contact_submissions")
      .update({ notification_sent_at: new Date().toISOString(), notification_error: null })
      .eq("id", data.id);

    return json(201, { submitted: true, notificationSent: true }, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit contact request.";
    const status = /too many/i.test(message) ? 429 : /not configured|missing-secret/i.test(message) ? 503 : 500;
    console.error("Unable to submit contact request", error);
    return json(status, { error: message }, origin);
  }
});
