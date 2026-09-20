import { ArrowRight } from "lucide-react";
import { recentlyPlayedFallback } from "@/data/fallback/recently-played";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { RecentlyPlayed } from "@/components/music/recently-played";

export function MusicSection() {
  return (
    <Section id="music">
      <SectionHeading
        eyebrow="Off the clock"
        title="What is playing"
        description="Mostly ambient and instrumental — anything with lyrics competes with the code."
        action={
          <ButtonLink href="/music" variant="ghost" size="sm">
            More
            <ArrowRight />
          </ButtonLink>
        }
      />

      <div className="mt-10 max-w-2xl">
        <RecentlyPlayed tracks={recentlyPlayedFallback} limit={5} />
      </div>
    </Section>
  );
}
