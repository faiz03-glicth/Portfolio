import "server-only";

import type { CodeActivity, Project, Result } from "@/lib/types";
import {
  fetchContributions,
  fetchRepositories,
  fetchUser,
  hasGitHubToken,
  isGitHubConfigured,
} from "./client";
import { toCodeActivity, toProject, toRepositorySummary } from "./mapper";

/**
 * GitHub's public surface.
 *
 * Callers get normalised models and never see a GitHub response shape. Note
 * that nothing here throws: every path returns a `Result`, so a caller cannot
 * forget that GitHub might be down.
 */

/**
 * Repositories that are noise on a portfolio: forks the visitor did not write,
 * and anything without a description, which renders as an empty card.
 */
function isWorthShowing(repository: {
  fork: boolean;
  archived: boolean;
  description: string | null;
}): boolean {
  return !repository.fork && repository.description !== null;
}

export const githubService = {
  isConfigured: isGitHubConfigured,
  hasToken: hasGitHubToken,

  /**
   * Profile, repositories and contributions in one normalised model.
   *
   * The three requests run concurrently — sequentially they would stack three
   * round trips onto the page render for no reason.
   */
  async getActivity(): Promise<Result<CodeActivity>> {
    const [user, repositories, contributions] = await Promise.all([
      fetchUser(),
      fetchRepositories(),
      fetchContributions(),
    ]);

    if (!user.ok) return user;
    if (!repositories.ok) return repositories;

    // Contributions are optional: a failure there degrades the heatmap, not
    // the whole panel.
    const calendar = contributions.ok ? contributions.data : null;

    return {
      ok: true,
      data: toCodeActivity({
        user: user.data,
        repositories: repositories.data,
        contributions: calendar,
      }),
    };
  },

  /** Repositories as `Project` records, for the unified project list. */
  async getProjects(limit = 12): Promise<Result<Project[]>> {
    const repositories = await fetchRepositories();
    if (!repositories.ok) return repositories;

    return {
      ok: true,
      data: repositories.data
        .filter(isWorthShowing)
        .slice(0, limit)
        .map(toProject),
    };
  },

  /** The lighter summary shape, for listings that do not need a full project. */
  async getRepositories(limit = 12) {
    const repositories = await fetchRepositories();
    if (!repositories.ok) return repositories;

    return {
      ok: true as const,
      data: repositories.data
        .filter(isWorthShowing)
        .slice(0, limit)
        .map(toRepositorySummary),
    };
  },
};
