import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface AccessibilityContextValue {
  isAdaModeEnabled: boolean;
  setAdaModeEnabled: (enabled: boolean) => void;
  toggleAdaMode: () => void;
  isColorBlindModeEnabled: boolean;
  setColorBlindModeEnabled: (enabled: boolean) => void;
  toggleColorBlindMode: () => void;
}

const ADA_STORAGE_KEY = "trusted-bums-ada-mode";
const COLOR_BLIND_STORAGE_KEY = "trusted-bums-color-blind-mode";

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [isAdaModeEnabled, setIsAdaModeEnabled] = useState(false);
  const [isColorBlindModeEnabled, setIsColorBlindModeEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedAdaValue = window.localStorage.getItem(ADA_STORAGE_KEY);
    const storedColorBlindValue = window.localStorage.getItem(COLOR_BLIND_STORAGE_KEY);
    setIsAdaModeEnabled(storedAdaValue === "true");
    setIsColorBlindModeEnabled(storedColorBlindValue === "true");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    document.documentElement.classList.toggle("ada-mode", isAdaModeEnabled);
    document.documentElement.classList.toggle("colorblind-mode", isColorBlindModeEnabled);
    window.localStorage.setItem(ADA_STORAGE_KEY, String(isAdaModeEnabled));
    window.localStorage.setItem(COLOR_BLIND_STORAGE_KEY, String(isColorBlindModeEnabled));
  }, [isAdaModeEnabled, isColorBlindModeEnabled]);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      isAdaModeEnabled,
      setAdaModeEnabled: setIsAdaModeEnabled,
      toggleAdaMode: () => setIsAdaModeEnabled((current) => !current),
      isColorBlindModeEnabled,
      setColorBlindModeEnabled: setIsColorBlindModeEnabled,
      toggleColorBlindMode: () => setIsColorBlindModeEnabled((current) => !current),
    }),
    [isAdaModeEnabled, isColorBlindModeEnabled],
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
