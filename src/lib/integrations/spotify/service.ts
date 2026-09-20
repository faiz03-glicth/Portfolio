import "server-only";

import { appConfig } from "@/config/app";
import type { RecentlyPlayedTrack, Result } from "@/lib/types";
import { fetchRecentlyPlayed, isSpotifyConfigured } from "./client";
import { toRecentlyPlayed } from "./mapper";

/**
 * Spotify's public surface.
 *
 * Returns a `Result` rather than silently substituting data. Unlike portfolio
 * content, there is no honest fallback for listening history — rendering
 * invented tracks as if they were real plays would be a lie, not a
 * degradation. The caller shows an unavailable state instead.
 */
export const spotifyService = {
  isConfigured: isSpotifyConfigured,

  async getRecentlyPlayed(
    limit = 10,
  ): Promise<Result<readonly RecentlyPlayedTrack[]>> {
    const response = await fetchRecentlyPlayed(
      limit,
      appConfig.cache.nowPlaying,
    );

    if (!response.ok) return response;
    return { ok: true, data: toRecentlyPlayed(response.data) };
  },
};
