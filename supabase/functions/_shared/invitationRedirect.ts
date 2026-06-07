const DEFAULT_FALLBACK_URL = "https://trustedbums.com/login";
const DEFAULT_ALLOWED_ORIGINS = ["https://trustedbums.com", "https://www.trustedbums.com"];

export interface InvitationRedirectOptions {
  fallbackUrl?: string | null;
  allowedOrigins?: string | null;
  clerkFrontendApiUrl?: string | null;
}

function parseOrigin(value: string | null | undefined) {
  if (!value?.trim()) return null;

  try {
    return new URL(value.trim()).origin;
  } catch {
    return null;
  }
}

function allowedOriginSet(options: InvitationRedirectOptions) {
  const origins = new Set(DEFAULT_ALLOWED_ORIGINS);

  for (const rawOrigin of options.allowedOrigins?.split(",") ?? []) {
    const origin = parseOrigin(rawOrigin);
    if (origin) origins.add(origin);
  }

  const clerkOrigin = parseOrigin(options.clerkFrontendApiUrl);
  if (clerkOrigin) origins.add(clerkOrigin);

  return origins;
}

export function normalizeInvitationRedirectUrl(
  value: unknown,
  request: Request,
  options: InvitationRedirectOptions = {},
) {
  const allowedOrigins = allowedOriginSet(options);
  const fallbackOrigin = parseOrigin(options.fallbackUrl);
  const fallbackUrl =
    fallbackOrigin && allowedOrigins.has(fallbackOrigin)
      ? new URL("/login", fallbackOrigin).toString()
      : DEFAULT_FALLBACK_URL;

  const candidates = [typeof value === "string" ? value : null, request.headers.get("origin")].filter(
    (candidate): candidate is string => Boolean(candidate?.trim()),
  );

  for (const candidate of candidates) {
    try {
      const url = new URL(candidate.trim());
      if (allowedOrigins.has(url.origin)) {
        return new URL("/login", url.origin).toString();
      }
    } catch {
      continue;
    }
  }

  return fallbackUrl;
}
