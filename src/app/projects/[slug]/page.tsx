import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { portfolioService } from "@/lib/services/portfolio-service";
import { projectService } from "@/lib/services/project-service";
import { Container } from "@/components/ui/container";
import { Prose } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { TechnologyList } from "@/components/ui/technology-badge";
import { ProjectLinks } from "@/components/projects/project-links";
import {
  ProjectStatusBadge,
  projectTypeLabel,
} from "@/components/projects/project-status-badge";
import { ProjectThumbnail } from "@/components/projects/project-thumbnail";
import { buildMetadata } from "@/lib/metadata";
import { formatDateRange } from "@/lib/utils";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Only the slugs `generateStaticParams` returns may be served.
 *
 * Without this, an unknown slug is rendered on demand, and because this
 * segment carries a revalidation window the `notFound()` result gets
 * prerendered and cached as a **200** — a soft 404. Search engines then index
 * every mistyped project URL as a real page. (Observable before the fix:
 * `x-nextjs-prerender: 1` on a 200 response for a nonexistent project.)
 *
 * With `dynamicParams = false`, Next rejects an unlisted slug before the page
 * runs and returns a genuine 404.
 *
 * The trade-off, stated plainly: a project added to the database after a build
 * has no page until the next build. That is acceptable here because the
 * pipeline rebuilds on every push to `main` and portfolio content changes
 * rarely — and a soft 404 is the worse failure of the two.
 */
export const dynamicParams = false;

/**
 * Pre-renders every project at build time; the set is known and small.
 *
 * Reads slugs through the service, so a database-backed project gets a static
 * page too. If Supabase is unreachable during the build this falls back to the
 * static slugs rather than producing a site with no project pages.
 */
export async function generateStaticParams() {
  const slugs = await portfolioService.getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await projectService.getProjectBySlug(slug);

  if (!project) {
    return buildMetadata({ title: "Project not found", noIndex: true });
  }

  return buildMetadata({
    title: project.title,
    description: project.description,
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await projectService.getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <article>
      <Section size="compact" containerWidth="prose" className="pb-0">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors duration-base ease-standard hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-4" />
          All projects
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <ProjectStatusBadge status={project.status} />
          <span className="font-mono text-2xs uppercase tracking-[0.14em] text-muted-foreground">
            {projectTypeLabel(project.type)}
          </span>
          <span aria-hidden className="text-muted-foreground">
            ·
          </span>
          <span className="font-mono text-2xs text-muted-foreground">
            {formatDateRange(project.startDate, project.endDate)}
          </span>
        </div>

        <h1 className="mt-4 text-4xl sm:text-5xl">{project.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        <ProjectLinks project={project} className="-ml-2 mt-6" />
      </Section>

      <Container width="prose" className="mt-12">
        <ProjectThumbnail
          project={project}
          priority
          className="rounded-xl border border-border"
        />
      </Container>

      <Section containerWidth="prose">
        {project.overview && project.overview.length > 0 ? (
          <Prose paragraphs={project.overview} />
        ) : (
          <p className="text-base leading-relaxed text-muted-foreground">
            A longer write-up for this project has not been published yet. The
            repository links above have the source and commit history.
          </p>
        )}

        {project.highlights && project.highlights.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-xl">Notable details</h2>
            <ul className="mt-4 space-y-2.5">
              {project.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="relative pl-5 leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-[0.65em] before:size-1.5 before:rounded-full before:bg-primary/60 before:content-['']"
                >
                  {highlight}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-mono text-2xs uppercase tracking-[0.16em] text-muted-foreground">
            Built with
          </h2>
          <TechnologyList ids={project.technologies} className="mt-3" />
        </section>
      </Section>
    </article>
  );
}
