import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { demoAccounts, toAuthUser, type AuthUser, type UserRole } from "@/data/authData";

const SESSION_STORAGE_KEY = "trustedbums:auth-user-id";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => AuthUser | null;
  loginAsDemo: (userId: string) => AuthUser | null;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredUser() {
  const storedUserId = window.localStorage.getItem(SESSION_STORAGE_KEY);
  const account = demoAccounts.find((demoAccount) => demoAccount.id === storedUserId);
  return account ? toAuthUser(account) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  const value = useMemo<AuthContextValue>(() => {
    const setSession = (nextUser: AuthUser | null) => {
      if (nextUser) {
        window.localStorage.setItem(SESSION_STORAGE_KEY, nextUser.id);
      } else {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      }

      setUser(nextUser);
    };

    const login = (email: string, password: string) => {
      const account = demoAccounts.find(
        (demoAccount) =>
          demoAccount.email.toLowerCase() === email.trim().toLowerCase() &&
          demoAccount.password === password,
      );
      const nextUser = account ? toAuthUser(account) : null;
      setSession(nextUser);
      return nextUser;
    };

    const loginAsDemo = (userId: string) => {
      const account = demoAccounts.find((demoAccount) => demoAccount.id === userId);
      const nextUser = account ? toAuthUser(account) : null;
      setSession(nextUser);
      return nextUser;
    };

    return {
      user,
      isAuthenticated: Boolean(user),
      login,
      loginAsDemo,
      logout: () => setSession(null),
      hasRole: (roles) => Boolean(user && roles.includes(user.role)),
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
