import { NextResponse } from "next/server";
import { appConfig } from "@/config/app";
import { spotifyService } from "@/lib/integrations/spotify";

/**
 * GET /api/spotify/recently-played
 *
 * Returns normalised `RecentlyPlayedTrack[]`. The page itself does not need
 * this — the music section renders server-side — but the endpoint exists so
 * the data is reachable without a full page render: client-side polling for a
 * live "now playing" widget, or another surface consuming the same feed.
 *
 * Two things this route guarantees:
 *
 *   1. No credential ever leaves the server. The refresh token, client secret
 *      and access token stay inside the adapter; the response is only the
 *      normalised model.
 *   2. No upstream error text is echoed. `Result.error.message` is written by
 *      us for a visitor, so a failure cannot leak a Spotify response body.
 */

export const dynamic = "force-dynamic";

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;

function parseLimit(value: string | null): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  return Math.min(Math.max(parsed, 1), MAX_LIMIT);
}

/** Maps a failure onto the status code that actually describes it. */
const STATUS_BY_CODE: Record<string, number> = {
  not_configured: 503,
  unauthorized: 502,
  rate_limited: 429,
  network_error: 504,
  upstream_error: 502,
  invalid_response: 502,
};

export async function GET(request: Request) {
  if (!spotifyService.isConfigured()) {
    return NextResponse.json(
      { error: "Spotify is not configured." },
      { status: 503 },
    );
  }

  const limit = parseLimit(new URL(request.url).searchParams.get("limit"));
  const result = await spotifyService.getRecentlyPlayed(limit);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error.message, code: result.error.code },
      { status: STATUS_BY_CODE[result.error.code] ?? 502 },
    );
  }

  return NextResponse.json(
    { tracks: result.data },
    {
      headers: {
        // Lets a CDN or the browser reuse the response for the same window the
        // adapter caches it for, and serve a stale copy briefly while it
        // refreshes rather than showing an error.
        "Cache-Control": `public, max-age=0, s-maxage=${appConfig.cache.nowPlaying}, stale-while-revalidate=${appConfig.cache.nowPlaying * 5}`,
      },
    },
  );
}
