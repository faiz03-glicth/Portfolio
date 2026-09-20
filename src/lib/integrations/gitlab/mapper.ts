import type {
  CodeActivity,
  ContributionDay,
  Project,
  RepositorySummary,
} from "@/lib/types";
import type {
  GitLabEvent,
  GitLabLanguages,
  GitLabProject,
  GitLabUser,
} from "./types";

/** GitLab payloads to the same normalised models GitHub produces. */

/** GitLab renamed `tag_list` to `topics`; older instances still send the old key. */
function topicsOf(project: GitLabProject): string[] {
  return project.topics ?? project.tag_list ?? [];
}

export function toRepositorySummary(project: GitLabProject): RepositorySummary {
  return {
    id: `gitlab-${project.id}`,
    name: project.name,
    description: project.description ?? undefined,
    url: project.web_url,
    source: "gitlab",
    topics: topicsOf(project),
    stars: project.star_count,
    forks: project.forks_count,
    updatedAt: project.last_activity_at,
  };
}

export function toProject(project: GitLabProject): Project {
  return {
    id: `gitlab-${project.id}`,
    slug: project.path,
    title: project.name,
    description: project.description ?? "No description provided.",
    technologies: topicsOf(project),
    gitlabUrl: project.web_url,
    featured: false,
    type: "web-app",
    status: project.archived ? "archived" : "shipped",
    startDate: project.created_at,
    source: "gitlab",
    stars: project.star_count,
    forks: project.forks_count,
    updatedAt: project.last_activity_at,
  };
}

/**
 * Builds a contribution calendar from the user's event feed.
 *
 * This is an approximation, and worth being honest about: GitLab exposes no
 * contribution-calendar API, so the grid is assembled from `/events`. That
 * feed covers pushes, merge requests and issues, but not private-project
 * activity the token cannot see, and GitLab caps how far back it will serve.
 * Expect this to undercount relative to the GitHub panel.
 *
 * Every day in the window is emitted, including empty ones, so the grid is a
 * complete rectangle rather than a sparse scatter.
 */
export function toContributionDays(
  events: GitLabEvent[],
  days = 371,
): { days: ContributionDay[]; total: number } {
  const counts = new Map<string, number>();

  for (const event of events) {
    const date = event.created_at.slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }

  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  // Align the last column to a Sunday so weeks render as clean columns.
  end.setUTCDate(end.getUTCDate() - end.getUTCDay());

  const calendar: ContributionDay[] = [];
  let total = 0;

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - offset);

    const key = date.toISOString().slice(0, 10);
    const count = counts.get(key) ?? 0;

    total += count;
    calendar.push({ date: key, count });
  }

  return { days: calendar, total };
}

/** GitLab returns percentages directly, so this only ranks and truncates. */
function toLanguageShare(
  languages: GitLabLanguages,
): { name: string; percentage: number }[] {
  return Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, percentage]) => ({
      name,
      percentage: Math.round(percentage),
    }));
}

export function toCodeActivity({
  user,
  projects,
  events,
  languages,
}: {
  user: GitLabUser;
  projects: GitLabProject[];
  events: GitLabEvent[];
  languages: GitLabLanguages;
}): CodeActivity {
  const calendar = toContributionDays(events);

  return {
    provider: "gitlab",
    username: user.username,
    profileUrl: user.web_url,
    publicRepos: projects.length,
    totalStars: projects.reduce((sum, project) => sum + project.star_count, 0),
    contributions: calendar.days,
    contributionTotal: calendar.total,
    topLanguages: toLanguageShare(languages),
  };
}
