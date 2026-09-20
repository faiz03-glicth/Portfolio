import { ArrowRight } from "lucide-react";
import { projectService } from "@/lib/services/project-service";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { ProjectGrid } from "@/components/projects/project-grid";

export async function FeaturedProjectsSection() {
  const projects = await projectService.getFeaturedProjects();

  return (
    <Section id="projects" tone="muted">
      <SectionHeading
        eyebrow="Selected work"
        title="Projects"
        description="A few things worth explaining in detail. The rest are on the projects page."
        action={
          <ButtonLink href="/projects" variant="outline" size="sm">
            All projects
            <ArrowRight />
          </ButtonLink>
        }
      />
      <ProjectGrid projects={projects} className="mt-10" />
    </Section>
  );
}
