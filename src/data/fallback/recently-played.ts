import type { RecentlyPlayedTrack } from "@/lib/types";

/**
 * Placeholder listening history.
 *
 * Timestamps are computed relative to render time so the "played X ago" labels
 * stay sensible. This is server-rendered, so there is no hydration mismatch.
 */
function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export const recentlyPlayedFallback: readonly RecentlyPlayedTrack[] = [
  {
    id: "trk-1",
    name: "Weightless",
    artists: ["Marconi Union"],
    album: "Weightless",
    spotifyUrl: "https://open.spotify.com/",
    playedAt: minutesAgo(18),
    durationMs: 487_000,
  },
  {
    id: "trk-2",
    name: "Teardrop",
    artists: ["Massive Attack"],
    album: "Mezzanine",
    spotifyUrl: "https://open.spotify.com/",
    playedAt: minutesAgo(64),
    durationMs: 330_000,
  },
  {
    id: "trk-3",
    name: "An Ending (Ascent)",
    artists: ["Brian Eno"],
    album: "Apollo: Atmospheres and Soundtracks",
    spotifyUrl: "https://open.spotify.com/",
    playedAt: minutesAgo(131),
    durationMs: 264_000,
  },
  {
    id: "trk-4",
    name: "Nightcall",
    artists: ["Kavinsky", "Lovefoxxx"],
    album: "OutRun",
    spotifyUrl: "https://open.spotify.com/",
    playedAt: minutesAgo(196),
    durationMs: 257_000,
  },
  {
    id: "trk-5",
    name: "Avril 14th",
    artists: ["Aphex Twin"],
    album: "Drukqs",
    spotifyUrl: "https://open.spotify.com/",
    playedAt: minutesAgo(288),
    durationMs: 125_000,
  },
  {
    id: "trk-6",
    name: "Intro",
    artists: ["The xx"],
    album: "xx",
    spotifyUrl: "https://open.spotify.com/",
    playedAt: minutesAgo(377),
    durationMs: 127_000,
  },
] as const;
