import "server-only";

import type { CodeActivity, Project, Result } from "@/lib/types";
import {
  fetchEvents,
  fetchProjectLanguages,
  fetchProjects,
  fetchUser,
  hasGitLabToken,
  isGitLabConfigured,
} from "./client";
import { toCodeActivity, toProject, toRepositorySummary } from "./mapper";

/**
 * GitLab's public surface — deliberately identical in shape to
 * `githubService`, because both feed the same components.
 */

function isWorthShowing(project: {
  archived: boolean;
  description: string | null;
}): boolean {
  return project.description !== null;
}

export const gitlabService = {
  isConfigured: isGitLabConfigured,
  hasToken: hasGitLabToken,

  async getActivity(): Promise<Result<CodeActivity>> {
    // The user must resolve first: every other endpoint is keyed by numeric
    // user ID, which GitLab will not accept a username for.
    const user = await fetchUser();
    if (!user.ok) return user;

    const [projects, events] = await Promise.all([
      fetchProjects(user.data.id),
      fetchEvents(user.data.id),
    ]);

    if (!projects.ok) return projects;

    // Languages are per project, so sample the most recently active one
    // rather than issuing a request per repository.
    const mostActive = projects.data[0];
    const languages = mostActive
      ? await fetchProjectLanguages(mostActive.id)
      : { ok: true as const, data: {} };

    return {
      ok: true,
      data: toCodeActivity({
        user: user.data,
        projects: projects.data,
        events: events.ok ? events.data : [],
        languages: languages.ok ? languages.data : {},
      }),
    };
  },

  async getProjects(limit = 12): Promise<Result<Project[]>> {
    const user = await fetchUser();
    if (!user.ok) return user;

    const projects = await fetchProjects(user.data.id);
    if (!projects.ok) return projects;

    return {
      ok: true,
      data: projects.data.filter(isWorthShowing).slice(0, limit).map(toProject),
    };
  },

  async getRepositories(limit = 12) {
    const user = await fetchUser();
    if (!user.ok) return user;

    const projects = await fetchProjects(user.data.id);
    if (!projects.ok) return projects;

    return {
      ok: true as const,
      data: projects.data
        .filter(isWorthShowing)
        .slice(0, limit)
        .map(toRepositorySummary),
    };
  },
};
