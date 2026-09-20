import "server-only";

import { notConfigured, requestJson } from "../http";
import type { Result } from "@/lib/types";
import type {
  SpotifyRecentlyPlayedResponse,
  SpotifyTokenResponse,
} from "./types";

/**
 * Spotify transport: credentials, token refresh, and the one endpoint used.
 *
 * Spotify's recently-played endpoint needs a *user* access token, which cannot
 * be obtained from client credentials alone. The flow is therefore:
 *
 *   one-time, by hand   authorise → authorisation code → refresh token
 *   every request       refresh token → short-lived access token → API call
 *
 * The refresh token is long-lived and is the only credential stored. See
 * `docs/integrations.md` for how to obtain it.
 */

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

const PROVIDER = "Spotify";

type SpotifyCredentials = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

function getCredentials(): SpotifyCredentials | null {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN?.trim();

  if (!clientId || !clientSecret || !refreshToken) return null;
  return { clientId, clientSecret, refreshToken };
}

export function isSpotifyConfigured(): boolean {
  return getCredentials() !== null;
}

/**
 * In-process access token cache.
 *
 * Access tokens last an hour. Exchanging the refresh token on every request
 * would triple the latency of the section and burn rate limit for nothing.
 *
 * This lives in module scope, so it is per server instance. That is the right
 * scope: the token is a secret and has no business in a shared or persisted
 * cache.
 */
let tokenCache: { accessToken: string; expiresAt: number } | null = null;

/** Refresh a minute early so a token cannot expire mid-flight. */
const EXPIRY_MARGIN_MS = 60_000;

async function getAccessToken(): Promise<Result<string>> {
  const credentials = getCredentials();
  if (!credentials) return notConfigured(PROVIDER);

  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return { ok: true, data: tokenCache.accessToken };
  }

  const basic = Buffer.from(
    `${credentials.clientId}:${credentials.clientSecret}`,
  ).toString("base64");

  const result = await requestJson<SpotifyTokenResponse>(
    PROVIDER,
    TOKEN_ENDPOINT,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: credentials.refreshToken,
      }).toString(),
      // A token exchange must never be served from a cache.
      noStore: true,
    },
  );

  if (!result.ok) {
    // Drop a stale entry so the next call retries rather than reusing a token
    // that may be exactly why this failed.
    tokenCache = null;
    return result;
  }

  const { access_token, expires_in } = result.data;

  if (!access_token) {
    return {
      ok: false,
      error: {
        code: "invalid_response",
        message: "Spotify returned no access token.",
      },
    };
  }

  tokenCache = {
    accessToken: access_token,
    expiresAt: Date.now() + expires_in * 1000 - EXPIRY_MARGIN_MS,
  };

  return { ok: true, data: access_token };
}

/**
 * Fetches recently played tracks.
 *
 * `revalidateSeconds` is passed through to Next's fetch cache rather than
 * managed here, so the adapter holds no cache of its own beyond the token.
 */
export async function fetchRecentlyPlayed(
  limit: number,
  revalidateSeconds: number,
): Promise<Result<SpotifyRecentlyPlayedResponse>> {
  const token = await getAccessToken();
  if (!token.ok) return token;

  // Spotify caps this endpoint at 50.
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  return requestJson<SpotifyRecentlyPlayedResponse>(
    PROVIDER,
    `${API_BASE}/me/player/recently-played?limit=${safeLimit}`,
    {
      headers: { Authorization: `Bearer ${token.data}` },
      next: { revalidate: revalidateSeconds, tags: ["spotify"] },
    },
  );
}
