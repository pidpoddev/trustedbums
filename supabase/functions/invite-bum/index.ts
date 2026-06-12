import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";
import { normalizeInvitationRedirectUrl } from "../_shared/invitationRedirect.ts";

interface ClaimsResponse {
  sub?: string;
}

interface ProfileRow {
  id: string;
  email: string | null;
  role: string | null;
  is_admin: boolean;
}

interface BumProfileRow {
  user_id: string;
  is_managing_bum: boolean;
  managing_bum_commission_percent: number;
}

interface ClerkInvitationResponse {
  id?: string;
  email_address?: string;
  status?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const clerkSecretKey = Deno.env.get("CLERK_SECRET_KEY");
const clerkFrontendApiUrl = Deno.env.get("CLERK_FRONTEND_API_URL");
const invitationRedirectAllowedOrigins = Deno.env.get("INVITATION_REDIRECT_ALLOWED_ORIGINS");
const invitationRedirectFallbackUrl = Deno.env.get("INVITATION_REDIRECT_FALLBACK_URL");

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

function resolveClerkJwksUrl(issuer?: string) {
  const candidate = issuer?.trim() || clerkFrontendApiUrl?.trim();

  if (!candidate) {
    throw new Error("Unable to determine the Clerk JWKS endpoint for this session.");
  }

  return new URL("/.well-known/jwks.json", candidate).toString();
}

async function getCurrentProfile(token: string) {
  const payload = parseJwtPayload(token);
  const jwksUrl = resolveClerkJwksUrl(payload.iss);
  const { payload: verifiedPayload } = await jose.jwtVerify(
    token,
    jose.createRemoteJWKSet(new URL(jwksUrl)),
    payload.iss
      ? {
          issuer: payload.iss,
        }
      : undefined,
  );

  const currentUserId = (verifiedPayload as ClaimsResponse).sub?.trim();

  if (!currentUserId) {
    throw new Error("The verified Clerk session did not include a user ID.");
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, role, is_admin")
    .eq("id", currentUserId)
    .maybeSingle<ProfileRow>();

  if (error || !data) {
    throw new Error("Unable to verify the current Trusted Bums profile.");
  }

  return data;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function createClerkInvitation(input: {
  email: string;
  name?: string;
  note?: string;
  redirectUrl?: string;
  invitedBy: string;
  managingBumUserId?: string | null;
}) {
  if (!clerkSecretKey) {
    throw new Error("Set CLERK_SECRET_KEY in Supabase Edge Function secrets before inviting Bums.");
  }

  const response = await fetch("https://api.clerk.com/v1/invitations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clerkSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: input.email,
      notify: true,
      ignore_existing: false,
      redirect_url: input.redirectUrl,
      public_metadata: {
        role: "BUM",
        signupIntent: "BUM",
      },
      private_metadata: {
        invitedBy: input.invitedBy,
        invitedName: input.name || undefined,
        inviteNote: input.note || undefined,
        managingBumUserId: input.managingBumUserId || undefined,
      },
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as
    | ClerkInvitationResponse
    | {
        errors?: Array<{ long_message?: string; message?: string }>;
      };

  if (!response.ok) {
    const apiError = payload.errors?.[0]?.long_message || payload.errors?.[0]?.message;
    throw new Error(apiError || `Clerk rejected the invitation with HTTP ${response.status}.`);
  }

  return payload as ClerkInvitationResponse;
}

async function getManagingBumProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("bum_profiles")
    .select("user_id, is_managing_bum, managing_bum_commission_percent")
    .eq("user_id", userId)
    .maybeSingle<BumProfileRow>();

  if (error) {
    throw error;
  }

  return data;
}

async function createPendingTeamMembership(input: {
  managingBumUserId: string;
  invitedBy: string;
  email: string;
  note?: string;
  clerkInvitationId?: string | null;
  managerCommissionPercent: number;
}) {
  const { data: existingProfile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, role")
    .ilike("email", input.email)
    .maybeSingle<{ id: string; role: string | null }>();

  if (profileError) {
    throw profileError;
  }

  const payload = {
    managing_bum_user_id: input.managingBumUserId,
    member_bum_user_id: existingProfile?.role === "BUM" ? existingProfile.id : null,
    status: existingProfile?.role === "BUM" ? "ACTIVE" : "INVITED",
    invited_by: input.invitedBy,
    manager_commission_percent: input.managerCommissionPercent,
    invite_email: input.email,
    clerk_invitation_id: input.clerkInvitationId ?? null,
    notes: input.note || null,
  };

  if (existingProfile?.role === "BUM") {
    const { data: existingMembership, error: existingMembershipError } = await supabaseAdmin
      .from("bum_team_memberships")
      .select("id")
      .eq("managing_bum_user_id", input.managingBumUserId)
      .eq("member_bum_user_id", existingProfile.id)
      .maybeSingle<{ id: string }>();

    if (existingMembershipError) {
      throw existingMembershipError;
    }

    const write = existingMembership
      ? await supabaseAdmin.from("bum_team_memberships").update(payload).eq("id", existingMembership.id)
      : await supabaseAdmin.from("bum_team_memberships").insert(payload);

    if (write.error) {
      throw write.error;
    }
    return;
  }

  const { data: existingInvite, error: existingInviteError } = await supabaseAdmin
    .from("bum_team_memberships")
    .select("id")
    .eq("managing_bum_user_id", input.managingBumUserId)
    .ilike("invite_email", input.email)
    .is("member_bum_user_id", null)
    .neq("status", "REMOVED")
    .maybeSingle<{ id: string }>();

  if (existingInviteError) {
    throw existingInviteError;
  }

  const write = existingInvite
    ? await supabaseAdmin.from("bum_team_memberships").update(payload).eq("id", existingInvite.id)
    : await supabaseAdmin.from("bum_team_memberships").insert(payload);

  if (write.error) {
    throw write.error;
  }
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
    const currentProfile = await getCurrentProfile(token);

    const managingBumProfile = currentProfile.role === "BUM" ? await getManagingBumProfile(currentProfile.id) : null;
    const isAdminInvite = currentProfile.is_admin || currentProfile.role === "ADMIN";
    const isManagingBumInvite = Boolean(managingBumProfile?.is_managing_bum);

    if (!isAdminInvite && !isManagingBumInvite) {
      return json(403, { error: "Only Admins and Managing Bums can invite Bums." });
    }

    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      name?: string;
      note?: string;
      redirectUrl?: string;
    };
    const email = body.email?.trim().toLowerCase() ?? "";
    const name = body.name?.trim() ?? "";
    const note = body.note?.trim() ?? "";
    const redirectUrl = normalizeInvitationRedirectUrl(body.redirectUrl, request, {
      allowedOrigins: invitationRedirectAllowedOrigins,
      fallbackUrl: invitationRedirectFallbackUrl,
      clerkFrontendApiUrl,
    });

    if (!isValidEmail(email)) {
      return json(400, { error: "Enter a valid Bum email address." });
    }

    const invitation = await createClerkInvitation({
      email,
      name,
      note,
      redirectUrl,
      invitedBy: currentProfile.id,
      managingBumUserId: isManagingBumInvite ? currentProfile.id : null,
    });

    if (isManagingBumInvite && managingBumProfile) {
      await createPendingTeamMembership({
        managingBumUserId: currentProfile.id,
        invitedBy: currentProfile.id,
        email,
        note,
        clerkInvitationId: invitation.id ?? null,
        managerCommissionPercent: Number(managingBumProfile.managing_bum_commission_percent ?? 0),
      });
    }

    await supabaseAdmin.from("audit_events").insert({
      user_id: currentProfile.id,
      event_type: "bum_invitation_sent",
      entity_type: "clerk_invitations",
      event_data: {
        clerkInvitationId: invitation.id ?? null,
        email,
        name: name || null,
        note: note || null,
        status: invitation.status ?? null,
        managingBumUserId: isManagingBumInvite ? currentProfile.id : null,
      },
    });

    return json(200, {
      invited: true,
      invitationId: invitation.id ?? null,
      status: invitation.status ?? null,
      email,
      teamAttached: isManagingBumInvite,
    });
  } catch (error) {
    return json(400, {
      error: error instanceof Error ? error.message : "Unable to invite this Bum.",
    });
  }
});
