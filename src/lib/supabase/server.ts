import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabaseServiceEnv } from "./env";
import type { PortfolioClient } from "./client";

/**
 * Service-role Supabase client — bypasses Row Level Security entirely.
 *
 * The `server-only` import at the top is the guard that matters. If any Client
 * Component ever pulls this module into its import graph, the build fails with
 * an explicit error instead of quietly bundling the service-role key into the
 * JavaScript sent to visitors.
 *
 * Nothing in the rendering path needs this. It exists for privileged
 * operations — seeding, admin tooling, and any future write path. Page and
 * section code should use `getSupabaseClient()` and let RLS do its job.
 */

let cached: PortfolioClient | null = null;

export function getSupabaseServiceClient(): PortfolioClient | null {
  if (cached) return cached;

  const env = getSupabaseServiceEnv();
  if (!env) return null;

  cached = createClient<Database>(env.url, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { "x-application-name": "portfolio-server" },
    },
  });

  return cached;
}
