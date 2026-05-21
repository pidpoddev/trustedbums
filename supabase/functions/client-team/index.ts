import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

type ClientAccessRole = "CLIENT_ADMIN" | "CLIENT_FINANCE" | "CLIENT_MEMBER";
type Action = "list" | "invite" | "update_role";

interface ClaimsResponse { sub?: string }
interface CompanyRow { id: string; name: string }
interface ProfileRow {
  id: string;
  company_id: string | null;
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_admin: boolean;
  client_access_role: ClientAccessRole | null;
  last_sign_in_at: string | null;
  created_at: string;
  companies?: CompanyRow | null;
}
interface ClerkEmailAddress { id?: string; email_address?: string }
interface ClerkUser {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[];
  public_metadata?: Record<string, unknown>;
  private_metadata?: Record<string, unknown>;
  unsafe_metadata?: Record<string, unknown>;
  created_at?: number;
  last_sign_in_at?: number | null;
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

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase function environment is missing required project credentials.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function json(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders });
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) throw new Error("Missing bearer token.");
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) throw new Error("Missing bearer token.");
  return token;
}

function decodeBase64Url(segment: string) {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(normalized + padding);
}

function parseJwtPayload(token: string) {
  const payloadSegment = token.split(".")[1] ?? "";
  if (!payloadSegment) throw new Error("The current session token is malformed.");
  return JSON.parse(decodeBase64Url(payloadSegment)) as ClaimsResponse & { iss?: string };
}

function resolveClerkJwksUrl(issuer?: string) {
  const candidate = issuer?.trim() || clerkFrontendApiUrl?.trim();
  if (!candidate) throw new Error("Unable to determine the Clerk JWKS endpoint for this session.");
  return new URL("/.well-known/jwks.json", candidate).toString();
}

function cleanString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readClientAccessRole(value: unknown): ClientAccessRole | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase().replace(/[^A-Z]+/g, "_");
  if (normalized === "CLIENT_ADMIN" || normalized === "ADMIN") return "CLIENT_ADMIN";
  if (normalized === "CLIENT_FINANCE" || normalized === "FINANCE") return "CLIENT_FINANCE";
  if (normalized === "CLIENT_MEMBER" || normalized === "MEMBER") return "CLIENT_MEMBER";
  return null;
}

function primaryEmail(user: ClerkUser) {
  const primary = (user.email_addresses ?? []).find((email) => email.id && email.id === user.primary_email_address_id);
  return (primary?.email_address ?? user.email_addresses?.[0]?.email_address ?? "").trim().toLowerCase();
}

