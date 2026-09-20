import type { PostgrestError } from "@supabase/supabase-js";
import { getSupabaseClient, type PortfolioClient } from "@/lib/supabase/client";
import { err, ok, type Result, type ResultError } from "@/lib/types";

/**
 * Shared plumbing for repositories.
 *
 * Every repository call funnels through `query()` so that three things are
 * handled in exactly one place: the not-configured case, error sanitisation,
 * and converting thrown exceptions into `Result` values.
 */

/**
 * Translates a PostgREST error into a safe, stable shape.
 *
 * The upstream `message`, `details` and `hint` fields can quote SQL, column
 * names and row contents. None of that should reach a visitor, so the message
 * returned here is written by us and the original is logged server-side only.
 */
function toResultError(error: PostgrestError): ResultError {
  // supabase-js catches transport failures internally and hands them back as a
  // PostgrestError with an empty code, so a genuine network outage arrives here
  // rather than in the catch block below. Without this branch it would be
  // misreported as an upstream database error.
  if (
    !error.code &&
    /fetch failed|network|ENOTFOUND|ECONNREFUSED/i.test(error.message)
  ) {
    return {
      code: "network_error",
      message: "The database could not be reached.",
    };
  }

  // PGRST301 / 401-ish: the anon key was rejected.
  if (error.code === "PGRST301" || error.code === "401") {
    return { code: "unauthorized", message: "That content is not available." };
  }

  // PGRST116: "Results contain 0 rows" from .single()
  if (error.code === "PGRST116") {
    return { code: "not_found", message: "That record does not exist." };
  }

  // 42501 is insufficient_privilege — in practice, an RLS policy denial.
  if (error.code === "42501") {
    return { code: "unauthorized", message: "That content is not available." };
  }

  return {
    code: "upstream_error",
    message: "Content could not be loaded from the database.",
  };
}

/** Logs the real error server-side, where detail is useful and private. */
function logFailure(operation: string, error: unknown): void {
  console.error(`[repository] ${operation} failed`, error);
}

/**
 * Runs a Supabase query and returns a `Result`.
 *
 * `operation` is a short label used only for server logs.
 */
export async function query<T>(
  operation: string,
  run: (client: PortfolioClient) => PromiseLike<{
    data: T | null;
    error: PostgrestError | null;
  }>,
): Promise<Result<T>> {
  const client = getSupabaseClient();

  if (!client) {
    return err({
      code: "not_configured",
      message: "The database is not configured.",
    });
  }

  try {
    const { data, error } = await run(client);

    if (error) {
      logFailure(operation, error);
      return err(toResultError(error));
    }

    if (data === null) {
      return err({ code: "not_found", message: "That record does not exist." });
    }

    return ok(data);
  } catch (cause) {
    // Network failure, DNS, timeout — anything that never reached PostgREST.
    logFailure(operation, cause);
    return err({
      code: "network_error",
      message: "The database could not be reached.",
    });
  }
}
