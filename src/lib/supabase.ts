import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://vaoqvtxqvbptyxddpoju.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "missing-supabase-anon-key";

export type SupabaseAccessTokenMode = "session" | "legacy";
type AccessTokenProvider = (mode: SupabaseAccessTokenMode) => Promise<string | null>;

let accessTokenProvider: AccessTokenProvider | null = null;
let preferredAccessTokenMode: SupabaseAccessTokenMode = "session";

export const isSupabaseConfigured = supabaseAnonKey !== "missing-supabase-anon-key";

export function setSupabaseAccessTokenProvider(provider: AccessTokenProvider | null) {
  accessTokenProvider = provider;
  preferredAccessTokenMode = "session";
}

function getAlternateAccessTokenMode(mode: SupabaseAccessTokenMode): SupabaseAccessTokenMode {
  return mode === "session" ? "legacy" : "session";
}

async function supabaseFetch(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);

  if (response.status !== 401 || !accessTokenProvider) {
    return response;
  }

  const fallbackMode = getAlternateAccessTokenMode(preferredAccessTokenMode);
  const fallbackToken = await accessTokenProvider(fallbackMode);

  if (!fallbackToken) {
    return response;
  }

  const fallbackHeaders = new Headers(init?.headers ?? undefined);
  fallbackHeaders.set("Authorization", `Bearer ${fallbackToken}`);

  const fallbackResponse = await fetch(input, {
    ...init,
    headers: fallbackHeaders,
  });

  if (fallbackResponse.ok) {
    preferredAccessTokenMode = fallbackMode;
  }

  return fallbackResponse;
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    accessToken: async () => accessTokenProvider?.(preferredAccessTokenMode) ?? null,
    global: {
      fetch: supabaseFetch,
    },
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: true,
      persistSession: false,
    },
  },
);
