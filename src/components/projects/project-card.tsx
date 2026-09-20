import Link from "next/link";
import { GitFork, Star } from "lucide-react";
import type { Project } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TechnologyList } from "@/components/ui/technology-badge";
import { formatCompactNumber, formatMonthYear } from "@/lib/utils";
import { ProjectLinks } from "./project-links";
import { ProjectStatusBadge, projectTypeLabel } from "./project-status-badge";
import { ProjectThumbnail } from "./project-thumbnail";

/**
 * Renders one project. Its only job is presentation — it does not fetch, sort
 * or filter, and it does not care which source the record came from.
 *
 * The whole card is clickable via a stretched overlay on the title link, which
 * keeps a single meaningful link in the accessibility tree while still giving
 * a large pointer target. `ProjectLinks` raises itself above that overlay.
 */
export function ProjectCard({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  const hasRepoStats =
    typeof project.stars === "number" || typeof project.forks === "number";

  // Only curated projects (static or database) have a write-up, and therefore
  // a detail page. A repository discovered through the GitHub or GitLab
  // adapter has no such route, so its title links to the repository instead of
  // to a URL that would 404.
  const isCurated =
    project.source === "static" || project.source === "database";
  const detailHref = isCurated
    ? `/projects/${project.slug}`
    : (project.githubUrl ?? project.gitlabUrl ?? project.liveUrl);

  return (
    <Card interactive className="flex h-full flex-col overflow-hidden">
      <ProjectThumbnail project={project} priority={priority} />

      <CardHeader className="gap-3 pb-0">
        <div className="flex flex-wrap items-center gap-2">
          <ProjectStatusBadge status={project.status} />
          <span className="font-mono text-2xs uppercase tracking-[0.14em] text-muted-foreground">
            {projectTypeLabel(project.type)}
          </span>
          <span className="ml-auto font-mono text-2xs text-muted-foreground">
            {formatMonthYear(project.startDate)}
          </span>
        </div>

        <div className="space-y-1.5">
          <CardTitle>
            {isCurated ? (
              <Link
                href={detailHref ?? "/projects"}
                className="rounded-sm after:absolute after:inset-0 after:content-['']"
              >
                {project.title}
              </Link>
            ) : detailHref ? (
              <a
                href={detailHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm after:absolute after:inset-0 after:content-['']"
              >
                {project.title}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              project.title
            )}
          </CardTitle>
          <CardDescription>{project.description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="mt-auto space-y-4 pt-4">
        <TechnologyList ids={project.technologies} limit={5} />

        {hasRepoStats ? (
          <div className="flex items-center gap-4 font-mono text-2xs text-muted-foreground">
            {typeof project.stars === "number" ? (
              <span className="inline-flex items-center gap-1">
                <Star aria-hidden className="size-3" />
                {formatCompactNumber(project.stars)}
                <span className="sr-only"> stars</span>
              </span>
            ) : null}
            {typeof project.forks === "number" ? (
              <span className="inline-flex items-center gap-1">
                <GitFork aria-hidden className="size-3" />
                {formatCompactNumber(project.forks)}
                <span className="sr-only"> forks</span>
              </span>
            ) : null}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="py-3">
        <ProjectLinks project={project} className="-ml-2" />
      </CardFooter>
    </Card>
  );
}
