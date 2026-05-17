import { mockClients } from "@/data/mockData";

export type UserRole = "ADMIN" | "CLIENT" | "BUM";
export type ClientAccessRole = "CLIENT_ADMIN" | "CLIENT_FINANCE" | "CLIENT_MEMBER";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  timeZone?: string;
  clientAccessRole?: ClientAccessRole;
  clientId?: string;
  bumId?: string;
  companyName?: string;
}

export interface AuthorizationProfile extends AuthUser {
  description: string;
}

export const authorizationProfiles: AuthorizationProfile[] = [
  {
    id: "admin-1",
    email: "bums@trustedbums.com",
    name: "Trusted Bums Admin",
    role: "ADMIN",
    description: "Primary administrator account for managing the Trusted Bums marketplace.",
  },
  {
    id: "admin-2",
    email: "admin@trustedbums.com",
    name: "Marketplace Admin",
    role: "ADMIN",
    description: "Demo administrator profile for local testing.",
  },
  {
    id: "user_3DpqskhX2597aERJ5kqHh4nTW13",
    email: "qa_admin@qa.com",
    name: "QA Admin",
    role: "ADMIN",
    description: "Production QA administrator account for smoke testing.",
  },
  {
    id: "client-c1-1",
    email: "sarah@acmecorp.com",
    name: "Sarah Chen",
    role: "CLIENT",
    clientId: "c1",
    description: "AcmeCorp owner with access to the AcmeCorp client portal.",
  },
  {
    id: "client-c1-2",
    email: "revops@acmecorp.com",
    name: "Acme RevOps",
    role: "CLIENT",
    clientAccessRole: "CLIENT_FINANCE",
    clientId: "c1",
    description: "AcmeCorp finance user with access to payment and export workflows.",
  },
  {
    id: "client-c2-1",
    email: "marcus@bluewave.io",
    name: "Marcus Johnson",
    role: "CLIENT",
    clientId: "c2",
    description: "BlueWave user scoped to BlueWave data only.",
  },
  {
    id: "client-blackcurrant-1",
    email: "akshay@blackcurrant.ai",
    name: "Akshay Thakur",
    role: "CLIENT",
    companyName: "BlackCurrant",
    description: "BlackCurrant CEO with access to the BlackCurrant client target account workspace.",
  },
  {
    id: "user_3Dpr9RqyE3mLxFUO6vM18M0GEKf",
    email: "qa_client_admin@qa.com",
    name: "QA ClientAdmin",
    role: "CLIENT",
    clientAccessRole: "CLIENT_ADMIN",
    companyName: "QA",
    description: "Production QA client admin account for smoke testing.",
  },
  {
    id: "user_3DprHljZmDSARzEIy2dK42a5vzp",
    email: "qa_finance@qa.com",
    name: "QA Finance",
    role: "CLIENT",
    clientAccessRole: "CLIENT_FINANCE",
    companyName: "QA",
    description: "Production QA client finance account for smoke testing.",
  },
  {
    id: "user_3DprQtmOZg8G7VAV2tqg4IVU50J",
    email: "qa_clientmember@qa.com",
    name: "QA ClientMember",
    role: "CLIENT",
    clientAccessRole: "CLIENT_MEMBER",
    companyName: "QA",
    description: "Production QA client member account for smoke testing.",
  },
  {
    id: "user_3DpXqbTvpn4nxc9xNBjG0PN3V6s",
    email: "jason.mckinney@k2view.com",
    name: "Jason McKinney",
    role: "CLIENT",
    clientAccessRole: "CLIENT_ADMIN",
    companyName: "K2view",
    description: "K2view organization creator with access to the K2view client workspace.",
  },
  {
    id: "bum-b1",
    email: "jake@email.com",
    name: "Jake Thompson",
    role: "BUM",
    bumId: "b1",
    description: "Trusted Bum account tied to a single connector profile.",
  },
  {
    id: "bum-b2",
    email: "amy@email.com",
    name: "Amy Liu",
    role: "BUM",
    bumId: "b2",
    description: "Trusted Bum account tied to one account and payout identity.",
  },
  {
    id: "user_3DprZp8fmnY0yNXfMd16Md9n127",
    email: "qa_bum@qabum.com",
    name: "QA Bum",
    role: "BUM",
    bumId: "qa-bum",
    description: "Production QA Bum account for smoke testing.",
  },
];

export function toAuthUser(account: AuthorizationProfile): AuthUser {
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
    clientAccessRole: account.clientAccessRole,
    clientId: account.clientId,
    bumId: account.bumId,
    companyName: account.companyName,
  };
}

export const DEFAULT_CLIENT_ACCESS_ROLE: ClientAccessRole = "CLIENT_ADMIN";

export function readClientAccessRole(value: unknown): ClientAccessRole | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toUpperCase().replace(/[^A-Z]+/g, "_");

  if (normalized === "CLIENT_ADMIN" || normalized === "ADMIN") {
    return "CLIENT_ADMIN";
  }

  if (normalized === "CLIENT_FINANCE" || normalized === "FINANCE") {
    return "CLIENT_FINANCE";
  }

  if (normalized === "CLIENT_MEMBER" || normalized === "MEMBER") {
    return "CLIENT_MEMBER";
  }

  return undefined;
}

export function getClientAccessLabel(role?: ClientAccessRole) {
  if (role === "CLIENT_FINANCE") {
    return "Finance";
  }

  if (role === "CLIENT_MEMBER") {
    return "Member";
  }

  return "Client Admin";
}

export function getAuthorizationProfileByEmail(email?: string | null) {
  if (!email) {
    return undefined;
  }

  return authorizationProfiles.find(
    (profile) => profile.email.toLowerCase() === email.trim().toLowerCase(),
  );
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getEmailDomain(email: string) {
  return normalizeEmail(email).split("@")[1] ?? "";
}

function normalizeDomain(domain: string) {
  return domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getKnownClientForEmail(email?: string | null) {
  if (!email) {
    return undefined;
  }

  const normalizedEmail = normalizeEmail(email);
  const profile = authorizationProfiles.find(
    (account) => account.role === "CLIENT" && account.email.toLowerCase() === normalizedEmail,
  );

  if (profile?.clientId) {
    return mockClients.find((client) => client.id === profile.clientId);
  }

  const emailDomain = getEmailDomain(normalizedEmail);

  if (!emailDomain) {
    return undefined;
  }

  return mockClients.find((client) => {
    const knownDomains = [getEmailDomain(client.email), normalizeDomain(client.website)].filter(Boolean);
    return knownDomains.includes(emailDomain);
  });
}

export function createPendingClientId(companyName: string) {
  const slug = slugify(companyName);
  return slug ? `pending-client-${slug}` : undefined;
}

export function createPendingBumId(email: string) {
  const slug = slugify(email.split("@")[0] || email);
  return slug ? `pending-bum-${slug}` : undefined;
}

export function getDefaultPathForRole(role: UserRole) {
  if (role === "ADMIN") {
    return "/admin";
  }

  if (role === "CLIENT") {
    return "/client/dashboard";
  }

  return "/bum/dashboard";
}
