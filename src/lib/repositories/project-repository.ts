import type { ProjectWithTechnologiesRow } from "@/lib/supabase/database.types";
import type { Project, Result } from "@/lib/types";
import { query } from "./base";
import { toProject } from "./mappers";

/**
 * Project reads.
 *
 * Technologies are fetched in the same round trip via PostgREST's embedded
 * select rather than as a second query per project. That avoids the N+1 that
 * a list of six projects would otherwise produce.
 */

const PROJECT_SELECT = `
  id, slug, title, description, overview, highlights, image_url,
  github_url, gitlab_url, live_url, featured, type, status,
  start_date, end_date, primary_language, sort_order, created_at, updated_at,
  project_technologies ( technology_id, sort_order )
`;

/** Newest and highest-priority first — the order the grid renders. */
function ordered<T extends { sort_order: number; start_date: string }>(
  rows: T[],
): T[] {
  return [...rows].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return b.sort_order - a.sort_order;
    return b.start_date.localeCompare(a.start_date);
  });
}

export const projectRepository = {
  async findAll(): Promise<Result<Project[]>> {
    const result = await query<ProjectWithTechnologiesRow[]>(
      "projectRepository.findAll",
      (client) =>
        client
          .from("projects")
          .select(PROJECT_SELECT)
          .order("sort_order", { ascending: false })
          .returns<ProjectWithTechnologiesRow[]>(),
    );

    if (!result.ok) return result;
    return { ok: true, data: ordered(result.data).map(toProject) };
  },

  async findFeatured(): Promise<Result<Project[]>> {
    const result = await query<ProjectWithTechnologiesRow[]>(
      "projectRepository.findFeatured",
      (client) =>
        client
          .from("projects")
          .select(PROJECT_SELECT)
          .eq("featured", true)
          .order("sort_order", { ascending: false })
          .returns<ProjectWithTechnologiesRow[]>(),
    );

    if (!result.ok) return result;
    return { ok: true, data: ordered(result.data).map(toProject) };
  },

  async findBySlug(slug: string): Promise<Result<Project>> {
    const result = await query<ProjectWithTechnologiesRow>(
      "projectRepository.findBySlug",
      (client) =>
        client
          .from("projects")
          .select(PROJECT_SELECT)
          .eq("slug", slug)
          .single<ProjectWithTechnologiesRow>(),
    );

    if (!result.ok) return result;
    return { ok: true, data: toProject(result.data) };
  },

  /** Slugs only — used to pre-render project pages at build time. */
  async findAllSlugs(): Promise<Result<string[]>> {
    const result = await query<{ slug: string }[]>(
      "projectRepository.findAllSlugs",
      (client) => client.from("projects").select("slug"),
    );

    if (!result.ok) return result;
    return { ok: true, data: result.data.map((row) => row.slug) };
  },
};
