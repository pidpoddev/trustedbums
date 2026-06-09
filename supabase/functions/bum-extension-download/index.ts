import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

interface ClaimsResponse {
  sub?: string;
}

interface ProfileRow {
  id: string;
  role: string | null;
  access_status: string | null;
  disabled_at: string | null;
}

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const clerkFrontendApiUrl = Deno.env.get("CLERK_FRONTEND_API_URL");
const extensionPackageKeyBase64 = Deno.env.get("BUM_EXTENSION_PACKAGE_KEY_B64");
const extensionPackageUrl =
  Deno.env.get("BUM_EXTENSION_PACKAGE_URL") ??
  "https://raw.githubusercontent.com/pidpoddev/trustedbums/main/supabase/functions/bum-extension-download/trustedbums-extension.zip.enc";

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
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
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

function resolveClerkJwksUrl(issuer?: string) {
  const candidate = issuer?.trim() || clerkFrontendApiUrl?.trim();

  if (!candidate) {
    throw new Error("Unable to determine the Clerk JWKS endpoint for this session.");
  }

  return new URL("/.well-known/jwks.json", candidate).toString();
}

async function getCurrentUserId(token: string) {
  const payload = parseJwtPayload(token);
  const jwksUrl = resolveClerkJwksUrl(payload.iss);
  const { payload: verifiedPayload } = await jose.jwtVerify(
    token,
    jose.createRemoteJWKSet(new URL(jwksUrl)),
    payload.iss ? { issuer: payload.iss } : undefined,
  );
  const claims = verifiedPayload as ClaimsResponse;
  const currentUserId = claims.sub?.trim();

  if (!currentUserId) {
    throw new Error("The verified Clerk session did not include a user ID.");
  }

  return currentUserId;
}

async function getProfile(id: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, role, access_status, disabled_at")
    .eq("id", id)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw new Error("Unable to read the Trusted Bums user directory.");
  }

  if (!data) {
    throw new Error("Create a portal profile before downloading the extension.");
  }

  return data;
}

function base64ToBytes(value: string) {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function decryptExtensionPackage(encryptedPackageBase64: string) {
  if (!extensionPackageKeyBase64) {
    throw new Error("The extension package key is not configured.");
  }

  const encryptedPackage = base64ToBytes(encryptedPackageBase64);
  const iv = encryptedPackage.slice(0, 12);
  const tag = encryptedPackage.slice(12, 28);
  const ciphertext = encryptedPackage.slice(28);
  const key = await crypto.subtle.importKey("raw", base64ToBytes(extensionPackageKeyBase64), "AES-GCM", false, [
    "decrypt",
  ]);

  return new Uint8Array(
    await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
        tagLength: 128,
      },
      key,
      new Uint8Array([...ciphertext, ...tag]),
    ),
  );
}

async function readExtensionPackage() {
  const response = await fetch(extensionPackageUrl, {
    headers: {
      Accept: "text/plain, application/octet-stream",
    },
  });

  if (!response.ok) {
    throw new Error("The extension package is not available.");
  }

  return decryptExtensionPackage(await response.text());
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "GET") {
    return json(405, { error: "Method not allowed." });
  }

  try {
    const token = getBearerToken(request);
    const currentUserId = await getCurrentUserId(token);
    const profile = await getProfile(currentUserId);

    if (profile.role !== "BUM" || profile.access_status !== "APPROVED" || profile.disabled_at) {
      return json(403, { error: "Only approved Bum accounts can download this extension package." });
    }

    const zipBytes = await readExtensionPackage();

    return new Response(zipBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Cache-Control": "private, no-store",
        "Content-Disposition": 'attachment; filename="trustedbums-extension.zip"',
        "Content-Type": "application/zip",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return json(401, { error: error instanceof Error ? error.message : "Unable to verify this session." });
  }
});
