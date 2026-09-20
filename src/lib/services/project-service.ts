import "server-only";

import { githubService } from "@/lib/integrations/github";
import { gitlabService } from "@/lib/integrations/gitlab";
import type { Project } from "@/lib/types";
import { portfolioService } from "./portfolio-service";

/**
 * The unified project list.
 *
 * Callers ask for projects. They do not ask GitHub for repositories, or GitLab
 * for projects, or the database for rows — that is the entire point. Adding a
 * fourth source means editing this file and nothing else.
 *
 * Curated projects (database or static) always win over repository-derived
 * ones: a hand-written description and write-up is better than a repo blurb,
 * and the same work appearing twice under two sources looks careless.
 */

/**
 * Normalises a repository URL for comparison.
 *
 * `https://github.com/User/Repo.git` and `http://github.com/user/repo/` are
 * the same repository, and a curated project will not necessarily have stored
 * it in the same form the API returns.
 */
function repoKey(url: string | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const path = parsed.pathname
      .replace(/\.git$/, "")
      .replace(/^\/+|\/+$/g, "")
      .toLowerCase();
    return `${parsed.hostname.toLowerCase()}/${path}`;
  } catch {
    return null;
  }
}

/** Every repository a curated project already points at. */
function curatedRepoKeys(projects: readonly Project[]): Set<string> {
  const keys = new Set<string>();

  for (const project of projects) {
    for (const url of [project.githubUrl, project.gitlabUrl]) {
      const key = repoKey(url);
      if (key) keys.add(key);
    }
  }

  return keys;
}

/** Featured first, then most recently updated. */
function byPriority(a: Project, b: Project): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;

  const aDate = a.updatedAt ?? a.endDate ?? a.startDate;
  const bDate = b.updatedAt ?? b.endDate ?? b.startDate;
  return bDate.localeCompare(aDate);
}

export const projectService = {
  /**
   * Curated projects, plus any repository not already represented by one.
   *
   * Each provider is fetched independently and a failure in one is skipped
   * rather than propagated: GitHub being down must not empty a list that the
   * database could have filled on its own.
   */
  async getProjects(): Promise<Project[]> {
    const curated = await portfolioService.getProjects();

    // Both forges are queried concurrently. `allSettled` is not needed — the
    // services return Result rather than rejecting.
    const [github, gitlab] = await Promise.all([
      githubService.isConfigured()
        ? githubService.getProjects()
        : Promise.resolve(null),
      gitlabService.isConfigured()
        ? gitlabService.getProjects()
        : Promise.resolve(null),
    ]);

    const seen = curatedRepoKeys(curated);
    const discovered: Project[] = [];

    for (const result of [github, gitlab]) {
      if (!result || !result.ok) continue;

      for (const project of result.data) {
        const key = repoKey(project.githubUrl ?? project.gitlabUrl);

        // Skip anything a curated entry already covers, and guard against the
        // same repository being mirrored to both forges.
        if (key && seen.has(key)) continue;
        if (key) seen.add(key);

        discovered.push(project);
      }
    }

    return [...curated, ...discovered].sort(byPriority);
  },

  /** Featured projects are always curated — a repo cannot promote itself. */
  async getFeaturedProjects(): Promise<Project[]> {
    return [...(await portfolioService.getFeaturedProjects())];
  },

  /**
   * Detail pages are only rendered for curated projects.
   *
   * A repository-derived record has no write-up, so giving it a detail page
   * would produce a near-empty page and a URL worth indexing for nothing.
   */
  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    return portfolioService.getProjectBySlug(slug);
  },
};
