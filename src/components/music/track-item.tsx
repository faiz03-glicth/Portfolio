import { Music2, Play } from "lucide-react";
import type { RecentlyPlayedTrack } from "@/lib/types";
import { formatDuration, formatRelativeTime } from "@/lib/utils";

/**
 * One recently played track.
 *
 * Album art is a plain `<img>` rather than `next/image`: the URLs come from
 * Spotify's CDN, they are already correctly sized at 64px, and routing them
 * through the optimiser would add a server hop for no benefit. The element
 * degrades to an icon when there is no artwork.
 */
export function TrackItem({ track }: { track: RecentlyPlayedTrack }) {
  return (
    <li className="group flex items-center gap-3 rounded-lg p-2 transition-colors duration-base ease-standard hover:bg-elevated">
      <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-muted">
        {track.albumImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.albumImage}
            alt=""
            width={48}
            height={48}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <Music2 aria-hidden className="size-4 text-muted-foreground" />
        )}
        <span className="absolute inset-0 grid place-items-center bg-background/60 opacity-0 transition-opacity duration-base ease-standard group-hover:opacity-100">
          <Play aria-hidden className="size-4 text-foreground" />
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <a
          href={track.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate rounded-sm text-sm font-medium transition-colors duration-base ease-standard hover:text-primary"
        >
          {track.name}
          <span className="sr-only"> on Spotify (opens in a new tab)</span>
        </a>
        <span className="block truncate text-xs text-muted-foreground">
          {track.artists.join(", ")} · {track.album}
        </span>
      </span>

      <span className="shrink-0 text-right font-mono text-2xs text-muted-foreground">
        <time dateTime={track.playedAt} className="block">
          {formatRelativeTime(track.playedAt)}
        </time>
        {typeof track.durationMs === "number" ? (
          <span className="block text-muted-foreground/70">
            {formatDuration(track.durationMs)}
          </span>
        ) : null}
      </span>
    </li>
  );
}
