import type { Metadata } from "next";
import { portfolioService } from "@/lib/services/portfolio-service";
import { SectionHeading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { ProjectFilter } from "@/components/projects/project-filter";
import { ProjectGrid } from "@/components/projects/project-grid";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Projects",
  description:
    "Applications, APIs and tools — what each one does and why it was built that way.",
  path: "/projects",
});

type ProjectsPageProps = {
  // Next 15 delivers search params as a promise.
  searchParams: Promise<{ type?: string }>;
};

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const [{ type }, projects] = await Promise.all([
    searchParams,
    portfolioService.getProjects(),
  ]);

  // Ignore an unknown `type` rather than 404-ing — a stale shared link should
  // still land somewhere useful.
  const known = projects.some((project) => project.type === type);
  const activeType = known ? type : undefined;

  const visible = activeType
    ? projects.filter((project) => project.type === activeType)
    : projects;

  return (
    <Section size="large">
      <SectionHeading
        as="h1"
        eyebrow="Work"
        title="Projects"
        description="Some shipped, some still moving. Each one has a short write-up explaining the decisions behind it."
      />

      <div className="mt-8">
        <ProjectFilter projects={projects} active={activeType} />
      </div>

      <ProjectGrid projects={visible} className="mt-8" />
    </Section>
  );
}
