import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

type PortalRole = "CLIENT" | "BUM";
type ClientAccessRole = "CLIENT_ADMIN" | "CLIENT_FINANCE" | "CLIENT_LEGAL" | "CLIENT_IT" | "CLIENT_MEMBER";
type RequestType = "SAME_DOMAIN_ACCESS" | "PUBLIC_EMAIL_COMPANY" | "BUM_SIGNUP";

interface ClaimsResponse { sub?: string }
interface ClerkEmailAddress { id?: string; email_address?: string }
interface ClerkUser {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[];
  public_metadata?: Record<string, unknown>;
  unsafe_metadata?: Record<string, unknown>;
  created_at?: number;
  last_sign_in_at?: number | null;
}
interface CompanyRow { id: string; name: string; website: string | null }
interface ProfileRow {
  id: string;
  company_id: string | null;
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_admin: boolean;
  client_access_role: ClientAccessRole | null;
  access_status: string | null;
  disabled_at: string | null;
  time_zone: string | null;
  date_format: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  companies?: Pick<CompanyRow, "id" | "name"> | null;
}

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

const sharedEmailDomains = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "ymail.com",
  "rocketmail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "gmx.com",
  "mail.com",
  "zoho.com",
]);

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabasePublishableKey = Deno.env.get("SB_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
const clerkSecretKey = Deno.env.get("CLERK_SECRET_KEY");
const clerkFrontendApiUrl = Deno.env.get("CLERK_FRONTEND_API_URL");
const portalBaseUrl = (Deno.env.get("PORTAL_BASE_URL") ?? "https://trustedbums.com").replace(/\/+$/, "");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase function environment is missing required project credentials.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function json(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders });
}

function cleanString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readPortalRole(value: unknown): PortalRole | null {
  const normalized = cleanString(value)?.toUpperCase();
  return normalized === "CLIENT" || normalized === "BUM" ? normalized : null;
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

async function getVerifiedUserId(token: string) {
  const payload = parseJwtPayload(token);
  const { payload: verifiedPayload } = await jose.jwtVerify(
    token,
    jose.createRemoteJWKSet(new URL(resolveClerkJwksUrl(payload.iss))),
    payload.iss ? { issuer: payload.iss } : undefined,
  );
  const userId = (verifiedPayload as ClaimsResponse).sub?.trim();
  if (!userId) throw new Error("The verified Clerk session did not include a user ID.");
  return userId;
}

async function clerkFetch(path: string, init: RequestInit = {}) {
  if (!clerkSecretKey) throw new Error("Set CLERK_SECRET_KEY before profile bootstrap can inspect Clerk signup intent.");
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
    const apiError = Array.isArray(payload?.errors)
      ? payload.errors[0]?.long_message || payload.errors[0]?.message
      : null;
    throw new Error(apiError || `Clerk rejected the request with HTTP ${response.status}.`);
  }
  return payload;
}

function primaryEmail(user: ClerkUser) {
  const primary = (user.email_addresses ?? []).find((email) => email.id && email.id === user.primary_email_address_id);
  return (primary?.email_address ?? user.email_addresses?.[0]?.email_address ?? "").trim().toLowerCase();
}

