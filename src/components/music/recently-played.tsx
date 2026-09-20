import { Music2 } from "lucide-react";
import type { AsyncStatus, RecentlyPlayedTrack } from "@/lib/types";
import { IntegrationCard } from "@/components/integrations/integration-card";
import { TrackItem } from "./track-item";

/**
 * Recently played tracks.
 *
 * Titled "Recently Played" deliberately — Spotify's endpoint returns a short
 * trailing window, not a listening history, and labelling it otherwise would
 * overstate what the data is.
 */
export function RecentlyPlayed({
  tracks,
  status = "success",
  limit,
  profileUrl,
}: {
  tracks: readonly RecentlyPlayedTrack[];
  status?: AsyncStatus;
  limit?: number;
  profileUrl?: string;
}) {
  const visible = limit ? tracks.slice(0, limit) : tracks;
  const resolvedStatus: AsyncStatus =
    status === "success" && visible.length === 0 ? "empty" : status;

  return (
    <IntegrationCard
      title="Recently Played"
      subtitle="Most recent tracks from Spotify"
      icon={Music2}
      href={profileUrl}
      status={resolvedStatus}
      emptyTitle="Nothing played recently"
      emptyDescription="No tracks in the last listening window."
      errorTitle="Spotify unavailable"
      errorDescription="Listening data could not be loaded. Everything else on this page is unaffected."
      loadingRows={4}
    >
      <ul className="-mx-2 space-y-0.5">
        {visible.map((track) => (
          <TrackItem key={`${track.id}-${track.playedAt}`} track={track} />
        ))}
      </ul>
    </IntegrationCard>
  );
}
