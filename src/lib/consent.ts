export const CONSENT_VERSION = "2026-05-19-eu-v1";
export const CONSENT_STORAGE_KEY = "trustedbums:consent-preferences";

export type ConsentCategory = "necessary" | "preferences" | "analytics" | "marketing";

export type ConsentPreferences = Record<ConsentCategory, boolean>;

export interface ConsentRecord {
  version: string;
  preferences: ConsentPreferences;
  decidedAt: string;
  source: "banner" | "settings" | "global-privacy-control";
}

export const defaultConsentPreferences: ConsentPreferences = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

export const consentCategories: Array<{
  id: ConsentCategory;
  title: string;
  description: string;
  required?: boolean;
}> = [
  {
    id: "necessary",
    title: "Strictly necessary",
    description: "Required for security, authentication, accessibility, consent storage, and core portal functions.",
    required: true,
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Remembers choices such as display, accessibility, and regional settings that make the product easier to use.",
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Helps us understand aggregate product usage and improve workflows. Disabled unless you opt in.",
  },
  {
    id: "marketing",
    title: "Marketing and engagement",
    description: "Allows campaign measurement, personalized outreach, and similar business-development signals. Disabled unless you opt in.",
  },
];

function hasGlobalPrivacyControl() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return Boolean((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl);
}

export function createConsentRecord(
  preferences: ConsentPreferences,
  source: ConsentRecord["source"] = "settings",
): ConsentRecord {
  return {
    version: CONSENT_VERSION,
    preferences: {
      ...preferences,
      necessary: true,
      marketing: hasGlobalPrivacyControl() ? false : preferences.marketing,
    },
    decidedAt: new Date().toISOString(),
    source: hasGlobalPrivacyControl() && preferences.marketing ? "global-privacy-control" : source,
  };
}

export function readConsentRecord(): ConsentRecord | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as ConsentRecord;

    if (parsed.version !== CONSENT_VERSION || !parsed.preferences?.necessary) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearConsentRecord() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("trustedbums:consent-change", { detail: null }));
}

export function writeConsentRecord(record: ConsentRecord) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  window.dispatchEvent(new CustomEvent("trustedbums:consent-change", { detail: record }));
}

export function canUseConsentCategory(category: ConsentCategory) {
  if (category === "necessary") {
    return true;
  }

  return Boolean(readConsentRecord()?.preferences[category]);
}