function displayName(user: ClerkUser, email: string, fallback?: string | null) {
  const fullName = cleanString(user.full_name) ?? [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return fullName || cleanString(fallback) || email;
}

function timestampMsToIso(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? new Date(value).toISOString() : null;
}

function normalizeDomain(value?: string | null) {
  if (!value) return null;
  const withoutProtocol = value.trim().toLowerCase().replace(/^https?:\/\//, "");
  const host = withoutProtocol.split("/")[0]?.replace(/^www\./, "").replace(/\.$/, "").split(":")[0];
  return host || null;
}

function getEmailDomain(email: string) {
  return normalizeDomain(email.split("@")[1]);
}

function isSharedEmailDomain(domain?: string | null) {
  return Boolean(domain && sharedEmailDomains.has(domain));
}

function readSignupIntent(user: ClerkUser) {
  const publicMetadata = user.public_metadata ?? {};
  const unsafeMetadata = user.unsafe_metadata ?? {};
  const role = readPortalRole(publicMetadata.signupIntent) ?? readPortalRole(unsafeMetadata.signupIntent);
  const companyName =
    cleanString(publicMetadata.clientCompanyName) ??
    cleanString(publicMetadata.companyName) ??
    cleanString(unsafeMetadata.clientCompanyName) ??
    cleanString(unsafeMetadata.companyName);
  return { role, companyName };
}

async function getProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*, companies(id, name)")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();
  if (error) throw error;
  return data;
}

async function getCompanyByApprovedDomain(domain: string) {
  const { data, error } = await supabaseAdmin
    .from("company_domains")
    .select("company_id, companies(id, name, website)")
    .eq("domain", domain)
    .limit(1)
    .maybeSingle<{ company_id: string; companies?: CompanyRow | null }>();
  if (error) throw error;
  return data?.companies ?? null;
}

async function ensureCompanyForUnclaimedDomain(companyName: string, domain: string) {
  const existing = await getCompanyByApprovedDomain(domain);
  if (existing) return existing;

  const { data: company, error: companyError } = await supabaseAdmin
    .from("companies")
    .insert({ name: companyName.trim(), website: domain, relationship_stage: "CLIENT" })
    .select("id, name, website")
    .single<CompanyRow>();
  if (companyError) throw companyError;

  const { error: domainError } = await supabaseAdmin
    .from("company_domains")
    .insert({ company_id: company.id, domain, is_primary: true });
  if (domainError) throw domainError;

  return company;
}

async function upsertPendingRequest(input: {
  requesterProfileId: string;
  companyId?: string | null;
  email: string;
  emailDomain?: string | null;
  requestedCompanyName?: string | null;
  requestedDomain?: string | null;
  requestedRole?: string | null;
  requestType: RequestType;
  evidence?: Record<string, unknown>;
}) {
  const payload = {
    requester_profile_id: input.requesterProfileId,
    company_id: input.companyId ?? null,
    email: input.email,
    email_domain: input.emailDomain ?? null,
    requested_company_name: input.requestedCompanyName ?? null,
    requested_domain: input.requestedDomain ?? null,
    requested_role: input.requestedRole ?? null,
    request_type: input.requestType,
    status: "pending",
    evidence: input.evidence ?? {},
    requested_by: input.requesterProfileId,
  };

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("client_company_access_requests")
    .select("id")
    .eq("requester_profile_id", input.requesterProfileId)
    .eq("request_type", input.requestType)
    .eq("status", "pending")
    .maybeSingle<{ id: string }>();
  if (existingError) throw existingError;

  const write = existing
    ? await supabaseAdmin.from("client_company_access_requests").update(payload).eq("id", existing.id).select("id").single<{ id: string }>()
    : await supabaseAdmin.from("client_company_access_requests").insert(payload).select("id").single<{ id: string }>();
  if (write.error) throw write.error;
  return { ...write.data, created: !existing };
}

async function writeAudit(userId: string, eventType: string, eventData: Record<string, unknown>, companyId?: string | null) {
  await supabaseAdmin.from("audit_events").insert({
    company_id: companyId ?? null,
    user_id: userId,
    event_type: eventType,
    entity_type: "profiles",
    entity_id: null,
    event_data: eventData,
  });
}

async function attachPendingManagingBumInvite(userId: string, email: string) {
  const { data: pendingInvite, error: pendingInviteError } = await supabaseAdmin
    .from("bum_team_memberships")
    .select("id, managing_bum_user_id, manager_commission_percent")
    .ilike("invite_email", email)
    .is("member_bum_user_id", null)
    .eq("status", "INVITED")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string; managing_bum_user_id: string; manager_commission_percent: number | null }>();

  if (pendingInviteError) throw pendingInviteError;
  if (!pendingInvite) return null;

  const { error: updateError } = await supabaseAdmin
    .from("bum_team_memberships")
    .update({
      member_bum_user_id: userId,
      status: "ACTIVE",
      updated_at: new Date().toISOString(),
    })
    .eq("id", pendingInvite.id);

  if (updateError) throw updateError;

  await writeAudit(userId, "managing_bum_invite_attached", {
    membershipId: pendingInvite.id,
    managingBumUserId: pendingInvite.managing_bum_user_id,
    managerCommissionPercent: pendingInvite.manager_commission_percent,
    email,
  });

  return pendingInvite;
}

