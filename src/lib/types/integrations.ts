/**
 * Normalised models for external providers.
 *
 * The UI only ever sees these shapes — never a raw Spotify, GitHub or GitLab
 * response. Mapping vendor payloads into these types is the entire job of the
 * `mapper.ts` files under `src/lib/integrations/*` on the `integration` branch.
 */

export type RecentlyPlayedTrack = {
  id: string;
  name: string;
  artists: readonly string[];
  album: string;
  albumImage?: string;
  spotifyUrl: string;
  /** ISO timestamp of when the track finished playing. */
  playedAt: string;
  durationMs?: number;
};

/** A single day in the contribution heatmap. */
export type ContributionDay = {
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  count: number;
};

export type CodeActivity = {
  provider: "github" | "gitlab";
  username: string;
  profileUrl: string;
  publicRepos: number;
  followers?: number;
  totalStars?: number;
  /** Contributions over the trailing year, oldest first. */
  contributions: readonly ContributionDay[];
  contributionTotal: number;
  /** Language share by percentage, already sorted descending. */
  topLanguages: readonly { name: string; percentage: number }[];
};

export type RepositorySummary = {
  id: string;
  name: string;
  description?: string;
  url: string;
  source: "github" | "gitlab";
  language?: string;
  topics?: readonly string[];
  stars?: number;
  forks?: number;
  updatedAt?: string;
};
