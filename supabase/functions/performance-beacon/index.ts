import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type MetricName = "LCP" | "FCP" | "INP" | "CLS" | "TTFB";
type MetricRating = "good" | "needs-improvement" | "poor";

type PerformanceMetricPayload = {
  name?: unknown;
  value?: unknown;
  rating?: unknown;
  metricId?: unknown;
  navigationType?: unknown;
  path?: unknown;
  connection?: unknown;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const allowedOrigins = (Deno.env.get("PERFORMANCE_BEACON_ALLOWED_ORIGINS") ??
  "https://trustedbums.com,https://www.trustedbums.com,https://pidpoddev.github.io,http://localhost:8080,http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase function environment is missing required project credentials.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function corsHeaders(origin: string | null) {
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0] ?? "*";

  return {
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Origin": allowOrigin,
    "Content-Type": "application/json",
    "Vary": "Origin",
  };
}

function json(status: number, payload: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders(origin),
  });
}

function isAllowedOrigin(origin: string | null) {
  return !origin || allowedOrigins.includes(origin);
}

function cleanMetricName(value: unknown): MetricName | null {
  return value === "LCP" || value === "FCP" || value === "INP" || value === "CLS" || value === "TTFB" ? value : null;
}

function cleanRating(value: unknown): MetricRating | null {
  return value === "good" || value === "needs-improvement" || value === "poor" ? value : null;
}

function cleanPath(value: unknown) {
  if (typeof value !== "string") return "/";
  const path = value.trim().slice(0, 300);
  return path.startsWith("/") ? path : "/";
}

function cleanConnection(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 40) : null;
}

function cleanMetricId(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 128) : null;
}

function cleanNavigationType(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 40) : null;
}

function sanitizedRawPayload(payload: PerformanceMetricPayload) {
  return {
    name: cleanMetricName(payload.name),
    value: typeof payload.value === "number" && Number.isFinite(payload.value) ? Number(payload.value.toFixed(3)) : null,
    rating: cleanRating(payload.rating),
    metricId: cleanMetricId(payload.metricId),
    navigationType: cleanNavigationType(payload.navigationType),
    path: cleanPath(payload.path),
    connection: cleanConnection(payload.connection),
  };
}

async function hashUserAgent(value: string | null) {
  if (!value) return null;
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function parsePayload(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 4096) {
    throw new Error("Payload too large.");
  }

  const body = await request.text();
  if (!body || body.length > 4096) {
    throw new Error("Payload too large.");
  }

  return JSON.parse(body) as PerformanceMetricPayload;
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
    const payload = await parsePayload(request);
    const metricName = cleanMetricName(payload.name);
    const rating = cleanRating(payload.rating);
    const value = typeof payload.value === "number" && Number.isFinite(payload.value) ? payload.value : null;
    const sanitizedPayload = sanitizedRawPayload(payload);

    if (!metricName || !rating || value === null || value < 0 || value >= 600000) {
      return json(400, { error: "Invalid performance metric." }, origin);
    }

    try {
      const { error } = await supabaseAdmin.from("performance_metric_events").insert({
        metric_name: metricName,
        metric_value: sanitizedPayload.value,
        metric_rating: rating,
        metric_id: sanitizedPayload.metricId,
        navigation_type: sanitizedPayload.navigationType,
        page_path: sanitizedPayload.path,
        connection_type: sanitizedPayload.connection,
        deployment_origin: origin,
        user_agent_hash: await hashUserAgent(request.headers.get("user-agent")),
        raw_payload: sanitizedPayload,
      });

      if (error) {
        console.error("Unable to store performance metric", error);
        return json(202, { ok: true, stored: false }, origin);
      }
    } catch (error) {
      console.error("Unable to store performance metric", error);
      return json(202, { ok: true, stored: false }, origin);
    }

    return json(202, { ok: true, stored: true }, origin);
  } catch (error) {
    console.error("Invalid performance beacon request", error);
    return json(400, { error: "Invalid request." }, origin);
  }
});
