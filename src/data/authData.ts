export type UserRole = "ADMIN" | "CLIENT" | "BUM";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId?: string;
  bumId?: string;
}

export interface AuthorizationProfile extends AuthUser {
  description: string;
}

export const authorizationProfiles: AuthorizationProfile[] = [
  {
    id: "admin-1",
    email: "admin@trustedbums.com",
    name: "Marketplace Admin",
    role: "ADMIN",
    description: "Can manage clients, bums, opportunities, payments, and payouts.",
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
    clientId: "c1",
    description: "Second AcmeCorp user sharing the same client workspace.",
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
];

export function toAuthUser(account: AuthorizationProfile): AuthUser {
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
    clientId: account.clientId,
    bumId: account.bumId,
  };
}

export function getAuthorizationProfileByEmail(email?: string | null) {
  if (!email) {
    return undefined;
  }

  return authorizationProfiles.find(
    (profile) => profile.email.toLowerCase() === email.trim().toLowerCase(),
  );
}

export function getDefaultPathForRole(role: UserRole) {
  if (role === "ADMIN") {
    return "/admin";
  }

  if (role === "CLIENT") {
    return "/client";
  }

  return "/bum";
}
