import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface AccessibilityContextValue {
  isAdaModeEnabled: boolean;
  setAdaModeEnabled: (enabled: boolean) => void;
  toggleAdaMode: () => void;
  isColorBlindModeEnabled: boolean;
  setColorBlindModeEnabled: (enabled: boolean) => void;
  toggleColorBlindMode: () => void;
  isReadSelectionEnabled: boolean;
  setReadSelectionEnabled: (enabled: boolean) => void;
  toggleReadSelection: () => void;
}

const ADA_STORAGE_KEY = "trusted-bums-ada-mode";
const COLOR_BLIND_STORAGE_KEY = "trusted-bums-color-blind-mode";
const READ_SELECTION_STORAGE_KEY = "trusted-bums-read-selection-mode";
const READ_SELECTION_MAX_LENGTH = 1500;

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [isAdaModeEnabled, setIsAdaModeEnabled] = useState(false);
  const [isColorBlindModeEnabled, setIsColorBlindModeEnabled] = useState(false);
  const [isReadSelectionEnabled, setIsReadSelectionEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedAdaValue = window.localStorage.getItem(ADA_STORAGE_KEY);
    const storedColorBlindValue = window.localStorage.getItem(COLOR_BLIND_STORAGE_KEY);
    const storedReadSelectionValue = window.localStorage.getItem(READ_SELECTION_STORAGE_KEY);
    setIsAdaModeEnabled(storedAdaValue === "true");
    setIsColorBlindModeEnabled(storedColorBlindValue === "true");
    setIsReadSelectionEnabled(storedReadSelectionValue === "true");
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(READ_SELECTION_STORAGE_KEY, String(isReadSelectionEnabled));
  }, [isReadSelectionEnabled]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const speech = window.speechSynthesis;

    if (!isReadSelectionEnabled || !speech || typeof window.SpeechSynthesisUtterance === "undefined") {
      speech?.cancel();
      return;
    }

    function readSelectedText() {
      const selection = window.getSelection();
      const text = selection?.toString().replace(/\s+/g, " ").trim() ?? "";

      if (!text) {
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text.slice(0, READ_SELECTION_MAX_LENGTH));
      speech.cancel();
      speech.speak(utterance);
    }

    document.addEventListener("mouseup", readSelectedText);
    document.addEventListener("touchend", readSelectedText);
    document.addEventListener("keyup", readSelectedText);

    return () => {
      document.removeEventListener("mouseup", readSelectedText);
      document.removeEventListener("touchend", readSelectedText);
      document.removeEventListener("keyup", readSelectedText);
      speech.cancel();
    };
  }, [isReadSelectionEnabled]);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      isAdaModeEnabled,
      setAdaModeEnabled: setIsAdaModeEnabled,
      toggleAdaMode: () => setIsAdaModeEnabled((current) => !current),
      isColorBlindModeEnabled,
      setColorBlindModeEnabled: setIsColorBlindModeEnabled,
      toggleColorBlindMode: () => setIsColorBlindModeEnabled((current) => !current),
      isReadSelectionEnabled,
      setReadSelectionEnabled: setIsReadSelectionEnabled,
      toggleReadSelection: () => setIsReadSelectionEnabled((current) => !current),
    }),
    [isAdaModeEnabled, isColorBlindModeEnabled, isReadSelectionEnabled],
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
