import { useAuth as useClerkAuth, useSession, useUser } from "@clerk/react";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_CLIENT_ACCESS_ROLE,
  createPendingBumId,
  getAuthorizationProfileByEmail,
  getKnownClientForEmail,
  readClientAccessRole,
  toAuthUser,
  type AuthUser,
  type ClientAccessRole,
  type UserRole,
} from "@/data/authData";
import { ensureSupabaseProfileForAuthUser } from "@/lib/portalApi";
import { setSupabaseAccessTokenProvider } from "@/lib/supabase";

interface AuthContextValue {
  user: AuthUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  isAuthenticated: boolean;
  impersonatorUserId: string | null;
  isImpersonating: boolean;
  authorizationError: string | null;
  hasRole: (roles: UserRole[]) => boolean;
  hasClientAccessRole: (roles: ClientAccessRole[]) => boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readRole(value: unknown): UserRole | undefined {
  return value === "ADMIN" || value === "CLIENT" || value === "BUM" ? value : undefined;
}

function getDisplayName(
  clerkName: string | null | undefined,
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  profileName: string | undefined,
  email: string,
) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return clerkName || fullName || profileName || email;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { actor, isLoaded: isAuthLoaded, isSignedIn, signOut: clerkSignOut } = useClerkAuth();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const { isLoaded: isUserLoaded, user: clerkUser } = useUser();
  const [dbUser, setDbUser] = useState<AuthUser | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isDbProfileLoaded, setIsDbProfileLoaded] = useState(false);
  const impersonatorUserId =
    readString((actor as Record<string, unknown> | null)?.sub) ??
    readString((session?.actor as Record<string, unknown> | null)?.sub) ??
    null;

  useEffect(() => {
    setSupabaseAccessTokenProvider(async (mode) => {
      if (!session) {
        return null;
      }

      if (mode === "legacy") {
        return session.getToken({ template: "supabase" }).catch(() => null);
      }

      return session.getToken().catch(() => null);
    });
    return () => setSupabaseAccessTokenProvider(null);
  }, [session]);

  const baseUser = useMemo<AuthUser | null>(() => {
    const isLoaded = isAuthLoaded && isSessionLoaded && isUserLoaded;
    const signedIn = Boolean(isSignedIn && clerkUser);
    const email =
      clerkUser?.primaryEmailAddress?.emailAddress ??
      clerkUser?.emailAddresses[0]?.emailAddress ??
      "";

    if (!isLoaded || !signedIn || !clerkUser || !email) {
      return null;
    }

    const publicMetadata = clerkUser.publicMetadata as Record<string, unknown>;
    const unsafeMetadata = clerkUser.unsafeMetadata as Record<string, unknown>;
    const profile = getAuthorizationProfileByEmail(email);
    const fallbackUser = profile ? toAuthUser(profile) : undefined;
    const knownClient = getKnownClientForEmail(email);
    const metadataRole = readRole(publicMetadata.role) ?? readRole(unsafeMetadata.role);
    const metadataCompanyName =
      readString(publicMetadata.clientCompanyName) ??
      readString(publicMetadata.companyName) ??
      readString(unsafeMetadata.clientCompanyName) ??
      readString(unsafeMetadata.companyName);
    const metadataClientAccessRole =
      readClientAccessRole(publicMetadata.clientAccessRole) ??
      readClientAccessRole(publicMetadata.clientRole) ??
      readClientAccessRole(publicMetadata.clientPortalRole) ??
      readClientAccessRole(unsafeMetadata.clientAccessRole) ??
      readClientAccessRole(unsafeMetadata.clientRole) ??
      readClientAccessRole(unsafeMetadata.clientPortalRole);
    const role = metadataRole ?? profile?.role;
    const companyName = knownClient?.company ?? metadataCompanyName ?? fallbackUser?.companyName;
    const bumId =
      readString(publicMetadata.bumId) ??
      readString(unsafeMetadata.bumId) ??
      profile?.bumId ??
      (role === "BUM" ? createPendingBumId(email) : undefined);

    if (!role || (role === "CLIENT" && !companyName) || (role === "BUM" && !bumId)) {
      return null;
    }

    return {
      id: clerkUser.id,
      email,
      name: getDisplayName(
        clerkUser.fullName,
        clerkUser.firstName,
        clerkUser.lastName,
        fallbackUser?.name,
        email,
      ),
      role,
      clientAccessRole: role === "CLIENT" ? metadataClientAccessRole ?? fallbackUser?.clientAccessRole ?? DEFAULT_CLIENT_ACCESS_ROLE : undefined,
      clientId: fallbackUser?.clientId,
      bumId,
      companyName,
    };
  }, [clerkUser, isAuthLoaded, isSessionLoaded, isSignedIn, isUserLoaded]);

  useEffect(() => {
    let mounted = true;

    async function syncProfile() {
      setDbError(null);
      setDbUser(null);
      setIsDbProfileLoaded(false);

      if (!baseUser || !session) {
        setIsDbProfileLoaded(true);
        return;
      }

      try {
        const profile = await ensureSupabaseProfileForAuthUser(baseUser);
        if (!mounted) {
          return;
        }

        setDbUser({
          ...baseUser,
          clientId: baseUser.role === "CLIENT" ? profile.company_id ?? undefined : baseUser.clientId,
          companyName: profile.companies?.name ?? baseUser.companyName,
        });
      } catch (error) {
        if (!mounted) {
          return;
        }

        setDbUser(baseUser);
        setDbError(error instanceof Error ? error.message : "Unable to connect this Clerk user to Supabase.");
      } finally {
        if (mounted) {
          setIsDbProfileLoaded(true);
        }
      }
    }

    void syncProfile();

    return () => {
      mounted = false;
    };
  }, [baseUser, session]);

  const isLoaded = isAuthLoaded && isSessionLoaded && isUserLoaded && isDbProfileLoaded;
  const authorizationError = useMemo(() => {
    if (!isLoaded || !isSignedIn) {
      return null;
    }

    if (!baseUser) {
      return "Your Clerk user is signed in but has not been assigned a Trusted Bums role.";
    }

    return dbError;
  }, [baseUser, dbError, isLoaded, isSignedIn]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: dbUser,
      isLoaded,
      isSignedIn: Boolean(isSignedIn && clerkUser),
      isAuthenticated: Boolean(dbUser),
      impersonatorUserId,
      isImpersonating: Boolean(impersonatorUserId),
      authorizationError,
      hasRole: (roles) => Boolean(dbUser && roles.includes(dbUser.role)),
      hasClientAccessRole: (roles) =>
        Boolean(
          dbUser?.role === "CLIENT" &&
            dbUser.clientAccessRole &&
            roles.includes(dbUser.clientAccessRole),
        ),
      refreshUser: async () => {
        if (baseUser) {
          const profile = await ensureSupabaseProfileForAuthUser(baseUser);
          setDbUser({
            ...baseUser,
            clientId: baseUser.role === "CLIENT" ? profile.company_id ?? undefined : baseUser.clientId,
            companyName: profile.companies?.name ?? baseUser.companyName,
          });
        }
      },
      signOut: async () => {
        await clerkSignOut();
        setDbUser(null);
      },
    }),
    [authorizationError, baseUser, clerkSignOut, clerkUser, dbUser, impersonatorUserId, isLoaded, isSignedIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
