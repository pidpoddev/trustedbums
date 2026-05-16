import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface AccessibilityContextValue {
  isAdaModeEnabled: boolean;
  setAdaModeEnabled: (enabled: boolean) => void;
  toggleAdaMode: () => void;
}

const STORAGE_KEY = "trusted-bums-ada-mode";

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [isAdaModeEnabled, setIsAdaModeEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    setIsAdaModeEnabled(storedValue === "true");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    document.documentElement.classList.toggle("ada-mode", isAdaModeEnabled);
    window.localStorage.setItem(STORAGE_KEY, String(isAdaModeEnabled));
  }, [isAdaModeEnabled]);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      isAdaModeEnabled,
      setAdaModeEnabled: setIsAdaModeEnabled,
      toggleAdaMode: () => setIsAdaModeEnabled((current) => !current),
    }),
    [isAdaModeEnabled],
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }

  return context;
}
