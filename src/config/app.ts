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
   * Each flag is derived from whether the relevant credentials actually exist,
   * so a missing secret degrades to the static fallback instead of throwing.
   * Branches `database` and `integration` extend this object.
   */
  features: {
    supabase: isSupabaseConfigured(),
    spotify: false,
    github: false,
    gitlab: false,
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
