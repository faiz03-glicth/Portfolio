import "server-only";

import { err, ok, type Result, type ResultError } from "@/lib/types";

/**
 * Shared HTTP transport for every external provider.
 *
 * Marked `server-only`: these calls carry API tokens, so an import from a
 * Client Component must fail the build rather than ship credentials.
 *
 * Every adapter goes through this so four things are handled in exactly one
 * place — timeouts, status-code classification, error sanitisation, and
 * turning all of it into a `Result` instead of a thrown exception.
 */

/**
 * A slow provider must not hold a page render open indefinitely. Eight seconds
 * is generous for these APIs and still well inside any sane request budget.
 */
const DEFAULT_TIMEOUT_MS = 8_000;

export type RequestOptions = {
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
  /**
   * Next's fetch cache configuration. Passing `revalidate` here is what gives
   * each provider its own cache window without any adapter managing a cache.
   */
  next?: { revalidate?: number; tags?: string[] };
  /** Skip the cache entirely — used for token exchanges. */
  noStore?: boolean;
};

/** Maps an HTTP status onto a stable, safe error. */
function classify(status: number, provider: string): ResultError {
  if (status === 401 || status === 403) {
    return {
      code: "unauthorized",
      message: `${provider} rejected the request credentials.`,
    };
  }

  if (status === 404) {
    return { code: "not_found", message: `${provider} has no such resource.` };
  }

  if (status === 429) {
    return {
      code: "rate_limited",
      message: `${provider} is rate limiting requests. Try again shortly.`,
    };
  }

  return {
    code: "upstream_error",
    message: `${provider} returned an unexpected response.`,
  };
}

/**
 * Logs the real failure server-side.
 *
 * Deliberately logs the URL's origin and path only. Query strings on these
 * APIs can carry tokens, and a log line is not a safe place for one.
 */
function logFailure(provider: string, url: string, detail: unknown): void {
  let safeUrl = url;
  try {
    const parsed = new URL(url);
    safeUrl = `${parsed.origin}${parsed.pathname}`;
  } catch {
    safeUrl = "<unparseable url>";
  }
  console.error(`[integration:${provider}] ${safeUrl} failed`, detail);
}

/**
 * Performs a JSON request and returns a `Result`.
 *
 * `provider` appears in log lines and in visitor-facing error copy, so it
 * should read as a product name ("Spotify"), not an internal identifier.
 */
export async function requestJson<T>(
  provider: string,
  url: string,
  options: RequestOptions = {},
): Promise<Result<T>> {
  const {
    method = "GET",
    headers = {},
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    next,
    noStore = false,
  } = options;

  // AbortSignal.timeout rather than a manual controller + setTimeout: it
  // cannot leak a pending timer if the request settles first.
  const signal = AbortSignal.timeout(timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: { Accept: "application/json", ...headers },
      body,
      signal,
      ...(noStore ? { cache: "no-store" as const } : {}),
      ...(next && !noStore ? { next } : {}),
    });

    if (!response.ok) {
      // Read the body for the server log only — it never reaches the client.
      const detail = await response.text().catch(() => "<unreadable body>");
      logFailure(provider, url, `${response.status}: ${detail.slice(0, 500)}`);
      return err(classify(response.status, provider));
    }

    const data = (await response.json()) as T;
    return ok(data);
  } catch (cause) {
    logFailure(provider, url, cause);

    // A timeout surfaces as TimeoutError; everything else here is transport.
    const timedOut = cause instanceof Error && cause.name === "TimeoutError";

    return err({
      code: "network_error",
      message: timedOut
        ? `${provider} took too long to respond.`
        : `${provider} could not be reached.`,
    });
  }
}

/** Convenience for the common "missing credentials" case. */
export function notConfigured(provider: string): Result<never> {
  return err({
    code: "not_configured",
    message: `${provider} is not configured.`,
  });
}
