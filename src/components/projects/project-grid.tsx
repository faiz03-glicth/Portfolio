import type { Project } from "@/lib/types";
import { EmptyState } from "@/components/ui/state";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./project-card";

export function ProjectGrid({
  projects,
  columns = 3,
  className,
}: {
  projects: readonly Project[];
  columns?: 2 | 3;
  className?: string;
}) {
  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects to show yet"
        description="Work in progress — check back shortly, or reach out directly."
      />
    );
  }

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        className,
      )}
    >
      {projects.map((project, index) => (
        <li key={project.id} className="flex">
          {/* First row gets fetch priority; the rest lazy-load. */}
          <ProjectCard project={project} priority={index < columns} />
        </li>
      ))}
    </ul>
  );
}
