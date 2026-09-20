/**
 * Supabase environment resolution.
 *
 * The whole point of this module is that a missing or partial configuration is
 * a *supported state*, not an error. The site must render without Supabase, so
 * nothing here throws — callers get `null` and fall back to static content.
 *
 * Note the literal `process.env.X` reads. Next.js inlines these at build time
 * by matching the exact expression; `process.env[name]` with a computed key is
 * not substituted and would be `undefined` in the browser bundle.
 */

export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

export type SupabaseServiceEnv = SupabasePublicEnv & {
  serviceRoleKey: string;
};

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** Config safe to use anywhere, including the browser. */
export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!url || !anonKey) return null;
  return { url, anonKey };
}

/**
 * Config including the service-role key.
 *
 * Only ever called from `server.ts`, which is marked `server-only`. If this is
 * reached from a Client Component the import chain fails the build rather than
 * silently shipping the key.
 */
export function getSupabaseServiceEnv(): SupabaseServiceEnv | null {
  const publicEnv = getSupabasePublicEnv();
  const serviceRoleKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!publicEnv || !serviceRoleKey) return null;
  return { ...publicEnv, serviceRoleKey };
}

/** Whether database-backed content is available at all. */
export function isSupabaseConfigured(): boolean {
  return getSupabasePublicEnv() !== null;
}
