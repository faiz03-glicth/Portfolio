import type { RecentlyPlayedTrack } from "@/lib/types";
import type {
  SpotifyImage,
  SpotifyRecentlyPlayedItem,
  SpotifyRecentlyPlayedResponse,
} from "./types";

/**
 * Spotify payload to normalised model.
 *
 * This is the boundary where Spotify's shape stops. Past here the UI sees
 * `RecentlyPlayedTrack` and has no idea which service produced it.
 */

/**
 * Picks the smallest image at least 160px wide, falling back to the largest
 * available. Album art renders at 48px, so fetching the 640px original would
 * waste bandwidth on every card.
 */
function pickAlbumImage(images: SpotifyImage[]): string | undefined {
  if (images.length === 0) return undefined;

  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  const adequate = sorted.find((image) => (image.width ?? 0) >= 160);

  return (adequate ?? sorted[sorted.length - 1])?.url;
}

function toTrack(item: SpotifyRecentlyPlayedItem): RecentlyPlayedTrack {
  const { track, played_at } = item;

  return {
    // Local files have a null track id; played_at is unique per play and makes
    // a stable React key either way.
    id: track.id ?? `local-${played_at}`,
    name: track.name,
    artists: track.artists.map((artist) => artist.name),
    album: track.album.name,
    albumImage: pickAlbumImage(track.album.images),
    // Falls back to Spotify's home page rather than rendering a dead link.
    spotifyUrl: track.external_urls.spotify ?? "https://open.spotify.com",
    playedAt: played_at,
    durationMs: track.duration_ms,
  };
}

export function toRecentlyPlayed(
  response: SpotifyRecentlyPlayedResponse,
): RecentlyPlayedTrack[] {
  // Spotify returns newest first, which is the order we want, but sorting
  // explicitly means a change upstream cannot silently reorder the list.
  return (response.items ?? [])
    .map(toTrack)
    .sort((a, b) => b.playedAt.localeCompare(a.playedAt));
}
