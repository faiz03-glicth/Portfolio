import type {
  CodeActivity,
  ContributionDay,
  Project,
  RepositorySummary,
} from "@/lib/types";
import type {
  GitHubContributionsResponse,
  GitHubRepository,
  GitHubUser,
} from "./types";

/** GitHub payloads to normalised models. */

export function toRepositorySummary(
  repository: GitHubRepository,
): RepositorySummary {
  return {
    id: `github-${repository.id}`,
    name: repository.name,
    description: repository.description ?? undefined,
    url: repository.html_url,
    source: "github",
    language: repository.language ?? undefined,
    topics: repository.topics,
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    updatedAt: repository.pushed_at ?? repository.updated_at,
  };
}

/**
 * A repository rendered as a project card.
 *
 * `source: "github"` is the only trace of origin that survives. Everything
 * else is the same `Project` shape a database row produces, which is what lets
 * one grid render both.
 */
export function toProject(repository: GitHubRepository): Project {
  const updatedAt = repository.pushed_at ?? repository.updated_at;

  return {
    id: `github-${repository.id}`,
    slug: repository.name.toLowerCase(),
    title: repository.name,
    description: repository.description ?? "No description provided.",
    technologies: [
      // Topics are the closest thing GitHub has to a technology list; the
      // primary language is prepended so there is always at least one chip.
      ...(repository.language ? [repository.language] : []),
      ...(repository.topics ?? []),
    ],
    githubUrl: repository.html_url,
    featured: false,
    type: "web-app",
    status: repository.archived ? "archived" : "shipped",
    startDate: updatedAt,
    source: "github",
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    primaryLanguage: repository.language ?? undefined,
    updatedAt,
  };
}

function toContributionDays(response: GitHubContributionsResponse): {
  days: ContributionDay[];
  total: number;
} {
  const calendar =
    response.data?.user?.contributionsCollection?.contributionCalendar;

  if (!calendar) return { days: [], total: 0 };

  const days = calendar.weeks.flatMap((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
    })),
  );

  return { days, total: calendar.totalContributions };
}

/**
 * Language share, computed from repository counts rather than bytes.
 *
 * GitHub only exposes byte counts through a per-repository endpoint, which
 * would mean one request per repo. Counting repositories is a coarser measure
 * but costs a single request, and the chart is an indication rather than a
 * measurement.
 */
function toLanguageShare(
  repositories: GitHubRepository[],
): { name: string; percentage: number }[] {
  const counts = new Map<string, number>();

  for (const repository of repositories) {
    if (!repository.language) continue;
    counts.set(repository.language, (counts.get(repository.language) ?? 0) + 1);
  }

  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  if (total === 0) return [];

  const ranked = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      percentage: Math.round((count / total) * 100),
    }));

  return ranked;
}

export function toCodeActivity({
  user,
  repositories,
  contributions,
}: {
  user: GitHubUser;
  repositories: GitHubRepository[];
  contributions: GitHubContributionsResponse | null;
}): CodeActivity {
  const calendar = contributions
    ? toContributionDays(contributions)
    : { days: [], total: 0 };

  return {
    provider: "github",
    username: user.login,
    profileUrl: user.html_url,
    publicRepos: user.public_repos,
    followers: user.followers,
    totalStars: repositories.reduce(
      (sum, repository) => sum + repository.stargazers_count,
      0,
    ),
    contributions: calendar.days,
    contributionTotal: calendar.total,
    topLanguages: toLanguageShare(repositories),
  };
}
