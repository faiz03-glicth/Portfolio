import { ArrowRight } from "lucide-react";
import { recentlyPlayedFallback } from "@/data/fallback/recently-played";
import { spotifyService } from "@/lib/integrations/spotify";
import type { AsyncStatus, RecentlyPlayedTrack } from "@/lib/types";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { RecentlyPlayed } from "@/components/music/recently-played";

/**
 * Resolves listening data into tracks plus a render state.
 *
 * When Spotify is configured but failing, this returns an error state rather
 * than falling back to the sample tracks. Invented plays presented as a real
 * listening history would be a fabrication, not a graceful degradation — the
 * honest answer is "unavailable".
 */
export async function loadRecentlyPlayed(limit: number): Promise<{
  tracks: readonly RecentlyPlayedTrack[];
  status: AsyncStatus;
  isLive: boolean;
}> {
  if (!spotifyService.isConfigured()) {
    return {
      tracks: recentlyPlayedFallback,
      status: "success",
      isLive: false,
    };
  }

  const result = await spotifyService.getRecentlyPlayed(limit);

  if (!result.ok) {
    return { tracks: [], status: "error", isLive: true };
  }

  return {
    tracks: result.data,
    status: result.data.length === 0 ? "empty" : "success",
    isLive: true,
  };
}

export async function MusicSection() {
  const { tracks, status, isLive } = await loadRecentlyPlayed(5);

  return (
    <Section id="music">
      <SectionHeading
        eyebrow="Off the clock"
        title="What is playing"
        description={
          isLive
            ? "The most recent tracks from my Spotify account."
            : "Mostly ambient and instrumental — anything with lyrics competes with the code."
        }
        action={
          <ButtonLink href="/music" variant="ghost" size="sm">
            More
            <ArrowRight />
          </ButtonLink>
        }
      />

      <div className="mt-10 max-w-2xl">
        <RecentlyPlayed tracks={tracks} status={status} limit={5} />
      </div>
    </Section>
  );
}
