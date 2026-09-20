import type { Metadata } from "next";
import { portfolioService } from "@/lib/services/portfolio-service";
import { SectionHeading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { RecentlyPlayed } from "@/components/music/recently-played";
import { loadRecentlyPlayed } from "@/components/sections/music-section";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Music",
  description: "Recently played tracks — what is on while the work happens.",
  path: "/music",
});

export default async function MusicPage() {
  const [socialLinks, recent] = await Promise.all([
    portfolioService.getSocialLinks(),
    loadRecentlyPlayed(20),
  ]);

  const spotify = socialLinks.find((link) => link.platform === "spotify");

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
          tracks={recent.tracks}
          status={recent.status}
          profileUrl={spotify?.url}
        />
      </div>
    </Section>
  );
}
