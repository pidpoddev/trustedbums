import { useAuth as useClerkAuth, useSession, useUser } from "@clerk/react";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  readClientAccessRole,
  type AuthUser,
  type ClientAccessRole,
  type UserRole,
} from "@/data/authData";
import { bootstrapSupabaseProfile, type ProfileRecord } from "@/lib/portalApi";
import { setSupabaseAccessTokenProvider } from "@/lib/supabase";
import { getBrowserTimeZone, getStoredDateFormat, normalizeDateFormat, setStoredDateFormat } from "@/lib/timezone";

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

interface BaseIdentity {
  id: string;
  email: string;
  name: string;
  timeZone?: string;
  dateFormat?: string;
}

function profileToAuthUser(profile: ProfileRecord, baseUser: BaseIdentity): AuthUser | null {
  const role = readRole(profile.role);
  const accessStatus = profile.access_status ?? "APPROVED";

  if (!role || accessStatus !== "APPROVED" || profile.disabled_at) {
    return null;
  }

  return {
    id: baseUser.id,
    email: profile.email ?? baseUser.email,
    name: profile.full_name ?? baseUser.name,
    role,
    timeZone: profile.time_zone ?? baseUser.timeZone,
    dateFormat: normalizeDateFormat(profile.date_format ?? baseUser.dateFormat),
    clientAccessRole: role === "CLIENT" ? readClientAccessRole(profile.client_access_role) : undefined,
    clientId: role === "CLIENT" ? profile.company_id ?? undefined : undefined,
    companyName: profile.companies?.name ?? undefined,
    bumId: role === "BUM" ? profile.id : undefined,
  };
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

  const baseUser = useMemo<BaseIdentity | null>(() => {
    const isLoaded = isAuthLoaded && isSessionLoaded && isUserLoaded;
    const signedIn = Boolean(isSignedIn && clerkUser);
    const email =
      clerkUser?.primaryEmailAddress?.emailAddress ??
      clerkUser?.emailAddresses[0]?.emailAddress ??
      "";
    const browserTimeZone = getBrowserTimeZone();
    const dateFormat = getStoredDateFormat();

    if (!isLoaded || !signedIn || !clerkUser || !email) {
      return null;
    }

    return {
      id: clerkUser.id,
      email,
      name: getDisplayName(
        clerkUser.fullName,
        clerkUser.firstName,
        clerkUser.lastName,
        undefined,
        email,
      ),
      timeZone: browserTimeZone,
      dateFormat,
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
        const { profile, request } = await bootstrapSupabaseProfile({
          fullName: baseUser.name,
          timeZone: baseUser.timeZone,
          dateFormat: baseUser.dateFormat,
        });
        if (!mounted) {
          return;
        }

        setStoredDateFormat(profile.date_format ?? baseUser.dateFormat);
        const authorizedUser = profileToAuthUser(profile, baseUser);
        setDbUser(authorizedUser);
        if (!authorizedUser && request) {
          setDbError("Your Trusted Bums access request is awaiting approval.");
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        setDbUser(null);
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
      return "Your Clerk user is signed in but does not have a verified email address.";
    }

    return dbError ?? (!dbUser ? "Your Trusted Bums access is awaiting approval." : null);
  }, [baseUser, dbError, dbUser, isLoaded, isSignedIn]);

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
          const { profile } = await bootstrapSupabaseProfile({
            fullName: baseUser.name,
            timeZone: baseUser.timeZone,
            dateFormat: baseUser.dateFormat,
          });
          setStoredDateFormat(profile.date_format ?? baseUser.dateFormat);
          setDbUser(profileToAuthUser(profile, baseUser));
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