function displayName(user: ClerkUser, email: string) {
  const fullName = cleanString(user.full_name) ?? [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return fullName || email;
}

function timestampMsToIso(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? new Date(value).toISOString() : null;
}

function normalizeRedirectUrl(value: unknown, request: Request) {
  if (typeof value === "string" && value.trim()) return value.trim();
  const origin = request.headers.get("origin");
  return origin ? new URL("/login", origin).toString() : undefined;
}

async function getCurrentProfile(token: string) {
  const payload = parseJwtPayload(token);
  const { payload: verifiedPayload } = await jose.jwtVerify(
    token,
    jose.createRemoteJWKSet(new URL(resolveClerkJwksUrl(payload.iss))),
    payload.iss ? { issuer: payload.iss } : undefined,
  );
  const currentUserId = (verifiedPayload as ClaimsResponse).sub?.trim();
  if (!currentUserId) throw new Error("The verified Clerk session did not include a user ID.");

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, company_id, full_name, email, role, is_admin, client_access_role, last_sign_in_at, created_at, companies(id, name)")
    .eq("id", currentUserId)
    .maybeSingle<ProfileRow>();
  if (error || !data) throw new Error("Unable to verify the current Trusted Bums profile.");
  return data;
}

function assertClientAdmin(profile: ProfileRow) {
  if (profile.role !== "CLIENT" || !profile.company_id || profile.client_access_role !== "CLIENT_ADMIN") {
    throw new Error("Only client admins can manage their company team.");
  }
}

async function clerkFetch(path: string, init: RequestInit = {}) {
  if (!clerkSecretKey) throw new Error("Set CLERK_SECRET_KEY in Supabase Edge Function secrets before managing client teams.");
  const response = await fetch("https://api.clerk.com/v1" + path, {
    ...init,
    headers: {
      Authorization: "Bearer " + clerkSecretKey,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = Array.isArray(payload?.errors)
      ? payload.errors[0]?.long_message || payload.errors[0]?.message
      : undefined;
    throw new Error(error || `Clerk rejected the request with HTTP ${response.status}.`);
  }
  return payload;
}

async function listClerkUsersByEmail(email: string) {
  const params = new URLSearchParams({ limit: "10", offset: "0" });
  params.append("email_address[]", email);
  const payload = await clerkFetch("/users?" + params.toString());
  return (Array.isArray(payload) ? payload : payload.data ?? []) as ClerkUser[];
}

async function updateClerkMetadata(userId: string, company: CompanyRow, clientAccessRole: ClientAccessRole, updatedBy: string) {
  return (await clerkFetch("/users/" + encodeURIComponent(userId) + "/metadata", {
    method: "PATCH",
    body: JSON.stringify({
      public_metadata: {
        role: "CLIENT",
        signupIntent: "CLIENT",
        companyId: company.id,
        clientCompanyId: company.id,
        companyName: company.name,
        clientCompanyName: company.name,
        clientAccessRole,
        clientRole: clientAccessRole,
        clientPortalRole: clientAccessRole,
      },
      private_metadata: {
        trustedBumsUpdatedBy: updatedBy,
        trustedBumsUpdatedAt: new Date().toISOString(),
      },
    }),
  })) as ClerkUser;
}

async function createClerkInvitation(input: {
  email: string;
  name?: string;
  company: CompanyRow;
  clientAccessRole: ClientAccessRole;
  redirectUrl?: string;
  invitedBy: string;
}) {
  if (!clerkSecretKey) throw new Error("Set CLERK_SECRET_KEY in Supabase Edge Function secrets before inviting client users.");

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
        role: "CLIENT",
        signupIntent: "CLIENT",
        companyId: input.company.id,
        clientCompanyId: input.company.id,
        companyName: input.company.name,
        clientCompanyName: input.company.name,
        clientAccessRole: input.clientAccessRole,
        clientRole: input.clientAccessRole,
        clientPortalRole: input.clientAccessRole,
      },
      private_metadata: {
        invitedBy: input.invitedBy,
        invitedName: input.name || undefined,
      },
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as
    | ClerkInvitationResponse
    | { errors?: Array<{ long_message?: string; message?: string }> };

  if (!response.ok) {
    const apiError = payload.errors?.[0]?.long_message || payload.errors?.[0]?.message;
    throw new Error(apiError || `Clerk rejected the invitation with HTTP ${response.status}.`);
  }

  return payload as ClerkInvitationResponse;
}

async function listTeam(companyId: string) {
  const { data: members, error: membersError } = await supabaseAdmin
    .from("profiles")
    .select("id, company_id, full_name, email, role, is_admin, client_access_role, last_sign_in_at, created_at")
    .eq("company_id", companyId)
    .eq("role", "CLIENT")
    .order("full_name", { ascending: true, nullsFirst: false })
    .order("email", { ascending: true })
    .returns<ProfileRow[]>();
  if (membersError) throw membersError;

  const memberEmails = (members ?? []).flatMap((member) => member.email ? [member.email.toLowerCase()] : []);
  if (memberEmails.length) {
    await supabaseAdmin
      .from("client_team_invitations")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("company_id", companyId)
      .eq("status", "pending")
      .in("email", memberEmails);
  }

  const { data: invitations, error: invitationsError } = await supabaseAdmin
    .from("client_team_invitations")
    .select("*")
    .eq("company_id", companyId)
    .neq("status", "accepted")
    .order("created_at", { ascending: false });
  if (invitationsError) throw invitationsError;

  return { members: members ?? [], invitations: invitations ?? [] };
}

async function inviteMember(currentProfile: ProfileRow, body: Record<string, unknown>, request: Request) {
  const company = currentProfile.companies;
  if (!currentProfile.company_id || !company) throw new Error("Your profile is not linked to a client company.");

  const email = cleanString(body.email)?.toLowerCase() ?? "";
  const fullName = cleanString(body.name) ?? "";
  const clientAccessRole = readClientAccessRole(body.clientAccessRole) ?? "CLIENT_MEMBER";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");

  const clerkUsers = await listClerkUsersByEmail(email);
  const existingClerkUser = clerkUsers.find((user) => primaryEmail(user) === email);

  if (existingClerkUser?.id) {
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, company_id, full_name, email, role, is_admin, client_access_role, last_sign_in_at, created_at")
      .eq("id", existingClerkUser.id)
      .maybeSingle<ProfileRow>();
    if (profileError) throw profileError;
    if (existingProfile?.company_id && existingProfile.company_id !== currentProfile.company_id) {
      throw new Error("That user already belongs to another client company.");
    }

    const updatedUser = await updateClerkMetadata(existingClerkUser.id, company, clientAccessRole, currentProfile.id);
    await supabaseAdmin.from("profiles").upsert({
      id: existingClerkUser.id,
      company_id: currentProfile.company_id,
      full_name: fullName || displayName(updatedUser, email),
      email,
      role: "CLIENT",
      is_admin: false,
      client_access_role: clientAccessRole,
      last_sign_in_at: timestampMsToIso(updatedUser.last_sign_in_at) ?? new Date().toISOString(),
    }, { onConflict: "id" });

    await supabaseAdmin.from("audit_events").insert({
      company_id: currentProfile.company_id,
      user_id: currentProfile.id,
      event_type: "client_team_member_added",
      entity_type: "profiles",
      entity_id: null,
      event_data: { profileId: existingClerkUser.id, email, clientAccessRole },
    });

    return { invited: false, existingUser: true, email, clientAccessRole, team: await listTeam(currentProfile.company_id) };
  }

  const invitation = await createClerkInvitation({
    email,
    name: fullName,
    company,
    clientAccessRole,
    redirectUrl: normalizeRedirectUrl(body.redirectUrl, request),
    invitedBy: currentProfile.id,
  });

  const invitationPayload = {
    company_id: currentProfile.company_id,
    email,
    full_name: fullName || null,
    client_access_role: clientAccessRole,
    status: "pending",
    invited_by: currentProfile.id,
    clerk_invitation_id: invitation.id ?? null,
    error_message: null,
  };
  const { data: existingInvitation, error: existingInvitationError } = await supabaseAdmin
    .from("client_team_invitations")
    .select("id")
    .eq("company_id", currentProfile.company_id)
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle<{ id: string }>();
  if (existingInvitationError) throw existingInvitationError;
  const invitationWrite = existingInvitation
    ? await supabaseAdmin.from("client_team_invitations").update(invitationPayload).eq("id", existingInvitation.id)
    : await supabaseAdmin.from("client_team_invitations").insert(invitationPayload);
  if (invitationWrite.error) throw invitationWrite.error;

  await supabaseAdmin.from("audit_events").insert({
    company_id: currentProfile.company_id,
    user_id: currentProfile.id,
    event_type: "client_team_invitation_sent",
    entity_type: "client_team_invitations",
    entity_id: null,
    event_data: { clerkInvitationId: invitation.id ?? null, email, clientAccessRole, status: invitation.status ?? null },
  });

  return { invited: true, existingUser: false, invitationId: invitation.id ?? null, status: invitation.status ?? null, email, clientAccessRole, team: await listTeam(currentProfile.company_id) };
}

async function updateMemberRole(currentProfile: ProfileRow, body: Record<string, unknown>) {
  if (!currentProfile.company_id || !currentProfile.companies) throw new Error("Your profile is not linked to a client company.");
  const profileId = cleanString(body.profileId);
  const clientAccessRole = readClientAccessRole(body.clientAccessRole);
  if (!profileId || !clientAccessRole) throw new Error("Choose a team member and role.");
  if (profileId === currentProfile.id && clientAccessRole !== "CLIENT_ADMIN") {
    throw new Error("You cannot remove your own client admin access.");
  }

  const { data: member, error: memberError } = await supabaseAdmin
    .from("profiles")
    .select("id, company_id, full_name, email, role, is_admin, client_access_role, last_sign_in_at, created_at")
    .eq("id", profileId)
    .maybeSingle<ProfileRow>();
  if (memberError) throw memberError;
  if (!member || member.company_id !== currentProfile.company_id || member.role !== "CLIENT") {
    throw new Error("Choose a client team member from your company.");
  }

  if (member.client_access_role === "CLIENT_ADMIN" && clientAccessRole !== "CLIENT_ADMIN") {
    const { count, error: countError } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("company_id", currentProfile.company_id)
      .eq("role", "CLIENT")
      .eq("client_access_role", "CLIENT_ADMIN");
    if (countError) throw countError;
    if ((count ?? 0) <= 1) throw new Error("Each client company must keep at least one client admin.");
  }

  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({ client_access_role: clientAccessRole })
    .eq("id", profileId);
  if (updateError) throw updateError;

  await updateClerkMetadata(profileId, currentProfile.companies, clientAccessRole, currentProfile.id);
  await supabaseAdmin.from("audit_events").insert({
    company_id: currentProfile.company_id,
    user_id: currentProfile.id,
    event_type: "client_team_role_updated",
    entity_type: "profiles",
    entity_id: null,
    event_data: { profileId, email: member.email, previousRole: member.client_access_role, clientAccessRole },
  });

  return { updated: true, profileId, clientAccessRole, team: await listTeam(currentProfile.company_id) };
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "Method not allowed." });

  try {
    const currentProfile = await getCurrentProfile(getBearerToken(request));
    assertClientAdmin(currentProfile);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const action = cleanString(body.action) as Action | null;

    if (action === "list") {
      return json(200, await listTeam(currentProfile.company_id!));
    }

    if (action === "invite") {
      return json(200, await inviteMember(currentProfile, body, request));
    }

    if (action === "update_role") {
      return json(200, await updateMemberRole(currentProfile, body));
    }

    return json(400, { error: "Choose a valid client team action." });
  } catch (error) {
    return json(400, { error: error instanceof Error ? error.message : "Unable to manage this client team." });
  }
});