async function sendManagingBumTeamSignupNotice(input: {
  managerUserId: string;
  memberUserId: string;
  memberEmail: string;
}) {
  if (!supabasePublishableKey || !supabaseServiceRoleKey) return;

  const [{ data: manager, error: managerError }, { data: member, error: memberError }] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", input.managerUserId)
      .maybeSingle<Pick<ProfileRow, "id" | "full_name" | "email">>(),
    supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", input.memberUserId)
      .maybeSingle<Pick<ProfileRow, "id" | "full_name" | "email">>(),
  ]);

  if (managerError) throw managerError;
  if (memberError) throw memberError;

  const managerEmail = manager?.email?.trim().toLowerCase();
  if (!managerEmail) return;

  const managerName = cleanString(manager?.full_name) ?? managerEmail;
  const memberEmail = member?.email?.trim().toLowerCase() || input.memberEmail;
  const memberName = cleanString(member?.full_name) ?? memberEmail;

  const response = await fetch(`${supabaseUrl}/functions/v1/send-admin-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      "x-internal-email": "trustedbums-edge",
    },
    body: JSON.stringify({
      mode: "action",
      templateSlug: "managing_bum_team_signup",
      recipientEmails: [managerEmail],
      metadata: {
        manager_name: managerName,
        team_member_name: memberName,
        team_member_email: memberEmail,
        team_management_url: `${portalBaseUrl}/bum/team`,
      },
      triggeredBy: "MANAGING_BUM_TEAM_MEMBER_SIGNED_UP",
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(payload.error || "Unable to send Managing Bum team signup notice.");
  }
}

async function sendBumSignupAdminNotice(input: {
  requestId: string;
  name: string;
  email: string;
  emailDomain?: string | null;
}) {
  if (!supabasePublishableKey || !supabaseServiceRoleKey) return;

  const approveUrl = `${portalBaseUrl}/admin/bums?requestId=${encodeURIComponent(input.requestId)}`;
  const response = await fetch(`${supabaseUrl}/functions/v1/send-admin-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      "x-internal-email": "trustedbums-edge",
    },
    body: JSON.stringify({
      mode: "action",
      templateSlug: "bum_signup_admin_review",
      recipientEmails: ["bums@trustedbums.com"],
      metadata: {
        request_id: input.requestId,
        bum_name: input.name,
        user_name: input.name,
        bum_email: input.email,
        user_email: input.email,
        email_domain: input.emailDomain ?? "",
        approve_url: approveUrl,
      },
      triggeredBy: "BUM_SIGNUP_CREATED",
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(payload.error || "Unable to send Bum signup approval notice.");
  }
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "Method not allowed." });

  try {
    const userId = await getVerifiedUserId(getBearerToken(request));
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const clerkUser = await clerkFetch("/users/" + encodeURIComponent(userId)) as ClerkUser;
    const email = primaryEmail(clerkUser);
    if (!email) throw new Error("Your Clerk account does not have a primary email address.");

    const existing = await getProfile(userId);
    const safeProfile = {
      id: userId,
      full_name: displayName(clerkUser, email, cleanString(body.fullName)),
      email,
      last_sign_in_at: timestampMsToIso(clerkUser.last_sign_in_at) ?? new Date().toISOString(),
      time_zone: cleanString(body.timeZone),
      date_format: cleanString(body.dateFormat),
    };

    if (existing?.role && existing.access_status !== "DENIED") {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .update(safeProfile)
        .eq("id", userId)
        .select("*, companies(id, name)")
        .single<ProfileRow>();
      if (error) throw error;
      if (data.role === "BUM") {
        const attachedInvite = await attachPendingManagingBumInvite(userId, email);
        if (attachedInvite) {
          await sendManagingBumTeamSignupNotice({
            managerUserId: attachedInvite.managing_bum_user_id,
            memberUserId: userId,
            memberEmail: email,
          }).catch((error) => console.warn("Unable to send Managing Bum team signup notice", error));
        }
      }
      return json(200, { profile: data, request: null });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          ...safeProfile,
          role: existing?.role ?? null,
          is_admin: existing?.is_admin ?? false,
          company_id: existing?.company_id ?? null,
          client_access_role: existing?.client_access_role ?? "CLIENT_MEMBER",
          access_status: existing?.access_status ?? "PENDING",
        },
        { onConflict: "id" },
      )
      .select("*, companies(id, name)")
      .single<ProfileRow>();
    if (profileError) throw profileError;

    const { role, companyName } = readSignupIntent(clerkUser);
    const emailDomain = getEmailDomain(email);

    if (role === "CLIENT" && companyName) {
      if (!emailDomain || isSharedEmailDomain(emailDomain)) {
        const accessRequest = await upsertPendingRequest({
          requesterProfileId: userId,
          email,
          emailDomain,
          requestedCompanyName: companyName,
          requestedRole: "CLIENT_ADMIN",
          requestType: "PUBLIC_EMAIL_COMPANY",
          evidence: { source: "signup_intent", companyName },
        });
        await writeAudit(userId, "client_company_public_email_review_requested", { requestId: accessRequest.id, email, companyName, emailDomain });
        return json(200, { profile, request: { id: accessRequest.id, status: "pending", type: "PUBLIC_EMAIL_COMPANY" } });
      }

      const matchedCompany = await getCompanyByApprovedDomain(emailDomain);
      if (matchedCompany) {
        const accessRequest = await upsertPendingRequest({
          requesterProfileId: userId,
          companyId: matchedCompany.id,
          email,
          emailDomain,
          requestedCompanyName: matchedCompany.name,
          requestedRole: "CLIENT_MEMBER",
          requestType: "SAME_DOMAIN_ACCESS",
          evidence: { source: "signup_intent", requestedCompanyName: companyName },
        });
        await writeAudit(userId, "client_company_same_domain_access_requested", { requestId: accessRequest.id, email, emailDomain }, matchedCompany.id);
        return json(200, { profile, request: { id: accessRequest.id, status: "pending", type: "SAME_DOMAIN_ACCESS", companyId: matchedCompany.id } });
      }

      const company = await ensureCompanyForUnclaimedDomain(companyName, emailDomain);
      const { data: approvedProfile, error: approvedError } = await supabaseAdmin
        .from("profiles")
        .update({
          company_id: company.id,
          role: "CLIENT",
          is_admin: false,
          client_access_role: "CLIENT_ADMIN",
          access_status: "APPROVED",
          disabled_at: null,
          disabled_by: null,
        })
        .eq("id", userId)
        .select("*, companies(id, name)")
        .single<ProfileRow>();
      if (approvedError) throw approvedError;
      await writeAudit(userId, "client_company_domain_claimed", { email, emailDomain, companyName: company.name }, company.id);
      return json(200, { profile: approvedProfile, request: null });
    }

    if (role === "BUM") {
      const attachedInvite = await attachPendingManagingBumInvite(userId, email);
      if (attachedInvite) {
        await sendManagingBumTeamSignupNotice({
          managerUserId: attachedInvite.managing_bum_user_id,
          memberUserId: userId,
          memberEmail: email,
        }).catch((error) => console.warn("Unable to send Managing Bum team signup notice", error));
      }
      const accessRequest = await upsertPendingRequest({
        requesterProfileId: userId,
        email,
        emailDomain,
        requestedRole: "BUM",
        requestType: "BUM_SIGNUP",
        evidence: { source: "signup_intent" },
      });
      await writeAudit(userId, "bum_access_requested", { requestId: accessRequest.id, email, emailDomain });
      if (accessRequest.created) {
        await sendBumSignupAdminNotice({
          requestId: accessRequest.id,
          name: profile.full_name ?? displayName(clerkUser, email, cleanString(body.fullName)),
          email,
          emailDomain,
        }).catch((error) => console.warn("Unable to send Bum signup admin notice", error));
      }
      return json(200, { profile, request: { id: accessRequest.id, status: "pending", type: "BUM_SIGNUP" } });
    }

    return json(200, { profile, request: null });
  } catch (error) {
    return json(400, { error: error instanceof Error ? error.message : "Unable to bootstrap this profile." });
  }
});
