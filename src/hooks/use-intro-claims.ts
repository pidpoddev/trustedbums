import { useCallback, useMemo, useState } from "react";
import { type ClaimStatus, type IntroClaim, mockIntroClaims } from "@/data/mockData";

const CLAIMS_STORAGE_KEY = "trustedbums:intro-claims";
const STATUS_STORAGE_KEY = "trustedbums:intro-claim-statuses";
const CLAIM_LIFETIME_DAYS = 45;

type NewIntroClaim = Pick<
  IntroClaim,
  "opportunityId" | "opportunityTitle" | "bumAlias" | "contact" | "company" | "strength"
> & {
  note?: string;
};

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

type ClaimStatusOverrides = Record<string, ClaimStatus>;

function readStoredClaims() {
  try {
    const raw = window.localStorage.getItem(CLAIMS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as IntroClaim[]) : [];
  } catch {
    return [];
  }
}

function readStatusOverrides() {
  try {
    const raw = window.localStorage.getItem(STATUS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ClaimStatusOverrides) : {};
  } catch {
    return {};
  }
}

function writeStoredClaims(claims: IntroClaim[]) {
  window.localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(claims));
}

function writeStatusOverrides(overrides: ClaimStatusOverrides) {
  window.localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(overrides));
}

export function useIntroClaims() {
  const [storedClaims, setStoredClaims] = useState<IntroClaim[]>(readStoredClaims);
  const [statusOverrides, setStatusOverrides] = useState<ClaimStatusOverrides>(readStatusOverrides);

  const introClaims = useMemo(
    () =>
      [...mockIntroClaims, ...storedClaims].map((claim) => ({
        ...claim,
        status: statusOverrides[claim.contact] ?? claim.status,
      })),
    [statusOverrides, storedClaims],
  );

  const addIntroClaim = useCallback((claim: NewIntroClaim) => {
    const today = new Date();
    const nextClaim: IntroClaim = {
      id: `ic-${Date.now()}`,
      status: "PROPOSED",
      createdAt: toDateInputValue(today),
      expiresAt: toDateInputValue(addDays(today, CLAIM_LIFETIME_DAYS)),
      ...claim,
    };

    setStoredClaims((currentClaims) => {
      const nextClaims = [nextClaim, ...currentClaims];
      writeStoredClaims(nextClaims);
      return nextClaims;
    });

    return nextClaim;
  }, []);

  const updateIntroClaimStatus = useCallback((contact: string, status: ClaimStatus) => {
    setStatusOverrides((currentOverrides) => {
      const nextOverrides = { ...currentOverrides, [contact]: status };
      writeStatusOverrides(nextOverrides);
      return nextOverrides;
    });
  }, []);

  return { introClaims, addIntroClaim, updateIntroClaimStatus };
}
