/**
 * GitLab API response shapes.
 *
 * GitLab's REST API is self-hosted-friendly, so the base URL is configurable
 * rather than hardcoded to gitlab.com — see `client.ts`.
 */

export type GitLabUser = {
  id: number;
  username: string;
  name: string;
  web_url: string;
  avatar_url: string | null;
};

export type GitLabProject = {
  id: number;
  name: string;
  path: string;
  path_with_namespace: string;
  description: string | null;
  web_url: string;
  topics?: string[];
  tag_list?: string[];
  star_count: number;
  forks_count: number;
  last_activity_at: string;
  created_at: string;
  archived: boolean;
  visibility: "private" | "internal" | "public";
  default_branch: string | null;
};

/**
 * Language breakdown, returned as `{ "TypeScript": 72.4, "CSS": 27.6 }`.
 * Percentages already sum to 100.
 */
export type GitLabLanguages = Record<string, number>;

/**
 * A user event — pushes, merge requests, issues.
 *
 * GitLab has no contribution-calendar endpoint, so the heatmap is derived from
 * these. See the mapper for what that does and does not capture.
 */
export type GitLabEvent = {
  id: number;
  action_name: string;
  created_at: string;
};
