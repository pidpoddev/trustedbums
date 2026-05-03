import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  type AuthUser,
  type UserRole,
} from "@/data/authData";
import { getAuthUserFromSession } from "@/lib/portalApi";
import { supabase } from "@/lib/supabase";

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  isAuthenticated: boolean;
  authorizationError: string | null;
  hasRole: (roles: UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [authorizationError, setAuthorizationError] = useState<string | null>(null);

  const loadUser = async (nextSession: Session | null) => {
    setSession(nextSession);

    if (!nextSession) {
      setUser(null);
      setAuthorizationError(null);
      setIsLoaded(true);
      return;
    }

    try {
      const authUser = await getAuthUserFromSession(nextSession);
      setUser(authUser);
      setAuthorizationError(
        authUser
          ? null
          : "Your Supabase user is signed in but has not been assigned a Trusted Bums role.",
      );
    } catch (error) {
      setUser(null);
      setAuthorizationError(error instanceof Error ? error.message : "Unable to load your Trusted Bums profile.");
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        void loadUser(data.session);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        void loadUser(nextSession);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoaded,
      isSignedIn: Boolean(session),
      isAuthenticated: Boolean(user),
      authorizationError,
      hasRole: (roles) => Boolean(user && roles.includes(user.role)),
      refreshUser: async () => {
        setIsLoaded(false);
        const { data } = await supabase.auth.getSession();
        await loadUser(data.session);
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
      },
    }),
    [authorizationError, isLoaded, session, user],
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
