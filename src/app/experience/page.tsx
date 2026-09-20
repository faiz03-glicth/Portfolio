import type { Metadata } from "next";
import { portfolioService } from "@/lib/services/portfolio-service";
import { SectionHeading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { ExperienceTimeline } from "@/components/experience/experience-timeline";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Experience",
  description:
    "Roles, study and the work that came out of each — a chronological timeline.",
  path: "/experience",
});

export default async function ExperiencePage() {
  const experiences = await portfolioService.getExperiences();

  return (
    <Section size="large" containerWidth="prose">
      <SectionHeading
        as="h1"
        eyebrow="Experience"
        title="Timeline"
        description="Roles, study and side work, most recent first."
      />
      <div className="mt-12">
        <ExperienceTimeline experiences={experiences} />
      </div>
    </Section>
  );
}
