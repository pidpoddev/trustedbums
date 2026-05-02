import { useAuth as useClerkAuth, useUser } from "@clerk/react";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  getAuthorizationProfileByEmail,
  toAuthUser,
  type AuthUser,
  type UserRole,
} from "@/data/authData";

interface AuthContextValue {
  user: AuthUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  isAuthenticated: boolean;
  authorizationError: string | null;
  hasRole: (roles: UserRole[]) => boolean;
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
  const { isLoaded: isAuthLoaded, isSignedIn } = useClerkAuth();
  const { isLoaded: isUserLoaded, user: clerkUser } = useUser();

  const value = useMemo<AuthContextValue>(() => {
    const isLoaded = isAuthLoaded && isUserLoaded;
    const signedIn = Boolean(isSignedIn && clerkUser);
    const email =
      clerkUser?.primaryEmailAddress?.emailAddress ??
      clerkUser?.emailAddresses[0]?.emailAddress ??
      "";

    if (!isLoaded) {
      return {
        user: null,
        isLoaded: false,
        isSignedIn: false,
        isAuthenticated: false,
        authorizationError: null,
        hasRole: () => false,
      };
    }

    if (!signedIn || !clerkUser || !email) {
      return {
        user: null,
        isLoaded: true,
        isSignedIn: false,
        isAuthenticated: false,
        authorizationError: null,
        hasRole: () => false,
      };
    }

    const metadata = clerkUser.publicMetadata as Record<string, unknown>;
    const profile = getAuthorizationProfileByEmail(email);
    const metadataRole = readRole(metadata.role);
    const role = metadataRole ?? profile?.role;
    const clientId = readString(metadata.clientId) ?? profile?.clientId;
    const bumId = readString(metadata.bumId) ?? profile?.bumId;

    if (!role || (role === "CLIENT" && !clientId) || (role === "BUM" && !bumId)) {
      return {
        user: null,
        isLoaded: true,
        isSignedIn: true,
        isAuthenticated: false,
        authorizationError: "Your Clerk user is signed in but has not been assigned a Trusted Bums role.",
        hasRole: () => false,
      };
    }

    const fallbackUser = profile ? toAuthUser(profile) : undefined;
    const authUser: AuthUser = {
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
      clientId,
      bumId,
    };

    return {
      user: authUser,
      isLoaded: true,
      isSignedIn: true,
      isAuthenticated: true,
      authorizationError: null,
      hasRole: (roles) => roles.includes(authUser.role),
    };
  }, [clerkUser, isAuthLoaded, isSignedIn, isUserLoaded]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
