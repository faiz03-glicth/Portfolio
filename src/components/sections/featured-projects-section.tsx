import { ArrowRight } from "lucide-react";
import { featuredProjects } from "@/data/projects";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { ProjectGrid } from "@/components/projects/project-grid";

export function FeaturedProjectsSection() {
  const projects = featuredProjects();

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
