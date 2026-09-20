/**
 * Spotify Web API response shapes.
 *
 * Only the fields this application actually reads are declared. Modelling the
 * whole payload would be a maintenance burden with no benefit — the mapper is
 * the only consumer, and it takes a handful of fields.
 *
 * These types stay inside this directory. Nothing outside the adapter sees
 * them; the rest of the app works with `RecentlyPlayedTrack`.
 */

export type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  /** Seconds until expiry, typically 3600. */
  expires_in: number;
  scope?: string;
};

export type SpotifyImage = {
  url: string;
  height: number | null;
  width: number | null;
};

export type SpotifyArtist = {
  id: string;
  name: string;
};

export type SpotifyAlbum = {
  id: string;
  name: string;
  images: SpotifyImage[];
};

export type SpotifyTrack = {
  id: string | null;
  name: string;
  duration_ms: number;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: { spotify?: string };
};

export type SpotifyRecentlyPlayedItem = {
  track: SpotifyTrack;
  /** ISO timestamp of when playback of this track finished. */
  played_at: string;
};

export type SpotifyRecentlyPlayedResponse = {
  items: SpotifyRecentlyPlayedItem[];
};
