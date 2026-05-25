const LINKEDIN_PEOPLE_SEARCH_BASE = "https://www.linkedin.com/search/results/people/";

function getLinkedInCompanySlug(linkedInCompanyUrl?: string | null) {
  if (!linkedInCompanyUrl?.trim()) {
    return null;
  }

  try {
    const url = new URL(
      linkedInCompanyUrl.startsWith("http")
        ? linkedInCompanyUrl
        : `https://${linkedInCompanyUrl}`,
    );
    const companyIndex = url.pathname.split("/").filter(Boolean).indexOf("company");
    const parts = url.pathname.split("/").filter(Boolean);
    return companyIndex >= 0 ? parts[companyIndex + 1] ?? null : null;
  } catch {
    return null;
  }
}

export function buildLinkedInFirstConnectionsUrl(companyName: string, linkedInCompanyUrl?: string | null) {
  const companySlug = getLinkedInCompanySlug(linkedInCompanyUrl);

  if (companySlug) {
    return `https://www.linkedin.com/company/${encodeURIComponent(companySlug)}/people/`;
  }

  const params = new URLSearchParams({
    keywords: companyName,
    network: '["F"]',
  });

  return `${LINKEDIN_PEOPLE_SEARCH_BASE}?${params.toString()}`;
}
