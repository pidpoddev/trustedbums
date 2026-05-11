import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://vaoqvtxqvbptyxddpoju.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "missing-supabase-anon-key";

type AccessTokenProvider = () => Promise<string | null>;

let accessTokenProvider: AccessTokenProvider | null = null;

export const isSupabaseConfigured = supabaseAnonKey !== "missing-supabase-anon-key";

export function setSupabaseAccessTokenProvider(provider: AccessTokenProvider | null) {
  accessTokenProvider = provider;
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    accessToken: async () => accessTokenProvider?.() ?? null,
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: true,
      persistSession: false,
    },
  },
);
