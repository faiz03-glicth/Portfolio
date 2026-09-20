import { ArrowRight } from "lucide-react";
import { experiencesByRecency } from "@/data/experience";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { ExperienceTimeline } from "@/components/experience/experience-timeline";

export function ExperienceSection() {
  const recent = experiencesByRecency().slice(0, 3);

  return (
    <Section id="experience">
      <SectionHeading
        eyebrow="Experience"
        title="Where I have worked"
        action={
          <ButtonLink href="/experience" variant="ghost" size="sm">
            Full timeline
            <ArrowRight />
          </ButtonLink>
        }
      />
      <div className="mt-10 max-w-3xl">
        <ExperienceTimeline experiences={recent} />
      </div>
    </Section>
  );
}
