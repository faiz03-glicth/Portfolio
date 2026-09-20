/**
 * GitHub API response shapes — REST for profile and repositories, GraphQL for
 * the contribution calendar.
 *
 * Only the fields the mapper reads are declared. These stay inside this
 * directory; nothing outside the adapter sees a GitHub-shaped object.
 */

export type GitHubUser = {
  login: string;
  name: string | null;
  html_url: string;
  public_repos: number;
  followers: number;
};

export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  pushed_at: string | null;
  updated_at: string;
  fork: boolean;
  archived: boolean;
  private: boolean;
};

/**
 * The contribution calendar is only exposed through GraphQL, which requires a
 * token. Without one the heatmap is simply omitted — see the service.
 */
export type GitHubContributionsResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
            }[];
          }[];
        };
      };
    } | null;
  };
  errors?: { message: string }[];
};
