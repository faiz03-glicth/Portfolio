import { ArrowRight } from "lucide-react";
import { portfolioService } from "@/lib/services/portfolio-service";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { ExperienceTimeline } from "@/components/experience/experience-timeline";

export async function ExperienceSection() {
  const experiences = await portfolioService.getExperiences();
  const recent = experiences.slice(0, 3);

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
