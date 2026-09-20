/**
 * Application/runtime configuration — environment, feature flags, cache
 * lifetimes. Kept apart from `site.ts` (identity) and `theme.ts` (appearance).
 *
 * Feature flags are what let later branches light up without editing the
 * components that render the sections. On `main` every external integration is
 * off and the UI renders its static fallback data instead.
 */

import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AppEnv = "local" | "development" | "testing" | "production";

function resolveEnv(): AppEnv {
  const value = process.env.NEXT_PUBLIC_APP_ENV;
  if (
    value === "local" ||
    value === "development" ||
    value === "testing" ||
    value === "production"
  ) {
    return value;
  }
  return process.env.NODE_ENV === "production" ? "production" : "local";
}

export const appConfig = {
  env: resolveEnv(),
  isProduction: resolveEnv() === "production",

  /**
   * Derived from whether the relevant configuration actually exists, so a
   * missing value degrades to a fallback instead of throwing.
   *
   * Only Supabase appears here. The external integrations are deliberately
   * *not* flags on this object: their credentials are server-only variables
   * with no `NEXT_PUBLIC_` prefix, so this module would report them as absent
   * whenever it is evaluated in the browser. A flag that is silently wrong in
   * half the places it is read is worse than no flag.
   *
   * Instead each adapter owns the question — `githubService.isConfigured()`,
   * `gitlabService.isConfigured()`, `spotifyService.isConfigured()` — and
   * those modules are `server-only`, so asking from the wrong place is a build
   * error rather than a wrong answer.
   */
  features: {
    supabase: isSupabaseConfigured(),
  },

  /** Revalidation windows in seconds, per data class. */
  cache: {
    /** Portfolio content: static on `main`, database-backed later. */
    content: 60 * 60,
    /** Repository listings change slowly. */
    repositories: 60 * 30,
    /** Listening history changes fast; keep it short but not zero. */
    nowPlaying: 60,
  },
} as const;

export type AppConfig = typeof appConfig;
