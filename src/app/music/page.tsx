import type { Metadata } from "next";
import { recentlyPlayedFallback } from "@/data/fallback/recently-played";
import { socialLinkFor } from "@/data/social";
import { SectionHeading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { RecentlyPlayed } from "@/components/music/recently-played";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Music",
  description: "Recently played tracks — what is on while the work happens.",
  path: "/music",
});

export default function MusicPage() {
  const spotify = socialLinkFor("spotify");

  return (
    <Section size="large" containerWidth="prose">
      <SectionHeading
        as="h1"
        eyebrow="Off the clock"
        title="Music"
        description="The most recent tracks from my Spotify account. This is a short trailing window, not a full listening history."
      />

      <div className="mt-12">
        <RecentlyPlayed
          tracks={recentlyPlayedFallback}
          profileUrl={spotify?.url}
        />
      </div>
    </Section>
  );
}
