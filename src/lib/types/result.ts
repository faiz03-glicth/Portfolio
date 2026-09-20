/**
 * Explicit success/failure envelope for anything that can fail at runtime —
 * database reads and external API calls.
 *
 * Returning a `Result` instead of throwing is what makes the "one provider
 * outage must not break the page" rule structural rather than a convention:
 * a caller cannot forget to handle failure, because it cannot reach `.data`
 * without narrowing on `ok` first.
 */

export type Result<T, E = ResultError> =
  { ok: true; data: T } | { ok: false; error: E };

export type ResultError = {
  /** Stable, machine-readable reason. */
  code:
    | "not_configured"
    | "unauthorized"
    | "rate_limited"
    | "upstream_error"
    | "network_error"
    | "not_found"
    | "invalid_response"
    | "unknown";
  /** Safe to show a visitor. Never contains tokens, URLs with keys, or stack traces. */
  message: string;
};

export function ok<T>(data: T): Result<T, never> {
  return { ok: true, data };
}

export function err<E = ResultError>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** The four states every asynchronous section can be in. */
export type AsyncStatus = "loading" | "error" | "empty" | "success";
