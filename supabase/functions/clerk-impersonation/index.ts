import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

type ImpersonationAction = "start" | "stop";

interface ClaimsResponse {
  sub?: string;
  act?: {
    sub?: string;
  } | null;
}

interface ValidatedSession {
  claims: ClaimsResponse;
  currentUserId: string;
}

interface ProfileRow {
  id: string;
  email: string | null;
  role: string | null;
  is_admin: boolean;
}

interface ActorTokenResponse {
  token: string;
  url?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabasePublicKey = Deno.env.get("SB_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const clerkSecretKey = Deno.env.get("CLERK_SECRET_KEY");
const clerkFrontendApiUrl = Deno.env.get("CLERK_FRONTEND_API_URL");

if (!supabaseUrl || !supabasePublicKey || !supabaseServiceRoleKey) {
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
  return atob(`${normalized}${padding}`);
}

function parseJwtPayload(token: string) {
  const payloadSegment = token.split(".")[1] ?? "";

  if (!payloadSegment) {
    throw new Error("The current session token is malformed.");
  }

  return JSON.parse(decodeBase64Url(payloadSegment)) as ClaimsResponse & {
    iss?: string;
  };
}

function normalizeIssuer(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function resolveAllowedClerkIssuer(issuer?: string) {
  const configuredIssuer = clerkFrontendApiUrl?.trim();

  if (!configuredIssuer) {
    throw new Error("The allowed Clerk issuer is not configured for Clerk impersonation.");
  }

  const allowedIssuer = normalizeIssuer(configuredIssuer);
  if (issuer && normalizeIssuer(issuer) !== allowedIssuer) {
    throw new Error("This Clerk session was issued by an unapproved tenant.");
  }
  return allowedIssuer;
}

async function getClaims(token: string) {
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

  return {
    claims,
    currentUserId,
  } satisfies ValidatedSession;
}

async function getProfile(id: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, role, is_admin")
    .eq("id", id)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw new Error("Unable to read the Trusted Bums user directory.");
  }

  return data;
}

async function callClerk(path: string, body: Record<string, unknown>) {
  if (!clerkSecretKey) {
    throw new Error("Set CLERK_SECRET_KEY in Supabase Edge Function secrets before using impersonation.");
  }

  const response = await fetch(`https://api.clerk.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clerkSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as
    | ActorTokenResponse
    | {
        errors?: Array<{ long_message?: string; message?: string }>;
      };

  if (!response.ok) {
    const apiError = payload.errors?.[0]?.long_message || payload.errors?.[0]?.message;
    throw new Error(apiError || "Clerk rejected the impersonation request.");
  }

  return payload as ActorTokenResponse;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  try {
    const token = getBearerToken(request);
    const session = await getClaims(token);
    const claims = session.claims;
    const currentUserId = session.currentUserId;

    if (!currentUserId) {
      return json(401, { error: "The current session does not include a user ID." });
    }

    const body = (await request.json().catch(() => ({}))) as {
      action?: ImpersonationAction;
      targetUserId?: string;
    };

    if (body.action === "stop") {
      const actorUserId = claims.act?.sub?.trim();

      if (!actorUserId) {
        return json(400, { error: "This session is not impersonating another user." });
      }

      const signInToken = await callClerk("/sign_in_tokens", {
        user_id: actorUserId,
        expires_in_seconds: 600,
      });

      return json(200, {
        action: "stop",
        ticket: signInToken.token,
        url: signInToken.url,
        actorUserId,
      });
    }

    if (body.action !== "start") {
      return json(400, { error: "Unsupported impersonation action." });
    }

    if (claims.act?.sub) {
      return json(400, { error: "Exit the current impersonation before starting a new one." });
    }

    const currentProfile = await getProfile(currentUserId);

    if (!currentProfile || (!currentProfile.is_admin && currentProfile.role !== "ADMIN")) {
      return json(403, { error: "Only admin users can impersonate other accounts." });
    }

    const targetUserId = body.targetUserId?.trim();

    if (!targetUserId) {
      return json(400, { error: "Choose a target user to impersonate." });
    }

    if (targetUserId === currentUserId) {
      return json(400, { error: "You are already signed in as that user." });
    }

    const targetProfile = await getProfile(targetUserId);

    if (!targetProfile) {
      return json(404, { error: "That user has not synced into the Trusted Bums portal yet." });
    }

    const actorToken = await callClerk("/actor_tokens", {
      user_id: targetUserId,
      expires_in_seconds: 600,
      actor: {
        sub: currentUserId,
      },
    });

    return json(200, {
      action: "start",
      ticket: actorToken.token,
      url: actorToken.url,
      target: {
        id: targetProfile.id,
        email: targetProfile.email,
        role: targetProfile.role,
      },
    });
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : "Unexpected impersonation error.",
    });
  }
});
