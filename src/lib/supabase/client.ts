import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabasePublicEnv } from "./env";

/**
 * Anon-key Supabase client.
 *
 * Safe to construct anywhere: the anon key is a public value, and Row Level
 * Security is what actually constrains it (see migration 0002). Reads through
 * this client can only ever see published portfolio content.
 *
 * Returns `null` rather than throwing when Supabase is not configured, because
 * "no database" is a supported state on this project.
 */

export type PortfolioClient = SupabaseClient<Database>;

let cached: PortfolioClient | null = null;

export function getSupabaseClient(): PortfolioClient | null {
  if (cached) return cached;

  const env = getSupabasePublicEnv();
  if (!env) return null;

  cached = createClient<Database>(env.url, env.anonKey, {
    auth: {
      // There is no user session: this client only performs anonymous reads.
      // Leaving these on would have it write tokens to storage for no reason.
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { "x-application-name": "portfolio" },
    },
  });

  return cached;
}
